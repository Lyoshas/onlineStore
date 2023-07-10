import * as Yup from 'yup';
import FileInfo from '../../interfaces/FileInfo';

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

const editProductSchema = Yup.object().shape({
    title: Yup.string()
        .required('Title is a required field')
        .test(
            'length',
            'Title must have no more than 200 characters',
            (val) => val!.length <= 200
        ),
    price: Yup.number()
        .transform((value) => +value)
        .typeError('Price must be a number')
        .required('Price is a required field')
        .moreThan(0, 'Price must be greater than 0'),
    initialImageInfo: attachment,
    additionalImageInfo: attachment,
    quantityInStock: Yup.number()
        .transform((value) => +value)
        .typeError('Quantity in stock must be a number')
        .required('Quantity in stock is a required field')
        .moreThan(-1, 'Quantity in stock must be 0 or more'),
    shortDescription: Yup.string()
        .required('Short description is a required field')
        .test(
            'length',
            'Must have no more than 300 characters',
            (val) => val!.length <= 300
        ),
});

export default editProductSchema;
