import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteCartProductMutation } from '../../../../store/apis/cartApi';
import Button from '../../../UI/Button/Button';
import classes from './CartProductDeleteButton.module.css';
import useApiError from '../../../hooks/useApiError';
import { cartModalActions } from '../../../../store/slices/cartModal';
import { errorActions } from '../../../../store/slices/error';
import apolloClient from '../../../../graphql/client';

const CartProductDeleteButton: FC<{ productId: number }> = (props) => {
    const dispatch = useDispatch();
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

    const deleteErrorResponse = useApiError(
        isDeleteCartProductError,
        deleteCartProductError,
        []
    );

    useEffect(() => {
        dispatch(
            cartModalActions.setIsApiRequestLoading(isDeleteCartProductLoading)
        );
    }, [isDeleteCartProductLoading]);

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

    return (
        <Button
            className={classes['cart-product__delete-from-cart-btn']}
            onClick={handleCartProductDelete}
        >
            <img
                className={classes['delete-from-cart-btn__img']}
                src={
                    'https://onlinestore-react-assets.s3.eu-north-1.amazonaws.com/delete-icon.svg'
                }
                alt="Delete icon"
            />
            Delete
        </Button>
    );
};

export default CartProductDeleteButton;
