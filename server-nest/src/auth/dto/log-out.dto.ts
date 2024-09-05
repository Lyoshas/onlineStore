import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { refreshTokenSchema } from 'src/common/zod-schemas/refresh-token.schema';

export const logOutSchema = z.object({
    refreshToken: refreshTokenSchema,
});

type LogOutSchema = z.infer<typeof logOutSchema>;

export class LogOutDto implements LogOutSchema {
    @ApiProperty({
        description:
            'A valid "refreshToken" must be must be specified as a cookie',
    })
    refreshToken: string;
}
