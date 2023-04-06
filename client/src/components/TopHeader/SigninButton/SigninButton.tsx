import ActionButton from '../ActionButton/ActionButton';

const SigninButton = () => {
    return (
        <ActionButton
            to="/auth/sign-in"
            content="Sign In"
            imageURL="/user-icon.svg"
            imageAlt="Sign in icon"
        />
    );
};

export default SigninButton;
