import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ASSET_SERVICE, AUTH_SERVICE } from '@repo/common';

import { ConfigSchemaValidation } from './config.schema';
import { ProfileController } from './profile.controller';
import { ProfilePortfolioItemImage } from './entities/profile-portfolio-item-image.entity';
import { ProfilePortfolioItem } from './entities/profile-portfolio-item.entity';
import { Profile } from './entities/profile.entity';
import { ProfilePortfolioItemImageRepository } from './repositories/profile-portfolio-item-image.repository';
import { ProfilePortfolioItemRepository } from './repositories/profile-portfolio-item.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { ProfileService } from './profile.service';

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

        TypeOrmModule.forFeature([
            Profile,
            ProfilePortfolioItem,
            ProfilePortfolioItemImage,
        ]),

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
    providers: [
        ProfileService,
        ProfileRepository,
        ProfilePortfolioItemRepository,
        ProfilePortfolioItemImageRepository,
    ],
    controllers: [ProfileController],
})
export class ProfileModule {}
