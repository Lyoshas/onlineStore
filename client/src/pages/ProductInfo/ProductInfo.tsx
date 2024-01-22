import { useParams } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import classes from './ProductInfo.module.css';
import ButtonLink from '../../components/UI/ButtonLink/ButtonLink';
import ErrorIcon from '../../components/UI/Icons/ErrorIcon';
import Layout from '../../components/Layout/Layout';
import ProductImages from './ProductImages/ProductImages';
import SelectedImage from './SelectedImage/SelectedImage';
import ProductDescription from './ProductDescription/ProductDescription';
import {
    GET_PRODUCT_BY_ID_WITH_AUTH,
    GET_PRODUCT_BY_ID_NO_AUTH,
} from '../../graphql/queries/getProductById';
import { RootState } from '../../store';
import {
    GetProductByIdNoAuthQuery,
    GetProductByIdWithAuthQuery,
} from '../../__generated__/graphql';
import LoadingScreen from '../../components/UI/LoadingScreen/LoadingScreen';

const createErrorBlock = (errorMessage: string) => {
    return (
        <div className={classNames('flex-wrapper', classes['error-block'])}>
            <ErrorIcon className="icon" />
            <p className={classes['error-message__title']}>{errorMessage}</p>
            <ButtonLink to="/">Home</ButtonLink>
        </div>
    );
};

const ProductInfo = () => {
    const { productId: stringProductId } = useParams();
    const [selectedImage, setSelectedImage] = useState<0 | 1>(0);
    const isAuthenticated = useSelector(
        (state: RootState) => state.auth.isAuthenticated
    );
    const localCart = useSelector(
        (state: RootState) => state.localCart.products
    );

    const productId: number = +stringProductId!;
    const isValidId = !Number.isNaN(productId);

    // if 'id' is a string
    if (!isValidId) return createErrorBlock('Invalid product identifier');

    let [
        getProductByIdNoAuth,
        {
            loading: getProductNoAuthLoading,
            error: getProductNoAuthError,
            data: getProductNoAuthData,
            called: isGetProductNoAuthCalled,
        },
    ] = useLazyQuery(GET_PRODUCT_BY_ID_NO_AUTH, {
        variables: { productId },
    });
    let [
        getProductByIdWithAuth,
        {
            loading: getProductWithAuthLoading,
            error: getProductWithAuthError,
            data: getProductWithAuthData,
            called: isGetProductWithAuthCalled,
        },
    ] = useLazyQuery(GET_PRODUCT_BY_ID_WITH_AUTH, {
        variables: { productId },
    });

    useEffect(() => {
        if (isAuthenticated === null) return;
        isAuthenticated ? getProductByIdWithAuth() : getProductByIdNoAuth();
    }, [isAuthenticated, productId]);

    // if the auth status hasn't been determined yet or if one of the requests are loading
    if (
        isAuthenticated === null ||
        getProductNoAuthLoading ||
        getProductWithAuthLoading ||
        (!isGetProductNoAuthCalled && !isGetProductWithAuthCalled)
    ) {
        return <LoadingScreen />;
    }

    if (getProductNoAuthError || getProductWithAuthError) {
        const productNotFoundMessage =
            'A product with the specified id does not exist';
        return createErrorBlock(
            getProductNoAuthError?.message === productNotFoundMessage ||
                getProductWithAuthError?.message === productNotFoundMessage
                ? productNotFoundMessage
                : 'Something went wrong while loading the product'
        );
    }

    // by this point the data has been loaded
    let tempProductData: (
        | GetProductByIdNoAuthQuery['product']
        | GetProductByIdWithAuthQuery['product']
    ) & { isInTheCart?: boolean } =
        getProductNoAuthData?.product! || getProductWithAuthData?.product!;

    const productData: typeof tempProductData & { isInTheCart: boolean } = {
        ...tempProductData,
        // if the user is authenticated, keep the previous 'isInTheCart' value, otherwise check the local cart stored in localStorage
        isInTheCart: tempProductData.isInTheCart ?? productId in localCart,
    };

    const {
        title,
        price,
        initialImageUrl,
        additionalImageUrl,
        isAvailable,
        isRunningOut,
        shortDescription,
        isInTheCart,
    } = productData!;

    const productImages = [initialImageUrl, additionalImageUrl];
    const onNextImage = () => {
        setSelectedImage((prevImage) => {
            let result = prevImage + 1;
            return (result > 1 ? 0 : result) as 0 | 1;
        });
    };
    const onPreviousImage = () => {
        setSelectedImage((prevImage) => {
            let result = prevImage - 1;
            return (result < 0 ? 1 : result) as 0 | 1;
        });
    };
    const onSelectImage = (imageIndex: 0 | 1) => setSelectedImage(imageIndex);

    // <article> - a self-contained piece of content that can be independently distributed or reused
    return (
        <Layout className={classes['product-info-layout']}>
            <article className={classes['product-info']}>
                <ProductImages
                    initialImageUrl={initialImageUrl}
                    additionalImageUrl={additionalImageUrl}
                    selectedImage={selectedImage}
                    onSelectImage={onSelectImage}
                />
                <SelectedImage
                    currentImageUrl={productImages[selectedImage]}
                    onNextImage={onNextImage}
                    onPreviousImage={onPreviousImage}
                />
                <ProductDescription
                    productId={productId}
                    title={title}
                    price={price}
                    initialImageUrl={initialImageUrl}
                    shortDescription={shortDescription}
                    isProductAvailable={isAvailable}
                    isProductRunningOut={isRunningOut}
                    isInTheCart={isInTheCart}
                />
            </article>
        </Layout>
    );
};

export default ProductInfo;
