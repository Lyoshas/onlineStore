import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import ActionButton from '../ActionButton/ActionButton';

const SignupButton = () => {
    return (
        <ActionButton
            to="/auth/sign-up"
            content="Sign Up"
            imageURL={getStaticAssetUrl('signup-icon.svg')}
            imageAlt="Sign up icon"
        />
    );
};

export default SignupButton;
