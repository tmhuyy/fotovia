import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ASSET_SERVICE, AUTH_SERVICE } from '@repo/common';

import { ConfigSchemaValidation } from './config.schema';
import { ProfileController } from './profile.controller';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { ProfileRepository } from './repositories/profile.repository';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            validationSchema: ConfigSchemaValidation,
        }),

        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    type: 'postgres',
                    autoLoadEntities: true,
                    synchronize: configService.get('ENV') === 'DEV',
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

        TypeOrmModule.forFeature([Profile]),

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
                            port: Number(configService.get('AUTH_TCP_PORT')),
                        },
                    };
                },
            },
            {
                name: ASSET_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: async (configService: ConfigService) => {
                    return {
                        transport: Transport.TCP,
                        options: {
                            host: configService.get('ASSET_TCP_HOST'),
                            port: Number(configService.get('ASSET_TCP_PORT')),
                        },
                    };
                },
            },
        ]),
    ],
    providers: [ProfileService, ProfileRepository],
    controllers: [ProfileController],
})
export class ProfileModule {}
