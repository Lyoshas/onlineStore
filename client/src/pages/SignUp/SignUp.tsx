import { FC } from 'react';

import SignUpForm from '../../components/SignUpForm/SignupForm';
import Card from '../../components/UI/Card/Card';
import classes from './SignUp.module.css';

const SignUp: FC = () => {
    return (
        <div className={classes['flex-wrapper']}>
            <Card className={classes['auth-container']}>
                <h2 className={classes['auth-container__heading']}>Sign Up</h2>
                <SignUpForm />
            </Card>
        </div>
    );
};

export default SignUp;
