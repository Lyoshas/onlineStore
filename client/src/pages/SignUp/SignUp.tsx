import { FC, Fragment, useState } from 'react';

import SignUpForm from '../../components/SignUpForm/SignupForm';
import SuccessfulSignupMessage from '../../components/SignUpForm/SuccessfulSignupMessage';
import Card from '../../components/UI/Card/Card';
import classes from './SignUp.module.css';

const SignUp: FC = () => {
    const [wasSignupSuccessful, setWasSignupSuccessful] =
        useState<boolean>(false);

    return (
        <div className="flex-wrapper">
            <Card className={classes['auth-container']}>
                {wasSignupSuccessful ? (
                    <SuccessfulSignupMessage />
                ) : (
                    <Fragment>
                        <h2 className={classes['auth-container__heading']}>
                            Sign Up
                        </h2>
                        <SignUpForm
                            onSuccessfulSignUp={() =>
                                setWasSignupSuccessful(true)
                            }
                        />
                    </Fragment>
                )}
            </Card>
        </div>
    );
};

export default SignUp;
