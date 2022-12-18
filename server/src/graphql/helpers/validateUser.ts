import VerifiedUserInfo from '../../interfaces/VerifiedUserInfo';

export default (user: VerifiedUserInfo | null) => {
    if (!user) {
        throw new Error('User must be authenticated to perform this action');
    }

    if (!user.isActivated) {
        throw new Error('User must be activated to perform this action');
    }

    if (!user.isAdmin) {
        throw new Error('User must be an admin to perform this action');
    }
};
