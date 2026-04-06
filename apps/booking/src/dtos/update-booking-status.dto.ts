import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateBookingStatusDto {
    @ApiProperty({
        description: 'Next booking status chosen by the photographer',
        enum: ['confirmed', 'declined', 'completed'],
        example: 'confirmed',
    })
    @IsIn(['confirmed', 'declined', 'completed'])
    status: 'confirmed' | 'declined' | 'completed';
}
