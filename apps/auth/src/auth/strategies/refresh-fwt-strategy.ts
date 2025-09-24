import { UserRepository } from '../repositories/user.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SignInUserDto } from '../dtos/signin-user.dto';
import { User } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, "refresh-auth") {
  constructor(
    
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('REFRESH_JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromBodyField("refresh_token"),
    });
  }

  async validate(payload: SignInUserDto): Promise<User> {
    // doing sth after access token is valid
    const { username } = payload;
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user) throw new UnauthorizedException('User is not exist');

    return user; // store in request body
  }
}
