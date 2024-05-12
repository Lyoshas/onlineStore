import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
    starRating: Yup.number()
        .required('Star rating must be provided')
        .min(1)
        .max(5)
        .test(
            'is-divisible-by-0.5',
            'Зірковий рейтинг має бути з кроком 0,5',
            (value) => {
                if (!value) return false;
                return value % 0.5 === 0;
            }
        ),
    reviewMessage: Yup.string().test(
        'is-of-correct-length',
        'Текст відгуку повинен містити від 1 до 2000 символів',
        (value) => {
            if (!value) return false;
            const valLength = value.length;
            return valLength >= 1 && valLength <= 2000;
        }
    ),
});

export default validationSchema;
