import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

import Loading from '../UI/Loading/Loading';
import ErrorMessage from './ErrorMessage/ErrorMessage';
import SuccessMessage from './SuccessMessage/SuccessMessage';
import EditProductForm from './EditProductForm/EditProductForm';
import CenterBlock from '../UI/CenterBlock/CenterBlock';
import classes from './EditProduct.module.css';
import GET_ADMIN_PRODUCT_DETAILS from './GraphQL/getProductRequest';
import UPDATE_PRODUCT from './GraphQL/updateProductRequest';
import { useProductCategoriesQuery } from '../../store/apis/productCategoryApi';
import {
    OnFormSubmitArgs as OnAddProductArgs,
    OnFormSubmitArgs,
} from '../AddProductForm/AddProductForm';
import apolloClient from '../../graphql/client';
import GET_PRODUCT_BY_ID from '../ProductInfo/GraphQL/GetProductByIdRequest';
import useImageUpload from '../hooks/useImageUpload';
import deriveErrorMessage from '../../util/deriveErrorMessage';

const EditProduct = () => {
    const { productId } = useParams();
    let {
        loading: isProductInfoLoading,
        error: productInfoError,
        data: productDetailsData,
    } = useQuery(GET_ADMIN_PRODUCT_DETAILS, {
        variables: { productId: +productId! },
    });
    const {
        isLoading: areProductCategoriesLoading,
        error: productCategoriesError,
        data: productCategories,
    } = useProductCategoriesQuery();
    const {
        isUploading: isInitialImageUploading,
        uploadImage: uploadInitialImageToS3,
        errorMessage: initialImageUploadError,
        fileName: initialImageName,
        wasImageUploadSuccessful: wasInitialImageUploadSuccessful,
    } = useImageUpload();
    const {
        isUploading: isAdditionalImageUploading,
        uploadImage: uploadAdditionalImageToS3,
        errorMessage: additionalImageUploadError,
        fileName: additionalImageName,
        wasImageUploadSuccessful: wasAdditionalImageUploadSuccessful,
    } = useImageUpload();
    let [
        updateProduct,
        {
            loading: isUpdateRequestLoading,
            error: updateProductError,
            data: updateProductData,
        },
    ] = useMutation(UPDATE_PRODUCT);
    // "null" means that the form hasn't been submitted yet
    const [formData, setFormData] = useState<OnFormSubmitArgs | null>(null);
    // specifies whether to include initial/additional images in the update request or simply preserve the images that were uploaded before
    const [includeInitialImage, setIncludeInitialImage] = useState<
        boolean | null
    >(null);
    const [includeAdditionalImage, setIncludeAdditionalImage] = useState<
        boolean | null
    >(null);

    useEffect(() => {
        async function main() {
            if (
                !formData ||
                includeInitialImage === null ||
                includeAdditionalImage === null ||
                // if 'includeInitialImage' is set to 'true', but the image upload hasn't been finished yet
                (includeInitialImage && !initialImageName) ||
                // if 'includeAdditionalImage' is set to 'true', but the image upload hasn't been finished yet
                (includeAdditionalImage && !additionalImageName) ||
                !productDetailsData
                // if the user attached an image but it hasn't been uploaded yet, skip the execution
                // (formData.initialImageInfo.size !== 0 &&
                //     !wasInitialImageUploadSuccessful) ||
                // (formData.additionalImageInfo.size !== 0 &&
                //     !wasAdditionalImageUploadSuccessful) ||
                // (wasInitialImageUploadSuccessful && !initialImageName) ||
                // (wasAdditionalImageUploadSuccessful && !additionalImageName)
            )
                return;

            const {
                title,
                price,
                category,
                quantityInStock,
                shortDescription,
            } = formData;

            const updatedProductResult = await updateProduct({
                variables: {
                    id: +productId!,
                    title,
                    price: +price,
                    category,
                    quantityInStock: +quantityInStock,
                    shortDescription,
                    initialImageName:
                        includeInitialImage && initialImageName
                            ? initialImageName
                            : productDetailsData.adminProduct.initialImageName,
                    additionalImageName:
                        includeAdditionalImage && additionalImageName
                            ? additionalImageName
                            : productDetailsData.adminProduct
                                  .additionalImageName,
                },
            });
            const updatedProduct = updatedProductResult.data!.updateProduct;

            // after the product was updated it's necessary to update the cache
            // otherwise the product data will be stale

            // updating cache associated with "query AdminProduct($productId: Int!)"
            // const initialImageUrl = updatedProduct.initialImageUrl;
            // const additionalImageUrl = updatedProduct.additionalImageUrl;
            // apolloClient.writeQuery({
            //     query: GET_ADMIN_PRODUCT_DETAILS,
            //     data: {
            //         adminProduct: {
            //             title,
            //             price,
            //             category,
            //             initialImageUrl,
            //             additionalImageUrl,
            //             quantityInStock,
            //             shortDescription,
            //         },
            //     },
            //     variables: { productId: +productId! },
            // });
            // // updating cache associated with "query Product($productId: Int!)" if it exists
            // // this query is used when the user tries to go to the product details page
            // apolloClient.writeQuery({
            //     query: GET_PRODUCT_BY_ID,
            //     data: {
            //         product: {
            //             title,
            //             price,
            //             initialImageUrl,
            //             additionalImageUrl,
            //             isAvailable: updatedProduct.isAvailable,
            //             isRunningOut: updatedProduct.isRunningOut,
            //             shortDescription,
            //         },
            //     },
            //     variables: { productId: +productId! },
            // });
        }

        main();
    }, [
        wasInitialImageUploadSuccessful,
        wasAdditionalImageUploadSuccessful,
        formData,
        initialImageName,
        additionalImageName,
    ]);

    if (
        isProductInfoLoading ||
        areProductCategoriesLoading ||
        isInitialImageUploading ||
        isAdditionalImageUploading
    ) {
        return (
            <div className="flex-wrapper">
                <Loading />
            </div>
        );
    }

    if (
        productInfoError ||
        updateProductError ||
        productCategoriesError ||
        initialImageUploadError ||
        additionalImageUploadError
    ) {
        const errorMessage =
            initialImageUploadError ||
            additionalImageUploadError ||
            deriveErrorMessage(productCategoriesError) ||
            productInfoError?.message ||
            updateProductError?.message;

        const message = `Something went wrong while ${
            initialImageUploadError
                ? 'uploading the initial image'
                : additionalImageUploadError
                ? 'uploading the additional image'
                : productInfoError
                ? 'loading the product data'
                : updateProductError
                ? 'editing the product'
                : 'loading product categories'
        }.\n${errorMessage}`;

        return <ErrorMessage message={message} />;
    }

    // if the product was updated successfully
    if (updateProductData) {
        return <SuccessMessage />;
    }

    // by this point we have the product details
    const product = productDetailsData!.adminProduct!;

    const handleEditProduct = async (formData: OnAddProductArgs) => {
        setFormData(formData);

        const isInitialImageAttached =
            !!formData.initialImageInput.files &&
            formData.initialImageInput.files.length > 0;
        const isAdditionalImageAttached =
            !!formData.additionalImageInput.files &&
            formData.additionalImageInput.files.length > 0;

        if (isInitialImageAttached) {
            uploadInitialImageToS3(formData.initialImageInput.files![0]);
        }

        if (isAdditionalImageAttached) {
            uploadAdditionalImageToS3(formData.additionalImageInput.files![0]);
        }

        setIncludeInitialImage(isInitialImageAttached);
        setIncludeAdditionalImage(isAdditionalImageAttached);
    };

    return (
        <CenterBlock className={classes['edit-product-block']}>
            <EditProductForm
                // passing information about the product
                product={{ id: +productId!, ...product }}
                availableCategories={productCategories!.categories}
                // passing whether the edit request is loading
                isUpdateRequestLoading={isUpdateRequestLoading}
                // passing the function that will be called to initiate the API request
                onEditProduct={handleEditProduct}
            />
        </CenterBlock>
    );
};

export default EditProduct;
