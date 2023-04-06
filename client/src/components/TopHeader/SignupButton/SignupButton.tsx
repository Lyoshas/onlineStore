import ActionButton from '../ActionButton/ActionButton';

const SignupButton = () => {
    return (
        <ActionButton
            to="/auth/sign-up"
            content="Sign Up"
            imageURL="/signup-icon.svg"
            imageAlt="Sign up icon"
        />
    );
};

export default SignupButton;
