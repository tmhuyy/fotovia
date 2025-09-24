import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const AccessTokenConfig = registerAs(
    'access_token',
    (): JwtModuleOptions => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
            expiresIn: process.env.JWT_EXPIRE_IN,
        },
    }),
);
