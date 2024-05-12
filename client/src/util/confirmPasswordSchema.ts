import * as Yup from 'yup';

const confirmPasswordSchema = Yup.string()
    .required('Password confirmation is required')
    .oneOf([Yup.ref('password')], 'Паролі повинні збігатися');

export default confirmPasswordSchema;
