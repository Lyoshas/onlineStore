import ActionButton from '../ActionButton/ActionButton';

const LogoutButton = () => {
    return (
        <ActionButton
            to="/auth/logout"
            content="Log out"
            imageURL="/logout-icon.svg"
            imageAlt="Log out"
        />
    );
};

export default LogoutButton;
