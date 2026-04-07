import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ASSET_SERVICE, AUTH_SERVICE } from '@repo/common';

import { ConfigSchemaValidation } from './config.schema';
import { PortfolioItemClassificationMapper } from './classification/portfolio-item-classification.mapper';
import { PortfolioItemClassificationProcessor } from './classification/portfolio-item-classification.processor';
import { PortfolioItemClassificationService } from './classification/portfolio-item-classification.service';
import { PORTFOLIO_ITEM_CLASSIFICATION_QUEUE } from './classification/portfolio-item-classification.constants';
import { ProfileController } from './profile.controller';
import { ProfilePortfolioItemImageClassification } from './entities/profile-portfolio-item-image-classification.entity';
import { ProfilePortfolioItemImage } from './entities/profile-portfolio-item-image.entity';
import { ProfilePortfolioItem } from './entities/profile-portfolio-item.entity';
import { Profile } from './entities/profile.entity';
import { ProfilePortfolioItemImageClassificationRepository } from './repositories/profile-portfolio-item-image-classification.repository';
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
        TypeOrmModule.forFeature([
            Profile,
            ProfilePortfolioItem,
            ProfilePortfolioItemImage,
            ProfilePortfolioItemImageClassification,
        ]),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                connection: {
                    host: configService.getOrThrow('REDIS_HOST'),
                    port: Number(configService.getOrThrow('REDIS_PORT')),
                    db: Number(configService.get('REDIS_DB') ?? 0),
                    password:
                        configService.get<string>('REDIS_PASSWORD') ||
                        undefined,
                },
            }),
        }),
        BullModule.registerQueue({
            name: PORTFOLIO_ITEM_CLASSIFICATION_QUEUE,
        }),
        HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                baseURL: configService.getOrThrow('AI_CLASSIFIER_BASE_URL'),
                timeout: Number(
                    configService.get('AI_CLASSIFIER_TIMEOUT_MS') ?? 20000,
                ),
                maxRedirects: 5,
            }),
        }),
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
        ProfilePortfolioItemImageClassificationRepository,
        PortfolioItemClassificationMapper,
        PortfolioItemClassificationService,
        PortfolioItemClassificationProcessor,
    ],
    controllers: [ProfileController],
})
export class ProfileModule {}
