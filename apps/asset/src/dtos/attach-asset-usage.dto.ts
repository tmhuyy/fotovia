import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetUsageRole } from '@repo/types';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';

export class AttachAssetUsageDto {
    @ApiProperty({
        format: 'uuid',
    })
    @IsUUID()
    assetId: string;

    @ApiProperty({
        example: 'profile',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    serviceName: string;

    @ApiProperty({
        example: 'profile',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    entityType: string;

    @ApiProperty({
        example: '5fa9cc8c-e71c-4746-b427-da36b06030e2',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    entityId: string;

    @ApiProperty({
        example: 'avatar',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    fieldName: string;

    @ApiPropertyOptional({
        enum: AssetUsageRole,
        default: AssetUsageRole.PRIMARY,
    })
    @IsOptional()
    @IsEnum(AssetUsageRole)
    usageRole?: AssetUsageRole = AssetUsageRole.PRIMARY;

    @ApiPropertyOptional({
        example: 1,
    })
    @IsOptional()
    @IsInt()
    sortOrder?: number;

    @ApiPropertyOptional({
        default: false,
        description:
            'Detach existing active usages for the same service/entity/field before attaching the new one.',
    })
    @IsOptional()
    @IsBoolean()
    replaceExistingActiveUsage?: boolean = false;
}
