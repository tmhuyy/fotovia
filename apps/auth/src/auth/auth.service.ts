import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInUserDto } from './dtos/signin-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenConfig } from './strategies/config/refresh-token.config';
import { ConfigType } from '@nestjs/config';
import { User } from './entities/user.entity';
import { AccessToken } from './interface/access-token.interface';

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

    signUp(createUserDto: CreateUserDto) {
        return this.userRepository.createUser(createUserDto);
    }

    async signIn(signInUserDto: SignInUserDto) {
        const payload = await this.userRepository.signIn(signInUserDto);

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);

        return { accessToken, refreshToken };
    }

    async refreshToken(user: User) {
        console.log(user);
        const { password: hashedPassword, username } = user;

        const foundUser = await this.userRepository.checkUser(username);

        const payload: Partial<AccessToken> = {
            username: foundUser.username,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(payload, this.refreshTokenConfig),
        ]);

        return { accessToken, refreshToken };
    }
}
