import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const activateAccountSchema = z.object({
    activationToken: z.string(),
});

type ActivateAccountSchema = z.infer<typeof activateAccountSchema>;

export class ActivateAccountDto implements ActivateAccountSchema {
    @ApiProperty({
        description:
            "A token that is used to activate an account. The API server generates this token after the user signs up and then sends it to the user's email. The user then follows the link with this activation token.",
    })
    activationToken: string;
}
