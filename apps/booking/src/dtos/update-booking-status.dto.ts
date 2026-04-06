import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateBookingStatusDto {
    @ApiProperty({
        description: 'Next booking status chosen by the photographer',
        enum: ['confirmed', 'declined'],
        example: 'confirmed',
    })
    @IsIn(['confirmed', 'declined'])
    status: 'confirmed' | 'declined';
}
