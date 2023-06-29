import jwtDecode from 'jwt-decode';

import AccessTokenPayload from '../interfaces/AccessTokenPayload';

// returns whether the token expires in 5 seconds or has already expired
const isAccessTokenRunningOut = (accessToken: string): boolean => {
    const decoded = jwtDecode(accessToken) as AccessTokenPayload;

    return decoded.exp - Date.now() / 1000 < 5;
};

export default isAccessTokenRunningOut;
