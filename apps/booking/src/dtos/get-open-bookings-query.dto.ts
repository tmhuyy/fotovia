import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

import { BOOKING_SHOOT_TYPES } from './create-booking.dto';

export const OPEN_BOOKING_SORT_VALUES = [
    'earliest',
    'newest',
    'most_applications',
    'budget_low',
    'budget_high',
] as const;

export type OpenBookingSort = (typeof OPEN_BOOKING_SORT_VALUES)[number];

export const OPEN_BOOKING_ADDITIONAL_SERVICE_VALUES = [
    'all',
    'with',
    'without',
] as const;

export type OpenBookingAdditionalServicesFilter =
    (typeof OPEN_BOOKING_ADDITIONAL_SERVICE_VALUES)[number];

export class GetOpenBookingsQueryDto {
    @ApiPropertyOptional({ example: '1' })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiPropertyOptional({ example: '8' })
    @IsOptional()
    @IsString()
    pageSize?: string;

    @ApiPropertyOptional({
        description: 'Comma-separated Fotovia AI shoot types',
        enum: BOOKING_SHOOT_TYPES,
        example: 'wedding,event',
    })
    @IsOptional()
    @IsString()
    shootTypes?: string;

    @ApiPropertyOptional({ example: 'TP. Hồ Chí Minh' })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiPropertyOptional({ example: '2026-06-01' })
    @IsOptional()
    @IsString()
    dateFrom?: string;

    @ApiPropertyOptional({ example: '2026-06-30' })
    @IsOptional()
    @IsString()
    dateTo?: string;

    @ApiPropertyOptional({ example: '500000' })
    @IsOptional()
    @IsString()
    budgetFrom?: string;

    @ApiPropertyOptional({ example: '2000000' })
    @IsOptional()
    @IsString()
    budgetTo?: string;

    @ApiPropertyOptional({
        description:
            'Filter open requests by whether the client requested extra services in notes.',
        enum: OPEN_BOOKING_ADDITIONAL_SERVICE_VALUES,
        example: 'with',
    })
    @IsOptional()
    @IsIn(OPEN_BOOKING_ADDITIONAL_SERVICE_VALUES)
    services?: OpenBookingAdditionalServicesFilter;

    @ApiPropertyOptional({
        enum: OPEN_BOOKING_SORT_VALUES,
        example: 'earliest',
    })
    @IsOptional()
    @IsIn(OPEN_BOOKING_SORT_VALUES)
    sort?: OpenBookingSort;
}
