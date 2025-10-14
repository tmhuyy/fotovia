import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { BookingModule } from './booking.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { ResponseInterceptor } from '@repo/common';

async function bootstrap() {
    const app = await NestFactory.create(BookingModule);
    const configService = app.get(ConfigService)
    app.use(cookieParser());
    app.useGlobalInterceptors(new ResponseInterceptor());
    // app.useLogger(app.get(Logger));
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle(`Booking Service`)
        .setDescription('The Booking API Description')
        .setVersion('1.0')
        .addBearerAuth()

        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(configService.getOrThrow('HTTP_PORT') || '4000');
}
bootstrap();
