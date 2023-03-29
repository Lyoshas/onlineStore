import { useState, Fragment } from 'react';

import signInClasses from './SignIn.module.css';
import signUpClasses from '../SignUp/SignUp.module.css';
import SignInForm from '../../components/SignInForm/SigninForm';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import GoogleButton from '../../components/AuthButton/GoogleButton/GoogleButton';
import EmailButton from '../../components/AuthButton/EmailButton/EmailButton';
import AuthButtonsGroup from '../../components/AuthButtonsGroup/AuthButtonsGroup';
import SuggestAccountCreation from '../../components/SuggestAccountCreation/SuggestAccountCreation';

// make sure the CSS classes don't clash
const classes = { ...signInClasses, ...signUpClasses };

const SignIn = () => {
    const [showSignInForm, setShowSignInForm] = useState<boolean>(false);

    const handleClick = () => setShowSignInForm(true);

    return (
        <CenterBlock>
            {showSignInForm ? (
                <Fragment>
                    <h2 className={classes['auth-container__heading']}>
                        Sign In
                    </h2>
                    <SignInForm />
                </Fragment>
            ) : (
                <AuthButtonsGroup>
                    <EmailButton textContent={'Sign in with an email'} onClick={handleClick} />
                    <GoogleButton textContent={'Sign in with Google'} />
                    <SuggestAccountCreation />
                </AuthButtonsGroup>
            )}
        </CenterBlock>
    );
};

export default SignIn;
