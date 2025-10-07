import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt-strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessTokenConfig } from './strategies/config/access-token.config';
import { RefreshTokenConfig } from './strategies/config/refresh-token.config';
import { RefreshJwtStrategy } from './strategies/refresh-fwt-strategy';
import { UserModule } from 'src/user/user.module';
import { LocalStrategy } from './strategies/local-strategy';

@Module({
    imports: [
        ConfigModule.forFeature(AccessTokenConfig),
        JwtModule.registerAsync(AccessTokenConfig.asProvider()),
        ConfigModule.forFeature(RefreshTokenConfig),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        // JwtModule.registerAsync({
        //     imports: [ConfigModule],
        //     inject: [ConfigService],
        //     useFactory: async (configService: ConfigService) => {
        //         return {
        //             secret: configService.get('JWT_SECRET'),
        //             signOptions: {
        //                 expiresIn: +configService.get('JWT_EXPIRE_IN'),
        //             },
        //         };
        //     },
        // }),
        UserModule, // or just UserModule if there's no circular dependency
    ],
    providers: [AuthService, JwtStrategy, RefreshJwtStrategy, LocalStrategy],
    exports: [JwtStrategy, RefreshJwtStrategy, PassportModule], // any module import authModule can use these dependency injection
    controllers: [AuthController],
})
export class AuthModule {}
