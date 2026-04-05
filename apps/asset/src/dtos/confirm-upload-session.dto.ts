import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsObject,
    IsOptional,
    IsPositive,
    IsString,
    Max,
} from 'class-validator';

export class ConfirmUploadSessionDto {
    @ApiPropertyOptional({
        example:
            '3b4c8ec7d4b2f1f39b846f0b5f7c8e76e8a0f2e0a0c0d4b5f8a9c1d2e3f4a5b6',
    })
    @IsOptional()
    @IsString()
    checksumSha256?: string;

    @ApiPropertyOptional({
        example: 1080,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Max(100000)
    width?: number;

    @ApiPropertyOptional({
        example: 1350,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Max(100000)
    height?: number;

    @ApiPropertyOptional({
        example: 12000,
        description: 'Duration in milliseconds for video/audio assets.',
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    durationMs?: number;

    @ApiPropertyOptional({
        example: {
            source: 'frontend-upload',
            note: 'first avatar upload',
        },
    })
    @IsOptional()
    @IsObject()
    metadataJson?: Record<string, unknown>;
}
