import { HttpService } from '@nestjs/axios';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { EnvironmentVariables } from 'src/env-schema';
import { ValidationException } from '../exceptions/validation.exception';
import { RECAPTCHA_TOKEN_NAME } from '../common.constants';

@Injectable()
export class RecaptchaGuard implements CanActivate {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService<EnvironmentVariables>
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context
            .switchToHttp()
            .getRequest<
                Request<unknown, unknown, { recaptchaToken: string }>
            >();

        // making a request to Google API to verify the captcha
        const { data } = await firstValueFrom(
            this.httpService.post(
                'https://www.google.com/recaptcha/api/siteverify?' +
                    new URLSearchParams({
                        secret: this.configService.get<string>(
                            'RECAPTCHA_SECRET_KEY'
                        )!,
                        response: req.body.recaptchaToken,
                        // user's IP address
                        remoteip: req.socket.remoteAddress || '',
                    }).toString()
            )
        );

        if (data.success) return true;
        throw new ValidationException([
            {
                message: 'must be correct',
                field: RECAPTCHA_TOKEN_NAME,
            },
        ]);
    }
}
