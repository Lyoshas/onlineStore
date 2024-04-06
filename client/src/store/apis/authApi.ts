import { backendApi } from './backendApi';

export interface IUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    recaptchaToken: string;
}

export interface IUserCredentials {
    login: string;
    password: string;
    recaptchaToken: string;
}

export const authApi = backendApi.injectEndpoints({
    endpoints: (builder) => ({
        signUp: builder.mutation<{ msg: string }, IUserData>({
            query: (user) => {
                return {
                    url: '/auth/sign-up',
                    method: 'POST',
                    body: user,
                };
            },
        }),
        activateAccount: builder.mutation<{ msg: string }, string>({
            query: (activationToken: string) => {
                return {
                    url: `/auth/activate-account/${activationToken}`,
                    method: 'PATCH',
                };
            },
        }),
        requestAccessToken: builder.query<{ accessToken: string }, void>({
            query: () => {
                return {
                    url: '/auth/refresh',
                    method: 'GET',
                    credentials: 'include',
                };
            },
        }),
        signIn: builder.mutation<{ accessToken: string }, IUserCredentials>({
            query: (credentials) => {
                return {
                    url: '/auth/sign-in',
                    method: 'POST',
                    body: credentials,
                };
            },
        }),
        resendActivationLink: builder.mutation<
            { targetEmail: string },
            IUserCredentials
        >({
            query: (credentials) => {
                return {
                    url: '/auth/resend-activation-link',
                    method: 'POST',
                    body: credentials,
                };
            },
        }),
        requestResetToken: builder.mutation<
            { msg: string },
            { email: string; recaptchaToken: string }
        >({
            query: (data) => {
                return {
                    url: '/auth/send-reset-token',
                    method: 'POST',
                    body: data,
                };
            },
        }),
        changePassword: builder.mutation<
            { msg: string },
            {
                resetToken: string;
                password: string;
                recaptchaToken: string;
            }
        >({
            query: (data) => {
                return {
                    url: '/auth/change-password',
                    method: 'PATCH',
                    body: data,
                };
            },
        }),
        checkResetTokenValidity: builder.query<
            { isValid: boolean },
            { resetToken: string }
        >({
            query: (data) => {
                return {
                    url: `/auth/is-reset-token-valid/${data.resetToken}`,
                    method: 'GET',
                };
            },
        }),
        getOAuthLink: builder.query<{ URL: string }, { oauthProvider: string }>(
            {
                query: (data) => {
                    return {
                        url: `/auth/oauth-link/${data.oauthProvider}`,
                        method: 'GET',
                    };
                },
            }
        ),
        OAuthCallback: builder.mutation<
            { accessToken: string },
            { queryString: string }
        >({
            query: (data) => {
                console.log(data.queryString);
                return {
                    url: `/auth/oauth-callback?${data.queryString}`,
                    method: 'POST',
                };
            },
        }),
        logout: builder.mutation<void, void>({
            query: () => {
                return {
                    url: '/auth/logout',
                    method: 'POST',
                };
            },
        }),
        isEmailAvailable: builder.query<
            { isEmailAvailable: boolean },
            { email: string }
        >({
            query: (data) => {
                return {
                    url: `/auth/is-email-available?${new URLSearchParams(
                        data
                    ).toString()}`,
                    method: 'GET',
                };
            },
        }),
    }),
});

export const {
    useSignUpMutation,
    useActivateAccountMutation,
    useRequestAccessTokenQuery,
    useSignInMutation,
    useResendActivationLinkMutation,
    useRequestResetTokenMutation,
    useChangePasswordMutation,
    useCheckResetTokenValidityQuery,
    useGetOAuthLinkQuery,
    useOAuthCallbackMutation,
    useLogoutMutation,
    useLazyIsEmailAvailableQuery,
} = authApi;
