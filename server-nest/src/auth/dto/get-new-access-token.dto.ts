import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { refreshTokenSchema } from 'src/common/zod-schemas/refresh-token.schema';

export const getNewAccessTokenSchema = z.object({
    refreshToken: refreshTokenSchema,
});

type GetNewAccessTokenSchema = z.infer<typeof getNewAccessTokenSchema>;

export class GetNewAccessTokenDto implements GetNewAccessTokenSchema {
    @ApiProperty({
        description:
            'A valid "refreshToken" must be must be specified as a cookie',
    })
    refreshToken: string;
}
