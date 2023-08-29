import * as Yup from 'yup';

import FileInfo from '../../interfaces/FileInfo';
import addProductSchema from '../AddProduct/addProductSchema';

const attachment = Yup.mixed()
    .test(
        'fileSize',
        'The file should have the size of 500 KB or less',
        (file?: FileInfo) => {
            // if the file is not attached, return true
            if (!file || file.size === 0) return true;
            // make sure the image is no more than 500 KB
            return file.size / 1024 <= 500;
        }
    )
    .test(
        'fileType',
        'The file must have the .png extension',
        (file?: FileInfo) => {
            // if the file is not attached, return true
            if (!file || file.size === 0) return true;
            return file.type === 'image/png';
        }
    );

const editProductSchema = addProductSchema.shape({
    initialImageInfo: attachment,
    additionalImageInfo: attachment,
});

export default editProductSchema;
