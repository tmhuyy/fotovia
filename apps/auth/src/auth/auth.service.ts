import {
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { RefreshTokenConfig } from './strategies/config/refresh-token.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import * as moment from 'moment';
import * as ms from 'ms';
import * as bcrypt from 'bcrypt';
import { CheckUserTypeEnum, CreateUserDto, SignInUserDto } from '@repo/types';
import { UserService } from 'src/user/user.service';
import { UserRepository } from 'src/user/repositories/user.repository';
import { User } from 'src/user/entities/user.entity';
import { RefreshTokenPayload } from './interface/refresh-token.payload.interface';
import { AccessTokenPayload } from './interface/access-token.payload.interface';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        @Inject(RefreshTokenConfig.KEY)
        private readonly refreshTokenConfig: ConfigType<
            typeof RefreshTokenConfig
        >,
        private readonly configService: ConfigService,
    ) {}

    async hashToken(value: string) {
        const salt = await bcrypt.genSalt();
        const result = await bcrypt.hash(value, salt);
        return result;
    }

    signUp(createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }

    async signIn(user: User) {
        ///
        // const signedInUser = await this.userService.signIn(signInUserDto);
        ///
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

        console.log(
            `---DEBUG---refreshTokenExpiredTimeMs: ${refreshTokenExpiredTimeMs}`,
        );
        console.log(`---DEBUG---now:${now}`);
        console.log(`---DEBUG---loggedInAtUtc:${moment.utc(loggedInAt)}`);
        console.log(
            `---DEBUG---duration between loggedInAt and now : ${now.diff(moment.utc(loggedInAt), 'minute')} mins`,
        );

        if (elapsedMs > refreshTokenExpiredTimeMs) {
            throw new UnauthorizedException('Expired Refresh Token');
        }
    }

    async refreshToken(user: User, refresh_token: string) {
        try {
            this.checkExpiredRefreshToken(user.loggedInAt);
        } catch (err) {
            throw new UnauthorizedException(err);
        }

        const compared: boolean = await bcrypt.compare(
            refresh_token,
            user.hashedRefreshToken,
        );

        if (!compared) throw new UnauthorizedException('Invalid Refresh Token');

        const payload: RefreshTokenPayload = {
            userId: user.id,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);

        const hashedRefreshToken = await this.hashToken(refreshToken);

        await this.userService.save({ ...user, hashedRefreshToken });

        return { accessToken, refreshToken };
    }

    // async findUser(userId: string) {
    //     const foundUser = await this.userRepository.findOne({
    //         where: { id: userId },
    //     });
    //     if (!foundUser) throw new NotFoundException('User is not exist');

    //     return foundUser;
    // }

    async signOut(user: User) {
        await this.userService.save({
            ...user,
            hashedRefreshToken: null,
            loggedInAt: null,
        });
    }
}
