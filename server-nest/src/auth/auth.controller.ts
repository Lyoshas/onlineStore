import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOperation,
    ApiTags,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AUTH_ENDPOINTS_PREFIX } from './auth.constants';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { SignUpDto, signUpSchema } from './dto/sign-up.dto';
import { EmailAvailabilityPipe } from 'src/common/pipes/email-availability.pipe';
import { RecaptchaGuard } from 'src/common/guards/recaptcha.guard';
import { Host } from 'src/common/decorators/host.decorator';
import { SWAGGER_AUTH_TAG } from 'src/common/common.constants';

@Controller(AUTH_ENDPOINTS_PREFIX)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({
        description:
            'Allows to sign users up. If the operation is successful, an activation link will be sent to the provided email.',
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiCreatedResponse({
        description:
            'A new account has been created. The activation link has been sent to the specified email.',
        example: {
            msg: 'A new account has been created. Email confirmation is required.',
        },
    })
    @ApiUnprocessableEntityResponse({
        description:
            'The user has provided invalid data. See the parameter requirements above.',
    })
    @Post('sign-up')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RecaptchaGuard)
    async signUp(
        @Body(new ZodValidationPipe(signUpSchema)) signupData: SignUpDto,
        @Body('email', EmailAvailabilityPipe) _: Pick<SignUpDto, 'email'>,
        @Host() httpHost: string
    ) {
        const { email, firstName, lastName, password } = signupData;
        const { activationToken } = await this.authService.signUp({
            email,
            firstName,
            lastName,
            plaintextPassword: password,
            isActivated: false,
        });

        await this.authService.sendSignupEmailMessage(
            email,
            this.authService.generateActivationLink(httpHost, activationToken)
        );

        return {
            msg: 'A new account has been created. Email confirmation is required.',
        };
    }
}
