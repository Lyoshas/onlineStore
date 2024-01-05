import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteCartProductMutation } from '../../../../store/apis/cartApi';
import useApiError from '../../../hooks/useApiError';
import { cartModalActions } from '../../../../store/slices/cartModal';
import { errorActions } from '../../../../store/slices/error';
import apolloClient from '../../../../graphql/client';

const useCartProductDelete = (productId: number) => {
    const dispatch = useDispatch();
    const [
        _deleteCartProduct,
        {
            isError: isDeleteCartProductError,
            error: deleteCartProductError,
            isLoading: isDeleteCartProductLoading,
            isSuccess: isDeleteCartProductSuccess,
            isUninitialized: isDeleteCartProductUninitialized,
        },
    ] = useDeleteCartProductMutation({
        // setting "fixedCacheKey" prevents a bug where multiple cached products get affected when only one should be affected
        fixedCacheKey: `delete-cart-product-${productId}`,
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
            id: `Product:${productId}`,
            fields: {
                isInTheCart() {
                    return false;
                },
            },
        });
    }, [isDeleteCartProductSuccess, productId]);

    const deleteCartProduct = () => {
        _deleteCartProduct({ productId });
    };

    return { deleteCartProduct };
};

export default useCartProductDelete;
