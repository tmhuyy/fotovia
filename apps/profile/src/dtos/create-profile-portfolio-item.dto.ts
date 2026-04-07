import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    ArrayUnique,
    IsArray,
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
        description:
            'Required cover image asset id. Fotovia detects portfolio style automatically after save.',
    })
    @IsUUID()
    coverAssetId: string;

    @ApiPropertyOptional({
        type: [String],
        example: [
            '5fa9cc8c-e71c-4746-b427-da36b06030e2',
            '36a6b5e0-9d64-4f1f-8b15-5a6b8d6bfe71',
        ],
        description:
            'Optional additional gallery image asset ids. These images also contribute to AI style detection.',
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @ArrayMaxSize(8)
    @IsUUID('4', { each: true })
    galleryAssetIds?: string[] = [];

    @ApiPropertyOptional({
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean = false;
}
