import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { REQUEST_USER_AUTH_FIELD } from 'src/common/common.constants';
import { AuthTokenService } from '../auth-token/auth-token.service';
import { AccessTokenPayload } from '../interfaces/access-token-payload.interface';

declare global {
    namespace Express {
        interface Request {
            user: AccessTokenPayload | null;
        }
    }
}

@Injectable()
export class IdentifyUserMiddleware implements NestMiddleware {
    constructor(private readonly authTokenService: AuthTokenService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        req[REQUEST_USER_AUTH_FIELD] = null;
        const accessToken = this.extractTokenFromHeader(req);
        if (accessToken === null) return next();
        const authUser =
            await this.authTokenService.getUserByAccessToken(accessToken);
        req[REQUEST_USER_AUTH_FIELD] = authUser;
        next();
    }

    private extractTokenFromHeader(request: Request): string | null {
        return request.headers.authorization?.split(' ')[1] || null;
    }
}
