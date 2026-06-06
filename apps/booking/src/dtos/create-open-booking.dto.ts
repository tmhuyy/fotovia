import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    ValidateIf,
} from 'class-validator';

import { BOOKING_SHOOT_TYPES } from './create-booking.dto';

export class CreateOpenBookingDto {
    @ApiPropertyOptional({
        description: 'Client-facing booking title',
        example: 'Graduation portrait in Thu Duc City',
    })
    @IsOptional()
    @IsString()
    @MaxLength(160)
    title?: string;

    @ApiPropertyOptional({
        description:
            'AI-aligned visual shoot type. This is the main Fotovia booking category.',
        enum: BOOKING_SHOOT_TYPES,
        example: 'fashion',
    })
    @ValidateIf(
        (dto: CreateOpenBookingDto) =>
            !dto.sessionType || dto.shootType !== undefined,
    )
    @IsString()
    @IsNotEmpty()
    @IsIn(BOOKING_SHOOT_TYPES)
    shootType?: string;

    @ApiPropertyOptional({
        description:
            'Legacy session type mirror. Keep for backward compatibility while FE migrates to shootType.',
        example: 'fashion',
        deprecated: true,
    })
    @ValidateIf(
        (dto: CreateOpenBookingDto) =>
            !dto.shootType || dto.sessionType !== undefined,
    )
    @IsString()
    @IsNotEmpty()
    sessionType?: string;

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
        example: 'TP. Hồ Chí Minh',
    })
    @IsString()
    @MinLength(2)
    location: string;

    @ApiProperty({
        description: 'Budget range selection',
        example: '1000000-1500000',
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
            'Outdoor portrait concept with natural light, soft colors, and around 20 edited photos.',
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
        description:
            'Optional additional services serialized from supported checkbox selections.',
        example: 'Make-up + Hair Styling\nStudio Rental',
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;
}
