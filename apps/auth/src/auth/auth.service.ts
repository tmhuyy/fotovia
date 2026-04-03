import { ExpiredTimeType } from './enum/expired_time_type.enum';
import {
    BadRequestException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenConfig } from './strategies/config/refresh-token.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as moment from 'moment';
import * as ms from 'ms';
import * as bcrypt from 'bcrypt';

import { PROFILE_SERVICE } from '@repo/common';
import { CreateUserDto } from '@repo/types';

import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { RefreshTokenPayload } from './interface/refresh-token.payload.interface';
import { AccessTokenPayload } from './interface/access-token.payload.interface';
import { Request, Response } from 'express';

type CreateProfileFromSignupPayload = {
    userId: string;
    role: User['role'];
    fullName: string;
};

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @Inject(RefreshTokenConfig.KEY)
        private readonly refreshTokenConfig: ConfigType<
            typeof RefreshTokenConfig
        >,
        private readonly configService: ConfigService,
        @Inject(PROFILE_SERVICE)
        private readonly profileClient: ClientProxy,
    ) {}

    private cookieType = {
        [ExpiredTimeType.JWT_EXPIRE_IN]: 'Authentication',
        [ExpiredTimeType.REFRESH_JWT_EXPIRE_IN]: 'RefreshToken',
    };

    async hashToken(value: string) {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(value, salt);
    }

    async signUp(createUserDto: CreateUserDto) {
        const createdUser = await this.userService.createUser(createUserDto);

        try {
            await firstValueFrom(
                this.profileClient.send('profile.create_from_signup', {
                    userId: createdUser.id,
                    role: createdUser.role,
                    fullName: createUserDto.fullName,
                } satisfies CreateProfileFromSignupPayload),
            );
        } catch {
            await this.userService.deleteById(createdUser.id);
            throw new BadRequestException(
                'Sign up failed while creating the user profile.',
            );
        }

        return {
            user: {
                id: createdUser.id,
                email: createdUser.email,
                role: createdUser.role,
            },
        };
    }

    async signIn(user: User, response: Response) {
        const payload: AccessTokenPayload = {
            userId: user.id,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);

        const hashedRefreshToken = await this.hashToken(refreshToken);

        await this.userService.save({
            ...user,
            hashedRefreshToken,
            loggedInAt: moment(Date.now()),
        });

        this.storeTokenToCookie(
            response,
            accessToken,
            ExpiredTimeType.JWT_EXPIRE_IN,
        );
        this.storeTokenToCookie(
            response,
            refreshToken,
            ExpiredTimeType.REFRESH_JWT_EXPIRE_IN,
        );

        return { accessToken, refreshToken };
    }

    checkExpiredRefreshToken(loggedInAt: moment.Moment) {
        const refreshTokenExpiredTimeMs = ms(
            this.configService.getOrThrow<string>(
                'REFRESH_JWT_EXPIRE_IN',
            ) as unknown as ms.StringValue,
        );

        const now = moment.utc();
        const elapsedMs = now.diff(moment.utc(loggedInAt), 'milliseconds');

        if (elapsedMs > refreshTokenExpiredTimeMs) {
            throw new UnauthorizedException('Expired Refresh Token');
        }
    }

    async refreshToken(user: User, response: Response, request: Request) {
        try {
            this.checkExpiredRefreshToken(user.loggedInAt);
        } catch (err) {
            throw new UnauthorizedException(err);
        }

        const compared: boolean = await bcrypt.compare(
            request?.cookies?.RefreshToken,
            user.hashedRefreshToken,
        );

        if (!compared) {
            throw new UnauthorizedException('Invalid Refresh Token');
        }

        const payload: RefreshTokenPayload = {
            userId: user.id,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);

        this.storeTokenToCookie(
            response,
            accessToken,
            ExpiredTimeType.JWT_EXPIRE_IN,
        );
        this.storeTokenToCookie(
            response,
            refreshToken,
            ExpiredTimeType.REFRESH_JWT_EXPIRE_IN,
        );

        const hashedRefreshToken = await this.hashToken(refreshToken);

        await this.userService.save({
            ...user,
            hashedRefreshToken,
        });

        return { accessToken, refreshToken };
    }

    async signOut(user: User, response: Response) {
        await this.userService.save({
            ...user,
            hashedRefreshToken: null,
            loggedInAt: null,
        });

        this.clearAuthCookies(response);
        return {
            success: true,
        };
    }

    storeTokenToCookie(
        response: Response,
        token: string,
        expiredTimeType: ExpiredTimeType,
    ) {
        const tokenExpiredTimeSecond =
            ms(
                this.configService.getOrThrow<string>(
                    expiredTimeType,
                ) as unknown as ms.StringValue,
            ) / 1000;

        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + tokenExpiredTimeSecond);

        response.cookie(this.cookieType[expiredTimeType], token, {
            httpOnly: true,
            expires,
        });
    }

    private clearAuthCookies(response: Response) {
        response.clearCookie('Authentication');
        response.clearCookie('RefreshToken');
    }

    getMe(user: User) {
        return {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
