import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { ResponseInterceptor } from '@repo/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
    // const logger = new Logger();
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService)
    app.connectMicroservice({
        transport: Transport.TCP,
        options: {
            host: '0.0.0.0',
            port: configService.getOrThrow('TCP_PORT')
        },
    });
    app.use(cookieParser());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useLogger(app.get(Logger));
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle(`Auth Service`)
        .setDescription('The Auth API Description')
        .setVersion('1.0')
        .addBearerAuth()

        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
    await app.startAllMicroservices();
    await app.listen(configService.getOrThrow('HTTP_PORT') || '3000');
}
bootstrap();
