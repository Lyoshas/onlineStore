import * as Yup from 'yup';
import checkoutSchemaWithAuth from './checkoutSchemaWithAuth';

const checkoutSchemaNoAuth = checkoutSchemaWithAuth.shape({
    email: Yup.string()
        .required('Електронна пошта має бути вказана')
        .email('Електронна пошта має бути коректною'),
});

export default checkoutSchemaNoAuth;
