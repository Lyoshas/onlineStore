import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost/api/auth',
    }),
    endpoints: (builder) => ({
        signUp: builder.mutation<{ msg: string }, IUserData>({
            query: (user) => {
                return {
                    url: '/sign-up',
                    method: 'POST',
                    body: user,
                };
            },
        }),
        activateAccount: builder.mutation<{ msg: string }, string>({
            query: (activationToken: string) => {
                return {
                    url: `/activate-account/${activationToken}`,
                    method: 'PATCH',
                };
            },
        }),
        requestAccessToken: builder.query<{ accessToken: string }, void>({
            query: () => {
                return {
                    url: '/refresh',
                    method: 'GET',
                    credentials: 'include',
                };
            },
        }),
        signIn: builder.mutation<{ accessToken: string }, IUserCredentials>({
            query: (credentials) => {
                return {
                    url: '/sign-in',
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
                    url: '/resend-activation-link',
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
                    url: '/send-reset-token',
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
                    url: '/change-password',
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
                    url: `/is-reset-token-valid/${data.resetToken}`,
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
} = authApi;
