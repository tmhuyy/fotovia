import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { SignInUserDto } from '@repo/types';
import { JwtValidation } from '../interface/jwt-validation.payload.interface';
import { Request } from 'express';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
    Strategy,
    'refresh-auth',
) {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('REFRESH_JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.RefreshToken,
            ]),
        });
    }

    async validate(payload: JwtValidation): Promise<User> {
        // doing sth after access token is valid
        const { userId } = payload;
        const user = await this.userService.findOne({ id: userId });

        if (!user) throw new UnauthorizedException('User is not exist');

        return user; // store in request body
    }
}
