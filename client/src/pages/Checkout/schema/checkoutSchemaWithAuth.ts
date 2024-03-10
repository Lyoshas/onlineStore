import * as Yup from 'yup';

const checkoutSchemaWithAuth = Yup.object({
    firstName: Yup.string()
        .required('First name is a required field')
        .matches(
            /^[a-zа-яЄҐІЇ']+$/i,
            'Only Cyrillic and Latin characters are allowed'
        )
        .test(
            'is-of-correct-length',
            'First name must not exceed 50 characters',
            (value) => {
                if (!value) return true;
                return value.length <= 50;
            }
        ),
    lastName: Yup.string()
        .required('Last name is a required field')
        .matches(
            /^[a-zа-яЄҐІЇ']+$/i,
            'Only Cyrillic and Latin characters are allowed'
        )
        .test(
            'is-of-correct-length',
            'Last name must not exceed 50 characters',
            (value) => {
                if (!value) return true;
                return value.length <= 50;
            }
        ),
    phoneNumber: Yup.string()
        .required('Phone number is a required field')
        .test(
            'is-of-correct-format',
            'Phone number must be of format +380-12-345-67-89 or +380123456789',
            (value) => {
                if (!value) return true;
                return (
                    /^\+380-\d{2}-\d{3}(-\d{2}){2}$/.test(value) ||
                    /^\+380\d{9}$/.test(value)
                );
            }
        ),
    city: Yup.string().required('City is a required field'),
    paymentMethod: Yup.string().required('Payment method is a required field'),
    deliveryMethod: Yup.object().shape({
        postalService: Yup.string()
            .required('Postal Service is a required field')
            .test(
                'is-of-correct-length',
                'Postal service must be chosen',
                (value) => {
                    if (!value) return true;
                    return value.length > 0;
                }
            ),
        office: Yup.string()
            .required('Office is a required field')
            .test(
                'is-of-correct-length',
                'Postal office must be chosen',
                (value) => {
                    if (!value) return true;
                    return value.length > 0;
                }
            ),
    }),
});

export default checkoutSchemaWithAuth;
