export default interface VerifiedUserInfo {
    id: number;
    isActivated: boolean;
    isAdmin: boolean;
    iat: number; // issued at
    exp: number; // expiration time
};
