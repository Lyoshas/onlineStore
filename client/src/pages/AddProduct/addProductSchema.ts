import * as Yup from 'yup';

import FileInfo from '../../interfaces/FileInfo';

const attachment = Yup.mixed()
    .test(
        'fileSize',
        'The file should have the size of 500 KB or less',
        (file?: FileInfo) => {
            if (!file) return true;
            // make sure the image is no more than 500 KB
            return file.size / 1024 <= 500;
        }
    )
    .test(
        'fileType',
        'The file must have the .png extension',
        (file?: FileInfo) => {
            if (!file) return true;
            return file.type === 'image/png';
        }
    );

const addProductSchema = Yup.object().shape({
    title: Yup.string()
        .required('Title is a required field')
        .test(
            'length',
            'Title must have no more than 200 characters',
            (val) => {
                if (!val) return true;
                return val.length <= 200;
            }
        ),
    price: Yup.number()
        .transform((value) => +value)
        .typeError('Price must be a number')
        .required('Price is a required field')
        .moreThan(0, 'Price must be greater than 0')
        .lessThan(10000000, 'Price must be less than or equal to 9999999.99'),
    initialImageInfo: attachment.required('Initial image is required'),
    additionalImageInfo: attachment.required('Additional image is required'),
    quantityInStock: Yup.number()
        .transform((value) => +value)
        .typeError('Quantity in stock must be a number')
        .required('Quantity in stock is a required field')
        .moreThan(-1, 'Quantity in stock must be 0 or more')
        .lessThan(
            32768,
            'Quantity in stock must be less than or equal to 32767'
        ),
    shortDescription: Yup.string()
        .required('Short description is a required field')
        .test('length', 'Must have no more than 300 characters', (val) => {
            if (!val) return true;
            return val.length <= 300;
        }),
    category: Yup.string().required('Category is a required field'),
});

export default addProductSchema;
