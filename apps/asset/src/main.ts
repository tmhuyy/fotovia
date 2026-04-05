import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

import { ResponseInterceptor } from '@repo/common';

import { AssetModule } from './asset.module';

async function bootstrap() {
    const app = await NestFactory.create(AssetModule);
    const configService = app.get(ConfigService);

    app.enableCors({
        origin: [configService.getOrThrow('NEXT_APP_URL')],
        credentials: true,
    });

    app.use(cookieParser());

    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: configService.getOrThrow<number>('TCP_PORT'),
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
        .setTitle('Asset Service')
        .setDescription('The Asset API Description')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.startAllMicroservices();
    await app.listen(configService.getOrThrow<number>('HTTP_PORT'));
}

bootstrap();
