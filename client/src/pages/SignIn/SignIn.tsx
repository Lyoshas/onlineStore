import signInClasses from './SignIn.module.css';
import signUpClasses from '../SignUp/SignUp.module.css';
import Card from '../../components/UI/Card/Card';
import SignInForm from '../../components/SignInForm/SigninForm';

// make sure the CSS classes don't clash
const classes = { ...signInClasses, ...signUpClasses };

const SignIn = () => {
    return (
        <div className="flex-wrapper">
            <Card className={classes['auth-container']}>
                <h2 className={classes['auth-container__heading']}>
                    Sign In 
                </h2>
                <SignInForm />
            </Card>
        </div>
    );
};

export default SignIn;
