import {
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInUserDto } from './dtos/signin-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenConfig } from './strategies/config/refresh-token.config';
import { ConfigType } from '@nestjs/config';
import { User } from './entities/user.entity';
import { AccessToken } from './interface/access-token.interface';
import * as bcrypt from 'bcrypt';
import { CheckUserTypeEnum } from './enum/check-user.type.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        @Inject(RefreshTokenConfig.KEY)
        private readonly refreshTokenConfig: ConfigType<
            typeof RefreshTokenConfig
        >,
    ) {}

    async hashToken(value: string) {
        const salt = await bcrypt.genSalt();
        const result = await bcrypt.hash(value, salt);
        return result;
    }

    signUp(createUserDto: CreateUserDto) {
        return this.userRepository.createUser(createUserDto);
    }

    async signIn(signInUserDto: SignInUserDto) {
        const signedInUser = await this.userRepository.signIn(signInUserDto);

        const payload = {
            username: signedInUser.username,
            userId: signedInUser.id,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);

        const hashedRefreshToken = await this.hashToken(refreshToken);

        await this.userRepository.save({
            ...signedInUser,
            hashedRefreshToken,
        });

        return { accessToken, refreshToken };
    }

    async refreshToken(user: User, refresh_token: string) {
        const compared: boolean = await bcrypt.compare(
            refresh_token,
            user.hashedRefreshToken,
        );

        if (!compared) throw new UnauthorizedException('Invalid Refresh Token');

        const payload = {
            username: user.username,
            userId: user.id,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);

        const hashedRefreshToken = await this.hashToken(refreshToken);

        this.userRepository.save({
            ...user,
            hashedRefreshToken,
        });

        return { accessToken, refreshToken };
    }

    async findUser(userId: string) {
        const foundUser = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!foundUser) throw new NotFoundException('User is not exist');

        return foundUser;
    }

    async signOut(user: User) {
        const foundUser = await this.userRepository.checkUser(
            user.id,
            CheckUserTypeEnum.USER_ID,
        );

        await this.userRepository.save({
            ...foundUser,
            hashedRefreshToken: null,
        });

        return 'Success';
    }
}
