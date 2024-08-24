import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
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
import {
    SWAGGER_AUTH_TAG,
    SWAGGER_VALIDATION_ERROR_TEXT,
} from 'src/common/common.constants';
import {
    CheckEmailAvailabilityDto,
    checkEmailAvailabilitySchema,
} from './dto/check-email-availability.dto';
import {
    ActivateAccountDto,
    activateAccountSchema,
} from './dto/activate-account.dto';
import { AuthTokenService } from './auth-token/auth-token.service';
import { ValidationException } from 'src/common/exceptions/validation.exception';

@Controller(AUTH_ENDPOINTS_PREFIX)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authTokenService: AuthTokenService
    ) {}

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
        description: SWAGGER_VALIDATION_ERROR_TEXT,
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

    @ApiOperation({
        description:
            'Allows users to check whether the provided email is available for signing up or not.',
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiOkResponse({
        description:
            'The email availability check has been performed successfully.',
        example: { isEmailAvailable: true },
    })
    @ApiUnprocessableEntityResponse({
        description: SWAGGER_VALIDATION_ERROR_TEXT,
    })
    @Get('is-email-available')
    async isEmailAvailable(
        @Query(new ZodValidationPipe(checkEmailAvailabilitySchema))
        { email }: CheckEmailAvailabilityDto
    ) {
        return {
            isEmailAvailable: await this.authService.isEmailAvailable(email),
        };
    }

    @ApiOperation({
        description:
            'Allows users to activate their account. This endpoint is typically used when the user follows the activation link that is sent after the user signs up.',
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiOkResponse({
        description: 'The user has been successfully activated',
        example: { msg: 'The account has been activated' },
    })
    @ApiUnprocessableEntityResponse({
        description: SWAGGER_VALIDATION_ERROR_TEXT,
    })
    @Patch('activate-account/:activationToken')
    @UsePipes(new ZodValidationPipe(activateAccountSchema))
    async activateAccount(@Param() { activationToken }: ActivateAccountDto) {
        const userId =
            await this.authTokenService.getUserIdByActivationToken(
                activationToken
            );

        if (userId === null) {
            throw new ValidationException([
                {
                    message:
                        'the activation token is either invalid or expired',
                    field: 'activationToken',
                },
            ]);
        }

        await this.authService.activateAccount(userId);

        return { msg: 'The account has been activated' };
    }
}
