import * as Yup from 'yup';
import checkoutSchemaWithAuth from './checkoutSchemaWithAuth';

const checkoutSchemaNoAuth = checkoutSchemaWithAuth.shape({
    email: Yup.string()
        .required('Email is a required field')
        .email('Email must be correct'),
});

export default checkoutSchemaNoAuth;
