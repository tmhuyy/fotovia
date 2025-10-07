import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '../../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { SignInUserDto } from '@repo/types';
import { JwtValidation } from '../interface/jwt-validation.payload.interface';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {
        super({ usernameField: 'email' });
    }

    async validate(email: string, password: string): Promise<User> {
        try {
            return await this.userService.verifyUser(email, password);
        } catch (err) {
            throw new UnauthorizedException(err);
        }
    }
}
