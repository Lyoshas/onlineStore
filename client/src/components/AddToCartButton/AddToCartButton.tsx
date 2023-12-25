import { FC, useEffect, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import classNames from 'classnames';

import Button from '../UI/Button/Button';
import classes from './AddToCartButton.module.css';
import getStaticAssetUrl from '../../util/getStaticAssetUrl';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import { useUpsertCartProductMutation } from '../../store/apis/cartApi';
import useApiError from '../hooks/useApiError';
import { errorActions } from '../../store/slices/error';
import ServerErrorResponse from '../../interfaces/ServerErrorResponse';
import Loading from '../UI/Loading/Loading';
import apolloClient from '../../graphql/client';
import { cartModalActions } from '../../store/slices/cartModal';

function includesError(
    errorMessage: string,
    allErrors: ServerErrorResponse
): boolean {
    return allErrors.errors.some((error) => error.message === errorMessage);
}

interface AddToCartButtonProps {
    productId: number;
    // "isInTheCart" indicates whether an item is already in the cart
    isInTheCart?: boolean;
    addLabels?: boolean;
    className?: string;
}

const AddToCartButton: FC<AddToCartButtonProps> = ({
    addLabels = false,
    ...props
}) => {
    const [
        upsertCartProduct,
        {
            isSuccess: isUpsertSuccessful,
            isError: isUpsertError,
            error: productUpsertError,
            isLoading: isUpserting,
        },
    ] = useUpsertCartProductMutation();
    const upsertErrorResponse = useApiError(
        isUpsertError,
        productUpsertError,
        [422, 409]
    );
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isUpsertSuccessful) return;

        // since we've added this product to the cart, we need to modify the local cache so that the user sees that the product was indeed added to the cart
        // this doesn't cause any new API requests to the server
        apolloClient.cache.modify({
            id: `Product:${props.productId}`,
            fields: {
                // modifying the "isInTheCart" field to be "true", because we've just added this product to the cart
                isInTheCart() {
                    return true;
                },
            },
        });
    }, [isUpsertSuccessful, apolloClient, props.productId]);

    useEffect(() => {
        if (!upsertErrorResponse) return;

        const serverErrorResponse = upsertErrorResponse.serverResponse;

        let errorMessage =
            'Something went wrong while adding the product to the cart';
        const insufficientStockMessage =
            'insufficient stock available for this product';

        if (includesError(insufficientStockMessage, serverErrorResponse)) {
            errorMessage =
                insufficientStockMessage[0].toUpperCase() +
                insufficientStockMessage.slice(1);
        }

        dispatch(errorActions.showNotificationError(errorMessage));
    }, [upsertErrorResponse]);

    const handleAddToCart = () => {
        upsertCartProduct({ productId: props.productId, quantity: 1 });
    };

    const showCartItems = () => {
        dispatch(cartModalActions.showCartModal());
    };

    const cartImg = (
        <img
            className={classes['cart-btn__icon']}
            src={getStaticAssetUrl(
                props.isInTheCart ? 'added-to-cart.svg' : 'add-to-cart.svg'
            )}
            alt="Cart"
        />
    );

    const className = classNames(
        classes['product-item__cart-btn'],
        addLabels && classes['text-offset'],
        props.className
    );

    // if the "isInTheCart" property wasn't provided, then the user isn't authenticated
    if (props.isInTheCart == null) {
        return (
            <ButtonLink to="/auth/sign-in" className={className}>
                {cartImg}
                {addLabels && 'Add to cart'}
            </ButtonLink>
        );
    }

    return (
        <Button
            className={className}
            onClick={
                // if an item is being added to the cart, the user can't do anything
                isUpserting
                    ? function () {}
                    : // if the addition to the cart was successful OR the item was already in the cart, the user can only view existing cart items
                    props.isInTheCart
                    ? showCartItems
                    : // otherwise the user can add an item to the cart
                      handleAddToCart
            }
        >
            {isUpserting ? (
                <Loading width="30px" height="30px" />
            ) : (
                <Fragment>
                    {cartImg}
                    {addLabels
                        ? props.isInTheCart
                            ? 'In cart'
                            : 'Add to cart'
                        : ''}
                </Fragment>
            )}
        </Button>
    );
};

export default AddToCartButton;
