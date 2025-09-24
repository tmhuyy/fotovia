import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from './repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt-strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessTokenConfig } from './strategies/config/access-token.config';
import { RefreshTokenConfig } from './strategies/config/refresh-token.config';
import { RefreshJwtStrategy } from './strategies/refresh-fwt-strategy';

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
        TypeOrmModule.forFeature([User]),
    ],
    providers: [AuthService, UserRepository, JwtStrategy, RefreshJwtStrategy],
    exports: [JwtStrategy, RefreshJwtStrategy, PassportModule], // any module import authModule can use these dependency injection
    controllers: [AuthController],
})
export class AuthModule {}
