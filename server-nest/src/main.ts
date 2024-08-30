import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DefaultExceptionFilter } from './common/filters/default-exception.filter';
import { SWAGGER_AUTH_TAG } from './common/common.constants';
import { EnvironmentVariables } from './env-schema';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService =
        app.get<ConfigService<EnvironmentVariables>>(ConfigService);
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
    app.useGlobalFilters(new DefaultExceptionFilter());

    // the DocumentBuilder helps to structure a base document that conforms to the OpenAPI Specification
    const config = new DocumentBuilder()
        .setTitle('OnlineStore API')
        .setDescription(
            'This documentation contains all REST endpoints and GraphQL queries/mutations'
        )
        .setVersion('1.0')
        .addTag(SWAGGER_AUTH_TAG)
        .build();
    // creating a full document (with all HTTP routes defined)
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    await app.listen(3000);
}
bootstrap();
