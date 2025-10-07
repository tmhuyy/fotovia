import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigSchemaValidation } from './config.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: [`.env`],
            validationSchema: ConfigSchemaValidation,
        }),
        LoggerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                // const isProduction = configService.get('ENV') === "DEV";
                const isProduction = true;
                return {
                    pinoHttp: {
                        transport: isProduction
                            ? undefined
                            : {
                                  target: 'pino-pretty',
                                  options: {
                                      colorize: true,
                                      singleLine: false,
                                      levelFirst: true,
                                  },
                              },
                        level: isProduction ? 'info' : 'debug',
                    },
                };
            },
        }),
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
        UserModule,
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
