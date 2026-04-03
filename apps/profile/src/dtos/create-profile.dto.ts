import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    Min,
    ArrayMaxSize,
    ArrayUnique,
} from 'class-validator';
import { UserRole } from '@repo/types';
export class CreateProfileDto {
    @ApiProperty({
        enum: UserRole,
        example: UserRole.CLIENT,
    })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiPropertyOptional({
        example: 'Huy Tran',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string;

    @ApiPropertyOptional({
        example: 'https://cdn.fotovia.com/avatars/huy.jpg',
    })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiPropertyOptional({
        example: '0987654321',
    })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @ApiPropertyOptional({
        example: 'Ho Chi Minh City',
    })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    location?: string;

    @ApiPropertyOptional({
        example: 'Photographer specializing in couple and wedding shoots.',
    })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({
        example: ['wedding', 'portrait'],
        type: [String],
        isArray: true,
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @ArrayMaxSize(20)
    @IsString({ each: true })
    specialties?: string[];

    @ApiPropertyOptional({
        example: 500000,
        description: 'Price per hour in VND',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    pricePerHour?: number;

    @ApiPropertyOptional({
        example: 3,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    experienceYears?: number;
}
