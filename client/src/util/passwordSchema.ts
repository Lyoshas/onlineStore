import * as Yup from 'yup';

const passwordSchema = Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password must not exceed 72 characters')
    .matches(/[A-Z]/, 'Must have at least 1 uppercase letter')
    .matches(/[a-z]/, 'Must have at least 1 lowercase letter')
    .matches(/[0-9]/, 'Must have at least 1 number')
    .matches(
        /[-#!$@£%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]/,
        'Must have at least 1 special character (!, @, #, etc)'
    );

export default passwordSchema;
