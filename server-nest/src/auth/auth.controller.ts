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
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
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
import {
    ResendActivationLinkDto,
    resendActivationLinkSchema,
} from './dto/resend-activation-link.dto';
import { InvalidCredentialsException } from 'src/common/exceptions/invalid-credentials.exception';
import { AccountActivatedException } from 'src/common/exceptions/account-activated.exception';
import { TokenType } from './enums/token-type.enum';
import { EnvironmentVariables } from 'src/env-schema';

@Controller(AUTH_ENDPOINTS_PREFIX)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly authTokenService: AuthTokenService,
        private readonly configService: ConfigService<EnvironmentVariables>
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

    @ApiOperation({
        description:
            "Resends the activation link to the user. If a user tries to sign in with an account that is not activated, they won't be able to sign in, but they will be presented with an option to resend the activation link. This endpoint is used when the user agrees to resend the link.",
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiOkResponse({
        description: 'The link has been resent successfully.',
        example: { targetEmail: 'example@example.com' },
    })
    @ApiUnauthorizedResponse({
        description: 'The provided login and/or password is incorrect.',
        example: { errors: [{ message: 'invalid credentials' }] },
    })
    @ApiConflictResponse({
        description: 'The account is already activated.',
        example: { errors: [{ message: 'account is already activated' }] },
    })
    @ApiUnprocessableEntityResponse({
        description: SWAGGER_VALIDATION_ERROR_TEXT,
    })
    @Post('resend-activation-link')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RecaptchaGuard)
    async resendActivationLink(
        @Body(new ZodValidationPipe(resendActivationLinkSchema))
        body: ResendActivationLinkDto,
        @Host() httpHost: string
    ) {
        const { login, password } = body;
        const existingUser = await this.authService.getUserByCredentials(
            login,
            password
        );

        if (existingUser === null) {
            throw new InvalidCredentialsException();
        }

        if (existingUser.isActivated) {
            throw new AccountActivatedException();
        }

        const activationToken =
            await this.authTokenService.generateUnregisteredToken();
        await this.authTokenService
            .registerToken({
                tokenType: TokenType.ACTIVATION_TOKEN,
                token: activationToken,
                userId: existingUser.id,
                expirationTimeInSeconds: this.configService.get<number>(
                    'ACTIVATION_TOKEN_EXPIRATION_IN_SECONDS'
                )!,
            })
            .exec();

        const activationLink = this.authService.generateActivationLink(
            httpHost,
            activationToken
        );

        await this.authService.resendActivationLink(
            existingUser.email,
            activationLink
        );

        return { targetEmail: existingUser.email };
    }
}
