import * as Yup from 'yup';

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
