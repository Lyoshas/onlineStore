import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import ActionButton from '../ActionButton/ActionButton';

const LogoutButton = () => {
    return (
        <ActionButton
            to="/auth/logout"
            content="Вийти"
            imageURL={getStaticAssetUrl('logout-icon.svg')}
            imageAlt="Log out"
        />
    );
};

export default LogoutButton;
