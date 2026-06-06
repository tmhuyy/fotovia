import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateBookingApplicationDto {
    @ApiProperty({
        description:
            'Short message from photographer to explain why they are suitable for this photoshoot.',
        example:
            'I have experience with outdoor couple portraits and can match your natural-light concept.',
    })
    @IsString()
    @MinLength(20)
    @MaxLength(1000)
    message: string;

    @ApiProperty({
        description: 'Photographer proposed price in VND.',
        example: 1500000,
    })
    @IsInt()
    @Min(0)
    proposedPrice: number;

    @ApiProperty({
        description:
            'What is included in the proposed package, such as duration, edited photos, delivery time, or add-ons.',
        example:
            '2-hour session, 30 edited photos, online gallery within 5 days.',
    })
    @IsString()
    @MinLength(5)
    @MaxLength(1000)
    includedDeliverables: string;

    @ApiProperty({
        description:
            'Photographer confirms they are available on the requested session date.',
        example: true,
    })
    @IsBoolean()
    availableOnRequestedDate: boolean;

    @ApiPropertyOptional({
        description:
            'Optional custom duration proposed by the photographer. Keep as string to match existing booking duration format.',
        example: '120',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    estimatedDuration?: string;
}
