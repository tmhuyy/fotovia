import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PROFILE_SERVICE } from '@repo/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt-strategy';
import { AccessTokenConfig } from './strategies/config/access-token.config';
import { RefreshTokenConfig } from './strategies/config/refresh-token.config';
import { RefreshJwtStrategy } from './strategies/refresh-fwt-strategy';
import { LocalStrategy } from './strategies/local-strategy';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        ConfigModule.forFeature(AccessTokenConfig),
        JwtModule.registerAsync(AccessTokenConfig.asProvider()),
        ConfigModule.forFeature(RefreshTokenConfig),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ClientsModule.registerAsync([
            {
                name: PROFILE_SERVICE,
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: async (configService: ConfigService) => ({
                    transport: Transport.TCP,
                    options: {
                        host: configService.getOrThrow('PROFILE_TCP_HOST'),
                        port: configService.getOrThrow('PROFILE_TCP_PORT'),
                    },
                }),
            },
        ]),
        UserModule,
    ],
    providers: [AuthService, JwtStrategy, RefreshJwtStrategy, LocalStrategy],
    exports: [JwtStrategy, RefreshJwtStrategy, PassportModule],
    controllers: [AuthController],
})
export class AuthModule {}
