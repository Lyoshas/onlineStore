import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface IUserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
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
    }),
});

export const { useSignUpMutation, useActivateAccountMutation } = authApi;
