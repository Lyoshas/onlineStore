import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import ActionButton from '../ActionButton/ActionButton';

const SigninButton = () => {
    return (
        <ActionButton
            to="/auth/sign-in"
            content="Sign In"
            imageURL={getStaticAssetUrl('user-icon.svg')}
            imageAlt="Sign in icon"
        />
    );
};

export default SigninButton;
