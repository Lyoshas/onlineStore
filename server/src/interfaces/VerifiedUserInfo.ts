import UserDataForAccessToken from './UserDataForAccessToken';

export default interface VerifiedUserInfo extends UserDataForAccessToken {
    id: number;
    iat: number; // issued at
    exp: number; // expiration time
}
