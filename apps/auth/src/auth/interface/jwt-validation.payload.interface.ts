import { AccessTokenPayload } from './access-token.payload.interface';

export interface JwtValidation extends Partial<AccessTokenPayload>
{
    iat: number,
    exp:  number
}
