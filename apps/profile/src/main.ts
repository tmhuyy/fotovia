import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from '@repo/common';

import { ProfileModule } from './profile.module';

async function bootstrap() {
    const app = await NestFactory.create(ProfileModule);
    const configService = app.get(ConfigService);

    app.use(cookieParser());

    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: configService.getOrThrow('TCP_PORT'),
        },
    });

    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Profile Service')
        .setDescription('The Profile API Description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.startAllMicroservices();
    await app.listen(configService.getOrThrow<number>('HTTP_PORT'));
}

bootstrap();
