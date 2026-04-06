import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AUTH_SERVICE } from '@repo/common';

import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { ConfigSchemaValidation } from './config.schema';
import { AssetUploadSession } from './entities/asset-upload-session.entity';
import { AssetUsage } from './entities/asset-usage.entity';
import { Asset } from './entities/asset.entity';
import { SupabaseModule } from './infrastructure/supabase/supabase.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
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
                    port: Number(configService.get('DB_PORT')),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    ssl: {
                        rejectUnauthorized: false,
                    },
                };
            },
        }),
        TypeOrmModule.forFeature([Asset, AssetUploadSession, AssetUsage]),
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
        ]),
        SupabaseModule,
    ],
    providers: [AssetService],
    controllers: [AssetController],
})
export class AssetModule {}
