import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteCartProductMutation } from '../../../../store/apis/cartApi';
import useApiError from '../../../hooks/useApiError';
import { cartModalActions } from '../../../../store/slices/cartModal';
import { errorActions } from '../../../../store/slices/error';
import apolloClient from '../../../../graphql/client';
import { localCartActions } from '../../../../store/slices/localCart';

// this hook must only be used by authenticated users
const useCartProductDelete = (productId: number) => {
    const dispatch = useDispatch();
    const [
        _deleteCartProduct,
        {
            isError: isDeleteCartProductError,
            error: deleteCartProductError,
            isLoading: isDeleteCartProductLoading,
            isSuccess: isDeleteCartProductSuccess,
            reset: resetRequestState,
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
                'Щось пішло не так під час видалення товару з кошика'
            )
        );
    }, [deleteErrorResponse]);

    useEffect(() => {
        if (!isDeleteCartProductSuccess) return;
        // modifying the GraphQL cache associated with the deleted cart product
        for (let graphqlPrefix of [
            'ProductInfoWithReviews',
            'ProductInfoWithoutReviews',
        ]) {
            apolloClient.cache.modify({
                id: `${graphqlPrefix}:${productId}`,
                fields: {
                    // modifying the "isInTheCart" field to be "false", because we've just deleted this product from the cart
                    isInTheCart() {
                        return false;
                    },
                },
            });
        }
        dispatch(localCartActions.deleteCartProduct({ productId }));
        // there was a bug where a user authenticates, adds a product to the cart from the main page, then deletes it from the cart, then logs out, and then adds this product to the cart again. This would cause the product to be deleted
        resetRequestState();
    }, [isDeleteCartProductSuccess, productId]);

    const deleteCartProduct = () => {
        _deleteCartProduct({ productId });
    };

    return { deleteCartProduct };
};

export default useCartProductDelete;
