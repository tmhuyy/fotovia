import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetUser, IUser, JwtAuthGuard } from '@repo/common';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { Booking } from './entities/booking.entity';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Create a booking request' })
    @ApiCreatedResponse({
        description: 'Booking request created successfully',
        type: Booking,
    })
    async createBooking(
        @Body() createBookingDto: CreateBookingDto,
        @GetUser() user: IUser,
    ): Promise<Booking> {
        return this.bookingService.createBooking(createBookingDto, user.id);
    }
}
