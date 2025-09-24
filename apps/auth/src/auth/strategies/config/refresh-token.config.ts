import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from '@nestjs/jwt';

export const RefreshTokenConfig = registerAs(
    'refresh_token',
    (): JwtSignOptions => ({
        secret: process.env.REFRESH_JWT_SECRET,
        expiresIn: process.env.REFRESH_JWT_EXPIRE_IN,
    }),
);
