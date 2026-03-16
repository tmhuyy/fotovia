import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayUnique,
    IsArray,
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { ProfileRole } from '../entities/profile.entity';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        enum: ProfileRole,
        example: ProfileRole.PHOTOGRAPHER,
    })
    @IsOptional()
    @IsEnum(ProfileRole)
    role?: ProfileRole;

    @ApiPropertyOptional({ example: 'Huy Tran' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    fullName?: string;

    @ApiPropertyOptional({ example: 'https://cdn.fotovia.com/avatar.jpg' })
    @IsOptional()
    @IsString()
    avatarUrl?: string;

    @ApiPropertyOptional({ example: '0987654321' })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    phone?: string;

    @ApiPropertyOptional({ example: 'Ho Chi Minh City' })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    location?: string;

    @ApiPropertyOptional({ example: 'Wedding photographer' })
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

    @ApiPropertyOptional({ example: 500000 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    pricePerHour?: number;

    @ApiPropertyOptional({ example: 3 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    experienceYears?: number;
}
