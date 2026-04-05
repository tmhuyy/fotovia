import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetPurpose, AssetResourceType, AssetVisibility } from '@repo/types';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    MaxLength,
} from 'class-validator';

export class CreateUploadSessionDto {
    @ApiProperty({
        enum: AssetPurpose,
        example: AssetPurpose.AVATAR,
    })
    @IsEnum(AssetPurpose)
    purpose: AssetPurpose;

    @ApiPropertyOptional({
        enum: AssetVisibility,
        default: AssetVisibility.PUBLIC,
    })
    @IsOptional()
    @IsEnum(AssetVisibility)
    visibility?: AssetVisibility = AssetVisibility.PUBLIC;

    @ApiPropertyOptional({
        enum: AssetResourceType,
        default: AssetResourceType.IMAGE,
    })
    @IsOptional()
    @IsEnum(AssetResourceType)
    resourceType?: AssetResourceType = AssetResourceType.IMAGE;

    @ApiProperty({
        example: 'profile-avatar.jpg',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    originalFilename: string;

    @ApiProperty({
        example: 'image/jpeg',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    mimeType: string;

    @ApiProperty({
        example: 524288,
        description: 'Original file size in bytes.',
    })
    @IsInt()
    @IsPositive()
    @Max(50 * 1024 * 1024)
    sizeBytes: number;
}
