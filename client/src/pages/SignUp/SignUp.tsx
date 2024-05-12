import { FC, Fragment, useState } from 'react';

import SignUpForm from '../../components/SignUpForm/SignupForm';
import SuccessfulSignupMessage from '../../components/SignUpForm/SuccessfulSignupMessage';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import classes from './SignUp.module.css';
import AuthButton from '../../components/AuthButton/AuthButton';
import GoogleButton from '../../components/AuthButton/GoogleButton/GoogleButton';
import AuthButtonsGroup from '../../components/AuthButtonsGroup/AuthButtonsGroup';
import EmailButton from '../../components/AuthButton/EmailButton/EmailButton';
import SuggestLoggingIn from '../../components/SuggestLoggingIn/SuggestLoggingIn';
import FacebookButton from '../../components/AuthButton/FacebookButton/FacebookButton';

const SignUp: FC = () => {
    const [showSignupForm, setShowSignupForm] = useState<boolean>(false);
    const [wasSignupSuccessful, setWasSignupSuccessful] =
        useState<boolean>(false);

    let render: React.ReactNode;

    if (!showSignupForm)
        render = (
            <AuthButtonsGroup>
                <EmailButton
                    textContent="Зареєструватися через email"
                    onClick={() => setShowSignupForm(true)}
                />
                <GoogleButton textContent="Зареєструватися через Google" />
                <FacebookButton textContent="Зареєструватися через Facebook" />
                <SuggestLoggingIn />
            </AuthButtonsGroup>
        );
    else if (wasSignupSuccessful) render = <SuccessfulSignupMessage />;
    else {
        render = (
            <Fragment>
                <h2 className={classes['auth-container__heading']}>Реєстрація</h2>
                <SignUpForm
                    onSuccessfulSignUp={() => setWasSignupSuccessful(true)}
                />
            </Fragment>
        );
    }

    return <CenterBlock>{render}</CenterBlock>;
};

export default SignUp;
