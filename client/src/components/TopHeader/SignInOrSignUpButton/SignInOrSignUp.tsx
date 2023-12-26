import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import ActionButton from '../ActionButton/ActionButton';

const SignInOrSignUpButton = () => {
    return (
        <ActionButton
            to="/auth/sign-in"
            content="Sign In / Sign Up"
            imageURL={getStaticAssetUrl('user-icon.svg')}
            imageAlt="User icon"
        />
    );
};

export default SignInOrSignUpButton
