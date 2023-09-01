import VerifiedUserInfo from '../../interfaces/VerifiedUserInfo.js';
import { isAccountActivated } from '../../models/account-activation.js';
import UserNotAuthenticatedError from '../errors/UserNotAuthenticatedError.js';
import UserNotActivatedError from '../errors/UserNotActivatedError.js';
import UserNotAdminError from '../errors/UserNotAdminError.js';

export default async (user: VerifiedUserInfo | null) => {
    if (!user) {
        throw new UserNotAuthenticatedError();
    }

    if (!(await isAccountActivated(user.id))) {
        throw new UserNotActivatedError();
    }

    if (!user.isAdmin) {
        throw new UserNotAdminError();
    }
};
