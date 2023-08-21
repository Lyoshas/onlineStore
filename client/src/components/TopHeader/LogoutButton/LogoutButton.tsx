import getStaticAssetUrl from '../../../util/getStaticAssetUrl';
import ActionButton from '../ActionButton/ActionButton';

const LogoutButton = () => {
    return (
        <ActionButton
            to="/auth/logout"
            content="Log out"
            imageURL={getStaticAssetUrl('logout-icon.svg')}
            imageAlt="Log out"
        />
    );
};

export default LogoutButton;
