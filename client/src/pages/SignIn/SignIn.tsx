import signInClasses from './SignIn.module.css';
import signUpClasses from '../SignUp/SignUp.module.css';
import SignInForm from '../../components/SignInForm/SigninForm';
import CenterBlock from '../../components/UI/CenterBlock/CenterBlock';

// make sure the CSS classes don't clash
const classes = { ...signInClasses, ...signUpClasses };

const SignIn = () => {
    return (
        <CenterBlock>
            <h2 className={classes['auth-container__heading']}>Sign In</h2>
            <SignInForm />
        </CenterBlock>
    );
};

export default SignIn;
