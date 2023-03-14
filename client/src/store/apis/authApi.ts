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
    }),
});

export const { useSignUpMutation } = authApi;