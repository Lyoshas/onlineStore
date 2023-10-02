import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Button from '../UI/Button/Button';
import classes from './AddToCartButton.module.css';
import getStaticAssetUrl from '../../util/getStaticAssetUrl';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import { usePushToCartMutation } from '../../store/apis/cartApi';
import useApiError from '../hooks/useApiError';
import { errorActions } from '../../store/slices/error';
import ServerErrorResponse from '../../interfaces/ServerErrorResponse';
import Loading from '../UI/Loading/Loading';
import apolloClient from '../../graphql/client';

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
}

const AddToCartButton: FC<AddToCartButtonProps> = (props) => {
    const [
        pushToCart,
        {
            isSuccess: isPushToCartSuccess,
            isError: isPushToCartError,
            error: pushToCartError,
            isLoading: isPushingToCart,
        },
    ] = usePushToCartMutation();
    const pushToCartErrorResponse = useApiError(
        isPushToCartError,
        pushToCartError,
        [422, 409]
    );
    const dispatch = useDispatch();

    useEffect(() => {
        if (!isPushToCartSuccess) return;

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
    }, [isPushToCartSuccess, apolloClient, props.productId]);

    useEffect(() => {
        if (!pushToCartErrorResponse) return;

        const serverErrorResponse = pushToCartErrorResponse.serverResponse;

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
    }, [pushToCartErrorResponse]);

    const handleAddToCart = () => {
        pushToCart({ productId: props.productId, quantity: 1 });
    };

    const showCartItems = () => {
        console.log('showing cart items...');
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

    // if the "isInTheCart" property wasn't provided, then the user isn't authenticated
    return props.isInTheCart == null ? (
        <ButtonLink
            to="/auth/sign-in"
            className={classes['product-item__cart-btn']}
        >
            {cartImg}
        </ButtonLink>
    ) : (
        <Button
            className={classes['product-item__cart-btn']}
            onClick={
                // if an item is being added to the cart, the user can't do anything
                isPushingToCart
                    ? function () {}
                    // if the addition to the cart was successful OR the item was already in the cart, the user can only view existing cart items
                    : isPushToCartSuccess || props.isInTheCart
                    ? showCartItems
                    // otherwise the user can add an item to the cart
                    : handleAddToCart
            }
        >
            {isPushingToCart ? <Loading width="30px" height="30px" /> : cartImg}
        </Button>
    );
};

export default AddToCartButton;
