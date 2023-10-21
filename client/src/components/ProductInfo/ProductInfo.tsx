import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import classNames from 'classnames';
import { useState } from 'react';

import classes from './ProductInfo.module.css';
import ButtonLink from '../UI/ButtonLink/ButtonLink';
import ErrorIcon from '../UI/Icons/ErrorIcon';
import Loading from '../UI/Loading/Loading';
import Layout from '../Layout/Layout';
import ProductImages from './ProductImages/ProductImages';
import SelectedImage from './SelectedImage/SelectedImage';
import ProductDescription from './ProductDescription/ProductDescription';
import { GET_PRODUCT_BY_ID_NO_AUTH } from '../../graphql/queries/getProductById';

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
    const { productId } = useParams();
    const [selectedImage, setSelectedImage] = useState<0 | 1>(0);

    const isValidId = !Number.isNaN(+productId!);

    // if 'id' is a string
    if (!isValidId) return createErrorBlock('Invalid product identifier');

    let { loading, error, data } = useQuery(GET_PRODUCT_BY_ID_NO_AUTH, {
        variables: { productId: +productId! },
    });

    if (error) {
        return createErrorBlock(
            error?.message === 'Product not found'
                ? 'Product not found'
                : 'Something went wrong while loading the product'
        );
    }

    if (loading) {
        return (
            <div className="flex-wrapper">
                <Loading />
            </div>
        );
    }

    // by this point the data has been loaded
    data = data!;
    const {
        title,
        price,
        initialImageUrl,
        additionalImageUrl,
        isAvailable,
        isRunningOut,
        shortDescription,
    } = data.product!;

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
                    title={title}
                    price={price}
                    shortDescription={shortDescription}
                    isProductAvailable={isAvailable}
                    isProductRunningOut={isRunningOut}
                />
            </article>
        </Layout>
    );
};

export default ProductInfo;
