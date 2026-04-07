import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AUTH_SERVICE } from '@repo/common';

import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { ConfigSchemaValidation } from './config.schema';
import { Booking } from './entities/booking.entity';
import { BookingEvent } from './entities/booking-event.entity';
import { BookingRepository } from './repositories/booking.repository';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`.env`],
            validationSchema: ConfigSchemaValidation,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    type: 'postgres',
                    autoLoadEntities: true,
                    synchronize: false,
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    ssl: {
                        rejectUnauthorized: false,
                    },
                };
            },
        }),
        TypeOrmModule.forFeature([Booking, BookingEvent]),
        ClientsModule.registerAsync([
            {
                name: AUTH_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: async (configService: ConfigService) => {
                    return {
                        transport: Transport.TCP,
                        options: {
                            host: configService.get('AUTH_TCP_HOST'),
                            port: configService.get('AUTH_TCP_PORT'),
                        },
                    };
                },
            },
        ]),
    ],
    providers: [BookingService, BookingRepository],
    controllers: [BookingController],
})
export class BookingModule {}
