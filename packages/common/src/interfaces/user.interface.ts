import { Moment } from 'moment';

export interface IUser
{
    id: string;
    email: string;
    hashedRefreshToken?: string | null;
    loggedInAt?: Moment | null; // ISO string preferred, not Moment
    createdAt: Date;
    updatedAt: Date;
}
