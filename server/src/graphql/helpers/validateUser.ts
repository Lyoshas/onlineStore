import VerifiedUserInfo from '../../interfaces/VerifiedUserInfo';
import { isAccountActivated } from '../../models/auth';

export default async (user: VerifiedUserInfo | null) => {
    if (!user) {
        throw new Error('User must be authenticated to perform this action');
    }

    if ( !(isAccountActivated(user.id)) ) {
        throw new Error('User must be activated to perform this action');
    }

    if (!user.isAdmin) {
        throw new Error('User must be an admin to perform this action');
    }
};
