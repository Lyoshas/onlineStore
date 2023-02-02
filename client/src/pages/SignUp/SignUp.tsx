import { FC } from 'react';

import SignUpForm from '../../components/SignUpForm/SignupForm';
import classes from './SignUp.module.css';

const SignUp: FC = () => {
    return (
        <div className={classes['flex-wrapper']}>
            <div className={classes['auth-container']}>
                <h2 className={classes['auth-container__heading']}>Sign Up</h2>
                <SignUpForm />
            </div>
        </div>
    );
};

export default SignUp;
