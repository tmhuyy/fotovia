import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigSchemaValidation } from './config.schema';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingRepository } from './repositories/booking.repository';
import { Booking } from './entities/booking.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE } from '@repo/common';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`.env`],
            validationSchema: ConfigSchemaValidation,
        }),
        // LoggerModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    type: 'postgres',
                    autoLoadEntities: true,
                    synchronize: true, // for data migration,
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                };
            },
        }),
        TypeOrmModule.forFeature([Booking]),
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
