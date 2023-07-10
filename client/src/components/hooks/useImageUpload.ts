import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useLazyGetPresignedUrlForUploadQuery } from '../../store/apis/s3PresignedApi';
import deriveErrorMessage from '../../util/deriveErrorMessage';
import { useUploadImageToS3Mutation } from '../../store/apis/s3UploadApi';

const useImageUpload = () => {
    // "null" means the values haven't been set yet
    const [imageData, setImageData] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [
        getPresignedUrl,
        {
            isFetching: isPresignedUrlFetching,
            data: presignedUrlData,
            error: presignedUrlError,
        },
    ] = useLazyGetPresignedUrlForUploadQuery();
    const [
        uploadImageToS3,
        {
            isLoading: isImageUploading,
            error: imageUploadError,
            isSuccess: wasImageUploadSuccessful,
        },
    ] = useUploadImageToS3Mutation();

    useEffect(() => {
        if (!presignedUrlData || !imageData) return;

        // by this point the request has been made successfully
        uploadImageToS3({
            presignedUrl: presignedUrlData.presignedUrl,
            imageData,
        });
    }, [presignedUrlData]);

    const errorMessage =
        deriveErrorMessage(presignedUrlError) ||
        deriveErrorMessage(imageUploadError);

    const uploadImage = (image: File) => {
        const fileName = `${uuidv4()}.png`;

        setFileName(fileName);
        getPresignedUrl({
            fileName,
            mimeType: 'image/png',
            contentLength: image.size,
        });
        setImageData(new File([image], fileName, { type: 'image/png' }));
    };

    return {
        isUploading: isPresignedUrlFetching || isImageUploading,
        uploadImage,
        errorMessage,
        fileName,
        wasImageUploadSuccessful,
    };
};

export default useImageUpload;
