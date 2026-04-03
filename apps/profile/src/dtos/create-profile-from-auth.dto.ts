import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { UserRole } from '@repo/types';

export class CreateProfileFromAuthDto {
    @ApiProperty({ example: '4f0d5a87-6c12-4f62-9b0c-2d4c1f4b0f3c' })
    @IsUUID()
    userId: string;

    @ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ example: 'Huy Tran' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    fullName: string;
}
