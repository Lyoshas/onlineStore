import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { EnvironmentVariables } from 'src/env-schema';

@Injectable()
export class EmailService implements OnModuleInit {
    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>
    ) {}

    onModuleInit() {
        sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY')!);
    }

    sendEmail(recipient: string, subject: string, htmlMessage: string) {
        return sgMail.send({
            to: recipient,
            from: this.configService.get<string>('SENDGRID_FROM_EMAIL')!,
            subject,
            html: htmlMessage,
        });
    }
}
