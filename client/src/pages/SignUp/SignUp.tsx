import { FC, Fragment, useState } from 'react';

import SignUpForm from '../../components/SignUpForm/SignupForm';
import SuccessfulSignupMessage from '../../components/SignUpForm/SuccessfulSignupMessage';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';
import classes from './SignUp.module.css';

const SignUp: FC = () => {
    const [wasSignupSuccessful, setWasSignupSuccessful] =
        useState<boolean>(false);

    return (
        <CenterBlock>
            {wasSignupSuccessful ? (
                <SuccessfulSignupMessage />
            ) : (
                <Fragment>
                    <h2 className={classes['auth-container__heading']}>
                        Sign Up
                    </h2>
                    <SignUpForm
                        onSuccessfulSignUp={() => setWasSignupSuccessful(true)}
                    />
                </Fragment>
            )}
        </CenterBlock>
    );
};

export default SignUp;
