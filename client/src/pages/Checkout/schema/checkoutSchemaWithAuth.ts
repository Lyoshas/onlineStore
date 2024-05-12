import * as Yup from 'yup';

const checkoutSchemaWithAuth = Yup.object({
    firstName: Yup.string()
        .required("Власне ім'я має бути вказано")
        .matches(
            /^[a-zа-яЄҐІЇ']+$/i,
            'Допускаються тільки кириличні та латинські символи'
        )
        .test(
            'is-of-correct-length',
            "Власне ім'я не повинно перевищувати 50 символів",
            (value) => {
                if (!value) return true;
                return value.length <= 50;
            }
        ),
    lastName: Yup.string()
        .required('Прізвище має бути вказано')
        .matches(
            /^[a-zа-яЄҐІЇ']+$/i,
            'Допускаються тільки кириличні та латинські символи'
        )
        .test(
            'is-of-correct-length',
            'Прізвище не повинно перевищувати 50 символів',
            (value) => {
                if (!value) return true;
                return value.length <= 50;
            }
        ),
    phoneNumber: Yup.string()
        .required('Номер телефону має бути вказаний')
        .test(
            'is-of-correct-format',
            'Номер телефону має бути у форматі +380-12-345-67-89 або +380123456789',
            (value) => {
                if (!value) return true;
                return (
                    /^\+380-\d{2}-\d{3}(-\d{2}){2}$/.test(value) ||
                    /^\+380\d{9}$/.test(value)
                );
            }
        ),
    city: Yup.string().required('Місто має бути вказано'),
    paymentMethod: Yup.string().required('Спосіб оплати має бути вказаний'),
    deliveryMethod: Yup.object().shape({
        postalService: Yup.string()
            .required('Поштова служба має бути вказана')
            .test(
                'is-of-correct-length',
                'Поштова служба має бути обрана',
                (value) => {
                    if (!value) return true;
                    return value.length > 0;
                }
            ),
        office: Yup.string()
            .required('Поштове відділення має бути вказане')
            .test(
                'is-of-correct-length',
                'Поштове відділення має бути обрано',
                (value) => {
                    if (!value) return true;
                    return value.length > 0;
                }
            ),
    }),
});

export default checkoutSchemaWithAuth;
