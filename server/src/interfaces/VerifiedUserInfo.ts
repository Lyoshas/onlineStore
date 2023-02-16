export default interface VerifiedUserInfo {
    id: number;
    isAdmin: boolean;
    iat: number; // issued at
    exp: number; // expiration time
};
