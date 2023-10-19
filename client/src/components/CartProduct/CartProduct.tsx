import { FC, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import ICartProduct from '../../interfaces/CartProduct';
import classes from './CartProduct.module.css';
import QuantitySelector from '../QuantitySelector/QuantitySelector';
import AdditionalOptions from './AdditionalOptions/AdditionalOptions';
import useDebounce from '../hooks/useDebounce';
import {
    useDeleteCartProductMutation,
    useUpsertCartProductMutation,
} from '../../store/apis/cartApi';
import useApiError from '../hooks/useApiError';
import { errorActions } from '../../store/slices/error';
import useNumberRange from '../hooks/useNumberRange';
import apolloClient from '../../graphql/client';
import { cartModalActions } from '../../store/slices/cartModal';

type CartProductProps = ICartProduct & {
    // the parent component must pass a function that will be executed each time the product is added to the cart or is removed from the cart
    // "isLoading" will be used by the parent component to show a loading screen
    onCartLoadingChange: (isLoading: boolean) => void;
};

const CartProduct: FC<CartProductProps> = (props) => {
    const dispatch = useDispatch();
    const [
        upsertCartProduct,
        {
            isSuccess: isUpsertSuccessful,
            isError: isUpsertError,
            error: productUpsertError,
            isLoading: isUpserting,
        },
    ] = useUpsertCartProductMutation();
    const [
        deleteCartProduct,
        {
            isError: isDeleteCartProductError,
            error: deleteCartProductError,
            isLoading: isDeleteCartProductLoading,
            isSuccess: isDeleteCartProductSuccess,
            isUninitialized: isDeleteCartProductUninitialized,
        },
    ] = useDeleteCartProductMutation({
        // setting "fixedCacheKey" prevents a bug where multiple cached products get affected when only one should be affected
        fixedCacheKey: `delete-cart-product-${props.productId}`,
    });
    const upsertErrorResponse = useApiError(isUpsertError, productUpsertError, [
        409,
    ]);
    const deleteErrorResponse = useApiError(
        isDeleteCartProductError,
        deleteCartProductError,
        []
    );
    const {
        debouncedFunction: debouncedUpsertCartProduct,
        cancelDebouncedExecution,
    } = useDebounce(
        useCallback(
            (newQuantity: number) => {
                upsertCartProduct({
                    productId: props.productId,
                    quantity: newQuantity,
                });
            },
            [props.productId]
        ),
        500,
        false
    );
    const productQuantityInitialValue: number = props.quantity;
    const {
        currentValue: currentProductQuantity,
        incrementValue: incrementProductQuantity,
        decrementValue: decrementProductQuantity,
        setValue: setProductQuantity,
        isValueChanged: isProductQuantityChanged,
    } = useNumberRange({
        minValue: 1,
        maxValue: 32767,
        initialValue: productQuantityInitialValue,
    });

    // "lastValidQuantity" will be used to roll back the QuantitySelector component's displayed product quantity to the last valid number if the user attempts to add too many products to the cart
    const [lastValidQuantity, setLastValidQuantity] = useState<number>(
        productQuantityInitialValue
    );

    useEffect(() => {
        // if the product quantity wasn't changed using "incrementValue", "decrementValue", "setValue",
        // then do nothing
        if (!isProductQuantityChanged) return;

        // otherwise add the product to the cart
        debouncedUpsertCartProduct(currentProductQuantity);
    }, [isProductQuantityChanged, currentProductQuantity]);

    useEffect(() => {
        if (currentProductQuantity !== lastValidQuantity) return;
        cancelDebouncedExecution();
    }, [currentProductQuantity, lastValidQuantity]);

    useEffect(() => {
        props.onCartLoadingChange(isUpserting || isDeleteCartProductLoading);
    }, [isUpserting, isDeleteCartProductLoading]);

    useEffect(() => {
        if (isUpsertSuccessful) setLastValidQuantity(props.quantity);
    }, [isUpsertSuccessful, props.quantity]);

    const rollbackProductQuantity = useCallback(() => {
        setProductQuantity(lastValidQuantity);
    }, [lastValidQuantity]);

    useEffect(() => {
        if (upsertErrorResponse === null) return;

        const apiErrorMessage =
            upsertErrorResponse.serverResponse.errors[0].message;
        let errorMessageToDisplay: string;

        switch (apiErrorMessage) {
            case 'insufficient stock available for this product':
                errorMessageToDisplay =
                    apiErrorMessage[0].toUpperCase() + apiErrorMessage.slice(1);
                break;
            case 'more products are added to the cart than allowed':
                errorMessageToDisplay = `Only ${
                    (upsertErrorResponse.serverResponse.errors[0] as any)
                        .maximumAllowedProducts
                } units of this product can be added to the cart`;
                break;
            default:
                errorMessageToDisplay =
                    'Something went wrong while changing the product quantity';
        }

        rollbackProductQuantity();
        dispatch(errorActions.showNotificationError(errorMessageToDisplay));
    }, [upsertErrorResponse]);

    useEffect(() => {
        if (deleteErrorResponse === null) return;

        dispatch(
            errorActions.showNotificationError(
                'Something went wrong while deleting the product from the cart'
            )
        );
    }, [deleteErrorResponse]);

    useEffect(() => {
        if (!isDeleteCartProductSuccess) return;
        // modifying the GraphQL cache associated with the deleted cart product
        apolloClient.cache.modify({
            id: `Product:${props.productId}`,
            fields: {
                isInTheCart() {
                    return false;
                },
            },
        });
    }, [isDeleteCartProductSuccess, props.productId]);

    const handleCartProductDelete = () => {
        deleteCartProduct({ productId: props.productId });
    };

    const handleLinkClick = () => {
        dispatch(cartModalActions.hideCartModal());
    };

    return (
        <div
            className={classNames(classes['cart-product'], classes['loading'])}
        >
            <div className={classes['cart-product-body']}>
                <Link
                    to={`/products/${props.productId}`}
                    className={classes['cart-product__img-block']}
                    onClick={handleLinkClick}
                >
                    <img
                        src={props.initialImageUrl}
                        className={classes['cart-product__img']}
                        alt="Cart product image"
                    />
                </Link>
                <Link
                    to={`/products/${props.productId}`}
                    className={classes['cart-product__title']}
                    onClick={handleLinkClick}
                >
                    {props.title}
                </Link>
                <AdditionalOptions
                    onDeleteProductFromCart={handleCartProductDelete}
                />
            </div>
            <div className={classes['cart-product-footer']}>
                <QuantitySelector
                    currentValue={currentProductQuantity}
                    onIncrementValue={incrementProductQuantity}
                    onDecrementValue={decrementProductQuantity}
                    onSetValue={setProductQuantity}
                    className={
                        classes['cart-product-footer__quantity-selector-block']
                    }
                />
                <p className={classes['cart-product-footer__price']}>
                    {props.price} ₴
                </p>
            </div>
        </div>
    );
};

export default CartProduct;
