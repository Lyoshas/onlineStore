import VerifiedUserInfo from '../../interfaces/VerifiedUserInfo.js';
import { isAccountActivated } from '../../models/account-activation.js';
import UserNotAuthenticatedError from '../errors/UserNotAuthenticatedError.js';
import UserNotActivatedError from '../errors/UserNotActivatedError.js';
import UserNotAdminError from '../errors/UserNotAdminError.js';

interface UserCheckOptions {
    checkIsActivated: boolean;
    checkIsAdmin: boolean;
}

export default async (
    user: VerifiedUserInfo | null,
    options: UserCheckOptions
) => {
    if (!user) {
        throw new UserNotAuthenticatedError();
    }

    if (options.checkIsActivated && !(await isAccountActivated(user.id))) {
        throw new UserNotActivatedError();
    }

    if (options.checkIsAdmin && !user.isAdmin) {
        throw new UserNotAdminError();
    }
};
