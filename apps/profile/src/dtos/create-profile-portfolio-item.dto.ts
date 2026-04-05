import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';

export class CreateProfilePortfolioItemDto {
    @ApiProperty({
        example: 'Golden hour wedding ceremony',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @ApiProperty({
        example:
            'A warm outdoor ceremony with natural light and candid emotion.',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        format: 'uuid',
        example: '5fa9cc8c-e71c-4746-b427-da36b06030e2',
    })
    @IsUUID()
    assetId: string;

    @ApiProperty({
        example: 'wedding',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    category: string;

    @ApiPropertyOptional({
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean = false;
}
