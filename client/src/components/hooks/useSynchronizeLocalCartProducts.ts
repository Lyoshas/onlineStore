import { useSelector, useStore } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { RootState } from '../../store';
import { useSynchronizeLocalCartWIthApiMutation } from '../../store/apis/cartApi';
import { localCartActions } from '../../store/slices/localCart';

const useSynchronizeLocalCartProducts = () => {
    const dispatch = useDispatch();
    const [synchronizeLocalCartWithAPI, { isError, error, isSuccess }] =
        useSynchronizeLocalCartWIthApiMutation();
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const [wasUserAnonymous, setWasUserAnonymous] = useState<boolean>(false);
    const store = useStore<RootState>();

    const sendRequest = useCallback(() => {
        // we need to get the local cart from Redux directly,
        // otherwise if we used "useSelector", we'd need to include the cart in the dependency array,
        // which would trigger unnecessary API requests
        const cartProducts = store.getState().localCart.products;
        const requestArg: { productId: number; quantity: number }[] = [];

        for (let cartProduct of Object.values(cartProducts)) {
            requestArg.push({
                productId: cartProduct!.productId,
                quantity: cartProduct!.quantity,
            });
        }

        return synchronizeLocalCartWithAPI(requestArg);
    }, [store, synchronizeLocalCartWithAPI]);

    useEffect(() => {
        // 'isAuthenticated' can be null
        if (isAuthenticated === false) setWasUserAnonymous(true);
    }, [isAuthenticated, setWasUserAnonymous]);

    useEffect(() => {
        let request: ReturnType<typeof synchronizeLocalCartWithAPI> | null =
            null;

        // if the user was ever unauthenticated and now they are authenticated, send the API request
        if (wasUserAnonymous && isAuthenticated) {
            request = sendRequest();
        }

        return () => {
            if (request !== null) request.abort();
        };
    }, [isAuthenticated, wasUserAnonymous, sendRequest]);

    useEffect(() => {
        // if this is an error returned by the API, remove all products in the local cart, because they are corrupted
        if (isError && error && 'data' in error) {
            dispatch(localCartActions.emptyCart());
        }
    }, [isError, error]);
};

export default useSynchronizeLocalCartProducts;
