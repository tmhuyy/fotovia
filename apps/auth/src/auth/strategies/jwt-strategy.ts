import { UserService } from 'src/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SignInUserDto } from '@repo/types';
import { User } from 'src/user/entities/user.entity';
import { JwtValidation } from '../interface/jwt-validation.payload.interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly userService: UserService,
        private readonly configService: ConfigService,
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //get access token from header
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: any) =>
                    req?.cookies?.Authentication || req?.Authentication,
            ]),
        });
    }

    //4th
    async validate(payload: JwtValidation): Promise<User> {
        // doing sth after access token is valid
        const { userId } = payload;
        const user = await this.userService.findOne({ id: userId });

        if (!user) throw new UnauthorizedException('User is not exist');

        return user; // store in request body -> req.user (default in passport)
    }
}
