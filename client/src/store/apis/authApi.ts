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
        baseUrl: 'http://localhost/api',
    }),
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
    }),
});

export const {
    useSignUpMutation,
    useActivateAccountMutation,
    useRequestAccessTokenQuery,
    useSignInMutation,
    useResendActivationLinkMutation
} = authApi;
