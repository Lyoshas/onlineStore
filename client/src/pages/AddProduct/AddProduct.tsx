import { useEffect, useState } from 'react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query';
import { SerializedError } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from '@apollo/client';

import { useProductCategoriesQuery } from '../../store/apis/productCategoryApi';
import Loading from '../../components/UI/Loading/Loading';
import ErrorMessageBlock from '../../components/UI/ErrorMessageBlock/ErrorMessageBlock';
import { useLazyGetPresignedUrlForUploadQuery } from '../../store/apis/s3PresignedApi';
import ServerErrorResponse from '../../interfaces/ServerErrorResponse';
import AddProductForm, {
    OnFormSubmitArgs,
} from '../../components/AddProductForm/AddProductForm';
import { useUploadImageToS3Mutation } from '../../store/apis/s3UploadApi';
import ADD_PRODUCT from './graphql/addProduct';
import SuccessMessage from './SuccessMessage/SuccessMessage';

const deriveErrorMessage = (
    error: FetchBaseQueryError | SerializedError | undefined
) => {
    return error && 'data' in error
        ? (error.data as ServerErrorResponse).errors[0].message
        : null;
};

const AddProduct = () => {
    const {
        isLoading: areProductCategoriesLoading,
        error: productCategoriesError,
        data: productCategories,
    } = useProductCategoriesQuery();
    const [
        getPresignedUrlForUploadingInitialImage,
        {
            isFetching: isFirstPresignedUrlFetching,
            data: firstPresignedUrlInfo,
            error: firstPresignedUrlError,
        },
    ] = useLazyGetPresignedUrlForUploadQuery();
    const [
        getPresignedUrlForUploadingAdditionalImage,
        {
            isFetching: isSecondPresignedUrlFetching,
            data: secondPresignedUrlInfo,
            error: secondPresignedUrlError,
        },
    ] = useLazyGetPresignedUrlForUploadQuery();
    const [
        uploadInitialImageToS3,
        {
            isLoading: isInitialImageUploading,
            error: initialImageUploadError,
            isSuccess: wasInitialImageUploadSuccessful,
        },
    ] = useUploadImageToS3Mutation();
    const [
        uploadAdditionalImageToS3,
        {
            isLoading: isAdditionalImageUploading,
            error: additionalImageUploadError,
            isSuccess: wasAdditionalImageUploadSuccessful,
        },
    ] = useUploadImageToS3Mutation();
    const [
        addProductToDB,
        {
            loading: isAddProductLoading,
            error: addProductError,
            data: addProductData,
        },
    ] = useMutation(ADD_PRODUCT);
    // "null" means that the form hasn't been submitted yet
    const [formData, setFormData] = useState<OnFormSubmitArgs | null>(null);
    const [initialImageName, setInitialImageName] = useState<string | null>(
        null
    );
    const [additionalImageName, setAdditionalImageName] = useState<
        string | null
    >(null);

    useEffect(() => {
        if (
            !firstPresignedUrlInfo ||
            !secondPresignedUrlInfo ||
            !formData ||
            !initialImageName ||
            !additionalImageName
        )
            return;

        uploadInitialImageToS3({
            presignedUrl: firstPresignedUrlInfo.presignedUrl,
            imageData: new File(
                [formData.initialImageInput.files![0]],
                initialImageName,
                { type: formData.initialImageInfo.type }
            ),
        });
        uploadAdditionalImageToS3({
            presignedUrl: secondPresignedUrlInfo.presignedUrl,
            imageData: new File(
                [formData.additionalImageInput.files![0]],
                additionalImageName,
                { type: formData.additionalImageInfo.type }
            ),
        });
    }, [
        firstPresignedUrlInfo,
        secondPresignedUrlInfo,
        formData,
        initialImageName,
        additionalImageName,
    ]);

    useEffect(() => {
        if (
            !wasInitialImageUploadSuccessful ||
            !wasAdditionalImageUploadSuccessful ||
            !formData ||
            !initialImageName ||
            !additionalImageName
        )
            return;

        const {
            title,
            price,
            category,
            quantityInStock,
            shortDescription,
            maxOrderQuantity,
        } = formData;

        addProductToDB({
            variables: {
                title,
                price: +price,
                category,
                quantityInStock: +quantityInStock,
                shortDescription,
                initialImageName,
                additionalImageName,
                maxOrderQuantity: +maxOrderQuantity,
            },
        });
    }, [
        wasInitialImageUploadSuccessful,
        wasAdditionalImageUploadSuccessful,
        formData,
        initialImageName,
        additionalImageName,
    ]);

    if (
        areProductCategoriesLoading ||
        isFirstPresignedUrlFetching ||
        isSecondPresignedUrlFetching ||
        isInitialImageUploading ||
        isAdditionalImageUploading ||
        isAddProductLoading
    ) {
        return (
            <div className="flex-wrapper">
                <Loading />
            </div>
        );
    }

    if (
        productCategoriesError ||
        firstPresignedUrlError ||
        secondPresignedUrlError ||
        initialImageUploadError ||
        additionalImageUploadError ||
        addProductError
    ) {
        const errorMessage =
            productCategoriesError?.toString() ||
            deriveErrorMessage(firstPresignedUrlError) ||
            deriveErrorMessage(secondPresignedUrlError) ||
            deriveErrorMessage(initialImageUploadError) ||
            deriveErrorMessage(additionalImageUploadError) ||
            (addProductError && addProductError.message) ||
            'Something went wrong';

        return <ErrorMessageBlock message={errorMessage} />;
    }

    // if the product has been uploaded successfully
    if (addProductData) {
        return <SuccessMessage />;
    }

    const handleFormSubmit = (formData: OnFormSubmitArgs) => {
        const { size: initialImageSize, type: initialImageType } =
            formData.initialImageInfo;
        const { size: additionalImageSize, type: additionalImageType } =
            formData.additionalImageInfo;
        const initialImageName = `${uuidv4()}.png`;
        const additionalImageName = `${uuidv4()}.png`;

        setInitialImageName(initialImageName);
        setAdditionalImageName(additionalImageName);
        getPresignedUrlForUploadingInitialImage({
            fileName: initialImageName,
            mimeType: initialImageType,
            contentLength: initialImageSize,
        });
        getPresignedUrlForUploadingAdditionalImage({
            fileName: additionalImageName,
            mimeType: additionalImageType,
            contentLength: additionalImageSize,
        });
        setFormData(formData);
    };

    return (
        <AddProductForm
            productCategories={productCategories!.categories}
            onFormSubmit={handleFormSubmit}
        />
    );
};

export default AddProduct;
