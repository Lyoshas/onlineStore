import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import ActionButton from '../ActionButton/ActionButton';

const SignInOrSignUpButton = () => {
    return (
        <ActionButton
            to="/auth/sign-in"
            content="Вхід / Реєстрація"
            imageURL={getStaticAssetUrl('user-icon.svg')}
            imageAlt="User icon"
        />
    );
};

export default SignInOrSignUpButton
