import { Form, Formik } from 'formik';
import { FC, Fragment, useEffect, useState, useRef } from 'react';
import * as Yup from 'yup';
import ReCAPTCHA from 'react-google-recaptcha';

import classes from './ForgotPassword.module.css';
import FormInput from '../../components/Input/FormInput';
import ReCAPTCHABlock from '../../components/ReCAPTCHABlock/ReCAPTCHABlock';
import SubmitButton from '../../components/UI/SubmitButton/SubmitButton';
import { useRequestResetTokenMutation } from '../../store/apis/authApi';
import ErrorMessage from '../../components/UI/ErrorMessage/ErrorMessage';
import SuccessMessage from './SuccessMessage';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import recaptchaTokenSchema from '../../util/recaptchaTokenSchema';
import useApiError from '../../components/hooks/useApiError';
import SchemaContext from '../../context/validationSchema';

const schema = Yup.object().shape({
    email: Yup.string()
        .required('Повинна бути вказана електронна пошта')
        .email('Електронна пошта повинна бути коректною'),
    recaptchaToken: recaptchaTokenSchema,
});
const initialValues = { email: '', recaptchaToken: '' };

const ForgotPassword: FC = () => {
    const [
        sendResetToken,
        { isError, error, isLoading: isRequestLoading, isSuccess },
    ] = useRequestResetTokenMutation();
    const expectedErrorResponse = useApiError(isError, error, [422]);
    const [serverErrorResponse, setServerErrorResponse] = useState<
        string | null
    >();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const statusCode =
        expectedErrorResponse && expectedErrorResponse.statusCode;

    useEffect(() => {
        if (!isError || statusCode === null) return;

        if (
            statusCode === 422 &&
            expectedErrorResponse?.serverResponse.errors.some((error) =>
                error.message
                    .toLowerCase()
                    .includes('there is no user with the corresponding email')
            )
        ) {
            setServerErrorResponse(
                'Не існує користувача з вказаною електронною поштою'
            );
            return;
        }
    }, [statusCode, isError]);

    return (
        <CenterBlock>
            {isSuccess ? (
                <SuccessMessage />
            ) : (
                <Fragment>
                    <h1 className={classes['forgot-password__heading']}>
                        Забув пароль
                    </h1>
                    <Formik
                        initialValues={initialValues}
                        initialErrors={initialValues}
                        validationSchema={schema}
                        onSubmit={async (
                            values,
                            { setSubmitting, setFieldValue }
                        ) => {
                            setSubmitting(true);

                            await sendResetToken(values);
                            recaptchaRef.current?.reset();
                            setFieldValue('recaptchaToken', '');

                            setSubmitting(false);
                        }}
                    >
                        {(formik) => (
                            <Form>
                                <SchemaContext.Provider value={schema}>
                                    <FormInput
                                        type="email"
                                        isRequired={true}
                                        placeholder="Введіть свою електронну пошту"
                                        label="Електронна пошта"
                                        name="email"
                                    />
                                </SchemaContext.Provider>
                                <ReCAPTCHABlock ref={recaptchaRef} />
                                {serverErrorResponse && (
                                    <ErrorMessage centered={true}>
                                        {serverErrorResponse}
                                    </ErrorMessage>
                                )}
                                <SubmitButton
                                    label="Відправити посилання"
                                    isLoading={
                                        formik.isSubmitting || isRequestLoading
                                    }
                                    className={
                                        classes[
                                            'forgot-password__submit-button_centered'
                                        ]
                                    }
                                />
                            </Form>
                        )}
                    </Formik>
                </Fragment>
            )}
        </CenterBlock>
    );
};

export default ForgotPassword;
