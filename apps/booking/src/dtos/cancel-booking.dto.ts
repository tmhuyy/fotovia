import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const BOOKING_CANCEL_REASONS = [
    'duplicated_booking',
    'found_another_photographer',
    'no_longer_needed',
    'other',
] as const;

export type BookingCancelReason = (typeof BOOKING_CANCEL_REASONS)[number];

export class CancelBookingDto {
    @ApiProperty({
        description: 'Reason chosen by the client when cancelling the booking',
        enum: BOOKING_CANCEL_REASONS,
        example: 'found_another_photographer',
    })
    @IsIn(BOOKING_CANCEL_REASONS)
    cancelReason: BookingCancelReason;

    @ApiPropertyOptional({
        description:
            'Optional extra explanation when the selected reason needs more context',
        example:
            'The client already confirmed another photographer outside the platform.',
    })
    @IsOptional()
    @IsString()
    @MaxLength(300)
    cancelReasonNote?: string;
}
