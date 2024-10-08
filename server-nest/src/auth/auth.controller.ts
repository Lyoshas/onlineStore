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
    Res,
    UseGuards,
    UsePipes,
} from '@nestjs/common';
import {
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiHeader,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AUTH_ENDPOINTS_PREFIX } from './auth.constants';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { SignUpDto, signUpSchema } from './dto/sign-up.dto';
import { EmailAvailabilityPipe } from 'src/common/pipes/email-availability.pipe';
import { RecaptchaGuard } from 'src/common/guards/recaptcha.guard';
import { Host } from 'src/common/decorators/host.decorator';
import {
    SWAGGER_AUTH_TAG,
    SWAGGER_OAUTH_TAG,
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
import {
    SendResetTokenDto,
    sendResetTokenSchema,
} from './dto/send-reset-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SignInDto, signInSchema } from './dto/sign-in.dto';
import { AccountNotActivatedException } from 'src/common/exceptions/account-not-activated.exception';
import { Cookie } from 'src/common/decorators/cookie.decorator';
import {
    GetNewAccessTokenDto,
    getNewAccessTokenSchema,
} from './dto/get-new-access-token.dto';
import {
    GetLinkToOAuthAuthorizationServerDto,
    getLinkToOAuthAuthorizationServerSchema,
} from './dto/get-link-to-oauth-authorization-server.dto';
import { OAuthProvider } from './enums/oauth-provider.enum';
import {
    OAuthCallbackDto,
    oauthCallbackSchema,
} from './dto/oauth-callback.dto';
import { logOutSchema, LogOutDto } from './dto/log-out.dto';

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

    @ApiOperation({
        description:
            'If a user wants to change their password, this endpoint will be used to send a reset link to their email.',
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiOkResponse({
        description:
            'The link has been sent successfully to the specified email',
        example: { msg: 'The link has been sent to the corresponding email' },
    })
    @ApiUnprocessableEntityResponse({
        description: SWAGGER_VALIDATION_ERROR_TEXT,
    })
    @Post('send-reset-token')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RecaptchaGuard)
    async sendResetTokenToEmail(
        @Body(new ZodValidationPipe(sendResetTokenSchema))
        body: SendResetTokenDto,
        @Host() httpHost: string
    ) {
        const email = body.email;
        const userId = await this.authService.getUserIdByEmail(email);

        if (userId === null) {
            throw new ValidationException([
                {
                    message: 'there is no user with the corresponding email',
                    field: 'email',
                },
            ]);
        }

        const resetToken =
            await this.authTokenService.generateUnregisteredToken();
        await this.authTokenService
            .registerToken({
                tokenType: TokenType.RESET_TOKEN,
                token: resetToken,
                userId,
                expirationTimeInSeconds: this.configService.get<number>(
                    'RESET_TOKEN_EXPIRATION_IN_SECONDS'
                )!,
            })
            .exec();

        await this.authService.sendResetPasswordEmailMessage(
            this.authService.generateResetPasswordLink(httpHost, resetToken),
            email
        );

        return {
            msg: 'The link has been sent to the corresponding email',
        };
    }

    @ApiOperation({
        description:
            "After the reset link is sent to the user's email and they follow it, the client (React.js or a mobile app) should make a request to this endpoint to verify whether the reset token is valid. This step is important because if the user followed the link and the link had actually expired, the user would find out about this only after they filled in the form, solved the captcha challenge and sent the form. This would be very frustrating for users. Thus it's important to notify the user about reset token expiration ahead of time by using this endpoint.",
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiOkResponse({
        description: 'The reset token validity has been successfully verified.',
        example: { isValid: true },
    })
    @Get('is-reset-token-valid/:resetToken')
    async isResetTokenValid(@Param('resetToken') resetToken: string) {
        const userId =
            await this.authTokenService.getUserIdByResetToken(resetToken);

        return { isValid: userId !== null };
    }

    @ApiOperation({
        description:
            "Changes a user's password. This endpoint revokes the reset token after the password is changed.",
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiOkResponse({
        description: 'The password has been changed successfully.',
        example: { msg: 'The password has been changed.' },
    })
    @ApiUnprocessableEntityResponse({
        description: SWAGGER_VALIDATION_ERROR_TEXT,
    })
    @Patch('change-password')
    @UseGuards(RecaptchaGuard)
    async changePassword(@Body() changePasswordData: ChangePasswordDto) {
        const { resetToken, password } = changePasswordData;

        const userId =
            await this.authTokenService.getUserIdByResetToken(resetToken);

        if (userId === null) {
            throw new ValidationException([
                {
                    message: 'resetToken is either invalid or has expired',
                    field: 'resetToken',
                },
            ]);
        }

        await this.authService.changePassword(userId, password, resetToken);

        return { msg: 'The password has been changed.' };
    }

    @ApiOperation({
        description:
            "Signs the user in. The user's account must be activated before signing in.",
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiOkResponse({
        description: 'The user has been logged in successfully',
        example: { accessToken: 'JWT_value' },
        headers: {
            'Set-Cookie': {
                description: 'Contains the refresh token',
                schema: {
                    type: 'string',
                    example:
                        'refreshToken=8fbda9857cebcbbcde10047867631e283ff9f91d8222e16f5d95e5d27b83a1a9; Expires=Sun, 29 Sep 2024 10:54:12 GMT; Path=/api/auth; HttpOnly; SameSite=Strict; Domain=localhost',
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Invalid login and/or password',
        example: {
            errors: [
                {
                    message: 'invalid credentials',
                },
            ],
        },
    })
    @ApiForbiddenResponse({
        description: 'Account is not activated',
        example: {
            errors: [
                {
                    message: 'the account is not activated',
                },
            ],
        },
    })
    @ApiUnprocessableEntityResponse({
        description: SWAGGER_VALIDATION_ERROR_TEXT,
    })
    @Post('sign-in')
    @UseGuards(RecaptchaGuard)
    async signIn(
        @Body(new ZodValidationPipe(signInSchema)) signInData: SignInDto,
        @Res({
            // with "passthrough: true" we are leaving the response handling logic to the framework
            passthrough: true,
        })
        response: Response
    ) {
        const { login, password } = signInData;

        const existingUser = await this.authService.getUserByCredentials(
            login,
            password
        );

        if (!existingUser) throw new InvalidCredentialsException();
        if (!existingUser.isActivated) throw new AccountNotActivatedException();

        const refreshToken =
            await this.authTokenService.generateUnregisteredToken();
        await this.authTokenService.registerToken({
            tokenType: TokenType.REFRESH_TOKEN,
            token: refreshToken,
            user: existingUser,
        });

        this.authTokenService.attachRefreshTokenAsCookie(
            response,
            refreshToken
        );

        return {
            accessToken:
                await this.authTokenService.generateAccessToken(existingUser),
        };
    }

    @ApiOperation({
        description:
            'Uses the provided refresh token in the cookie to refresh the access token.',
        summary: 'Requests a new access token',
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiHeader({
        name: 'Set-Cookie',
        description:
            'A valid "refreshToken" must be must be specified as a cookie',
        schema: {
            type: 'string',
            example:
                'refreshToken=8fbda9857cebcbbcde10047867631e283ff9f91d8222e16f5d95e5d27b83a1a9; Expires=Sun, 29 Sep 2024 10:54:12 GMT; Path=/api/auth; HttpOnly; SameSite=Strict; Domain=localhost',
        },
    })
    @ApiOkResponse({
        description:
            'The refresh token is correct, so the renewed access token is provided in the response body',
        example: { accessToken: 'JWT_value' },
    })
    @ApiUnprocessableEntityResponse({
        description:
            'The refresh token is either not specified, invalid, or expired',
        content: {
            'application/json': {
                examples: {
                    TokenNotSpecifiedError: {
                        description: 'The refresh token was not specified',
                        value: {
                            message: 'must be specified',
                            field: 'refreshToken',
                        },
                    },
                    TokenInvalidError: {
                        description:
                            'The refresh token is specified, but is invalid',
                        value: {
                            message: 'invalid refresh token',
                            field: 'refreshToken',
                        },
                    },
                },
            },
        },
    })
    @Get('refresh')
    async getNewAccessToken(
        @Cookie(new ZodValidationPipe(getNewAccessTokenSchema))
        { refreshToken }: GetNewAccessTokenDto
    ) {
        const user =
            await this.authTokenService.getUserByRefreshToken(refreshToken);

        if (user === null) {
            throw new ValidationException([
                {
                    message: 'invalid refresh token',
                    field: 'refreshToken',
                },
            ]);
        }

        return {
            accessToken: await this.authTokenService.generateAccessToken(user),
        };
    }

    @ApiOperation({
        description:
            'Generates and returns a link to the Google/Facebook authorization server. This link is for one-time use only; once it has been used, it cannot be used again. Used for OAuth 2.0 purposes.',
        summary: 'Generates a URL to an OAuth 2.0 authorization server',
    })
    @ApiTags(SWAGGER_OAUTH_TAG)
    @ApiOkResponse({
        description: 'The link has been generated successfully',
        example: { URL: 'http://link-to-the-authorization-server.example' },
    })
    @ApiUnprocessableEntityResponse({
        description: "Invalid 'authorizationServerName' parameter",
        example: {
            errors: [
                {
                    message:
                        'Invalid authorization server name: it can be either "google" or "facebook"',
                    field: 'authorizationServerName',
                },
            ],
        },
    })
    @Get('oauth-link/:authorizationServerName')
    async getLinkToOAuthAuthorizationServer(
        @Param(new ZodValidationPipe(getLinkToOAuthAuthorizationServerSchema))
        { authorizationServerName }: GetLinkToOAuthAuthorizationServerDto
    ) {
        // The "state" parameter is a unique string used to prevent CSRF attacks.
        // It is generated when creating a link to the OAuth 2.0 authorization
        // server and is stored in the database. When the user is redirected back to
        // our application after consenting, the returned "state" parameter is
        // checked against the stored value to ensure the request is valid and it
        // indeed came from the relevant authorization server.
        const stateParameter = await this.authService.generateStateParameter();
        await this.authService.addOAuthStateToDB(
            stateParameter,
            authorizationServerName
        );

        return {
            URL:
                authorizationServerName === OAuthProvider.GOOGLE
                    ? this.authService.getUrlToGoogleAuthorizationServer(
                          stateParameter
                      )
                    : this.authService.getUrlToFacebookAuthorizationServer(
                          stateParameter
                      ),
        };
    }

    @ApiOperation({
        description:
            'A user is redirected to the OAuth 2.0 callback page once they have consented to log in via their Google/Facebook account. They will be redirected to the client (React or mobile app) and the client will then make an API request to this endpoint to get the access token. If the user makes a request here for the first time, the API server will sign the user up, otherwise the user will be logged in.',
        summary: 'OAuth 2.0 callback endpoint (logging in/signing up)',
    })
    @ApiTags(SWAGGER_OAUTH_TAG)
    @ApiOkResponse({
        description:
            'The user was logged in (the corresponding account already exists)',
        example: { accessToken: 'JWT_ACCESS_TOKEN' },
        headers: {
            'Set-Cookie': {
                description: 'Contains the refresh token',
                schema: {
                    type: 'string',
                    example:
                        'refreshToken=8fbda9857cebcbbcde10047867631e283ff9f91d8222e16f5d95e5d27b83a1a9; Expires=Sun, 29 Sep 2024 10:54:12 GMT; Path=/api/auth; HttpOnly; SameSite=Strict; Domain=localhost',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description:
            'The user was signed up (the corresponding account does not exist yet)',
        example: { accessToken: 'JWT_ACCESS_TOKEN' },
        headers: {
            'Set-Cookie': {
                description: 'Contains the refresh token',
                schema: {
                    type: 'string',
                    example:
                        'refreshToken=8fbda9857cebcbbcde10047867631e283ff9f91d8222e16f5d95e5d27b83a1a9; Expires=Sun, 29 Sep 2024 10:54:12 GMT; Path=/api/auth; HttpOnly; SameSite=Strict; Domain=localhost',
                },
            },
        },
    })
    @ApiUnprocessableEntityResponse({
        description: SWAGGER_VALIDATION_ERROR_TEXT,
        content: {
            'application/json': {
                examples: {
                    InvalidStateParameterError: {
                        description:
                            "Invalid 'state' parameter (unauthentic request)",
                        value: {
                            errors: [
                                {
                                    message: 'invalid "state" paremeter',
                                    field: 'state',
                                },
                            ],
                        },
                    },
                    InvalidCodeParameterError: {
                        description:
                            "Invalid 'code' (authorization code) parameter",
                        value: {
                            errors: [
                                {
                                    message: 'invalid authorization code',
                                    field: 'code',
                                },
                            ],
                        },
                    },
                },
            },
        },
    })
    @Post('oauth-callback')
    async oauthCallback(
        @Query(new ZodValidationPipe(oauthCallbackSchema))
        oauthData: OAuthCallbackDto,
        @Res() res: Response
    ) {
        const { accessToken, refreshToken, isSignedUp } =
            await this.authService.oauthCallback(
                oauthData.state,
                oauthData.code
            );
        this.authTokenService.attachRefreshTokenAsCookie(res, refreshToken);

        res.status(isSignedUp ? HttpStatus.CREATED : HttpStatus.OK).json({
            accessToken,
        });
    }

    @ApiOperation({
        description:
            'Deletes the provided refresh token from the DB and removes it as a cookie.',
    })
    @ApiTags(SWAGGER_AUTH_TAG)
    @ApiHeader({
        name: 'Set-Cookie',
        description:
            'A valid "refreshToken" must be must be specified as a cookie',
        schema: {
            type: 'string',
            example:
                'refreshToken=8fbda9857cebcbbcde10047867631e283ff9f91d8222e16f5d95e5d27b83a1a9; Expires=Sun, 29 Sep 2024 10:54:12 GMT; Path=/api/auth; HttpOnly; SameSite=Strict; Domain=localhost',
        },
    })
    @ApiNoContentResponse({
        description:
            'Indicates that the request was successful and the refresh token, if it existed in the database, has been deleted. If the provided refresh token was not found in the database, this response will also be returned to indicate that no changes were made.',
    })
    @ApiUnprocessableEntityResponse({
        description: 'Refresh token was not provided',
        example: {
            errors: [
                {
                    message: 'must be a string',
                    field: 'refreshToken',
                },
            ],
        },
    })
    @Post('logout')
    async handleLogout(
        @Cookie(new ZodValidationPipe(logOutSchema))
        { refreshToken }: LogOutDto,
        @Res() response: Response
    ) {
        // we're not waiting for the execution because there's no point in it
        this.authTokenService.deleteRefreshToken(refreshToken);
        this.authTokenService.detachRefreshTokenAsCookie(response);
        response.sendStatus(HttpStatus.NO_CONTENT);
    }
}
