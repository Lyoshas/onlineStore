import VerifiedUserInfo from '../../interfaces/VerifiedUserInfo.js';
import { isAccountActivated } from '../../models/account-activation.js';

export default async (user: VerifiedUserInfo | null) => {
    if (!user) {
        throw new Error('User must be authenticated to perform this action');
    }

    if ( !(await isAccountActivated(user.id)) ) {
        throw new Error('User must be activated to perform this action');
    }

    if (!user.isAdmin) {
        throw new Error('User must be an admin to perform this action');
    }
};
