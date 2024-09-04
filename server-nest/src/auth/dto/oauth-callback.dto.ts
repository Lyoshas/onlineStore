import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const oauthCallbackSchema = z.object({
    state: z.string({ message: 'must be a string' }),
    code: z.string({ message: 'must be a string' }),
});

type OAuthCallbackSchema = z.infer<typeof oauthCallbackSchema>;

export class OAuthCallbackDto implements OAuthCallbackSchema {
    @ApiProperty({
        description:
            "A random string that was generated by our API server when creating a link to the OAuth 2.0 authorization server. It's used to verify whether the request is authentic and to prevent CSRF attacks.",
    })
    state: string;

    @ApiProperty({
        description:
            'A single-use authorization code that the OAuth 2.0 authorization server returns to the client application after the user grants permission. Its single purpose is to use it to exchange it to the access token.',
    })
    code: string;
}
