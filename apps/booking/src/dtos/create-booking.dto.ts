import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from 'class-validator';

export class CreateBookingDto {
    @ApiProperty({
        description: 'Selected photographer profile id',
        format: 'uuid',
    })
    @IsUUID()
    photographerProfileId: string;

    @ApiProperty({
        description: 'Selected photographer public slug',
        example: 'anna-nguyen',
    })
    @IsString()
    @IsNotEmpty()
    photographerSlug: string;

    @ApiProperty({
        description: 'Selected photographer display name snapshot',
        example: 'Anna Nguyen',
    })
    @IsString()
    @IsNotEmpty()
    photographerName: string;

    @ApiProperty({
        description: 'Requested session type',
        example: 'editorial',
    })
    @IsString()
    @IsNotEmpty()
    sessionType: string;

    @ApiProperty({
        description: 'Requested session date',
        example: '2026-04-20',
    })
    @IsString()
    @IsNotEmpty()
    sessionDate: string;

    @ApiProperty({
        description: 'Requested session time',
        example: '15:30',
    })
    @IsString()
    @IsNotEmpty()
    sessionTime: string;

    @ApiProperty({
        description: 'Requested duration',
        example: '120',
    })
    @IsString()
    @IsNotEmpty()
    duration: string;

    @ApiProperty({
        description: 'Requested session location',
        example: 'Ho Chi Minh City',
    })
    @IsString()
    @MinLength(2)
    location: string;

    @ApiProperty({
        description: 'Budget range selection',
        example: '1000-2500',
    })
    @IsString()
    @IsNotEmpty()
    budget: string;

    @ApiProperty({
        description: 'Preferred contact method',
        example: 'email',
    })
    @IsString()
    @IsNotEmpty()
    contactPreference: string;

    @ApiProperty({
        description: 'Shoot concept / creative brief',
        example:
            'Modern outdoor editorial portraits for a personal brand refresh.',
    })
    @IsString()
    @MinLength(10)
    concept: string;

    @ApiPropertyOptional({
        description: 'Optional inspiration notes or reference link',
        example: 'Soft golden hour lighting with cinematic framing.',
    })
    @IsOptional()
    @IsString()
    inspiration?: string;

    @ApiPropertyOptional({
        description: 'Optional extra notes',
        example: 'Need final images before the campaign launch.',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}
