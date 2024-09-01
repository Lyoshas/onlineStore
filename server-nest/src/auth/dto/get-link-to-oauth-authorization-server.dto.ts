import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { OAuthProvider } from '../enums/oauth-provider.enum';

export const getLinkToOAuthAuthorizationServerSchema = z.object({
    authorizationServerName: z.enum(
        [OAuthProvider.GOOGLE, OAuthProvider.FACEBOOK],
        {
            message:
                'invalid authorization server name: it can be either "google" or "facebook"',
        }
    ),
});

type GetLinkToOAuthAuthorizationServerSchema = z.infer<
    typeof getLinkToOAuthAuthorizationServerSchema
>;

export class GetLinkToOAuthAuthorizationServerDto
    implements GetLinkToOAuthAuthorizationServerSchema
{
    @ApiProperty({
        description:
            'The name of the resource the user is trying to log in with',
        enum: OAuthProvider
    })
    authorizationServerName: OAuthProvider.GOOGLE | OAuthProvider.FACEBOOK;
}
