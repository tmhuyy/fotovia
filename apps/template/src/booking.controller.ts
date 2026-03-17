import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { JwtAuthGuard } from '@repo/common';
import { GetUser, IUser } from '@repo/common';
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @UseGuards(JwtAuthGuard) //1st
    @Post()
    createBooking(
        @Body() createBookingDto: CreateBookingDto,
        @GetUser() user: IUser,
    ) {
        return this.bookingService.createBooking(createBookingDto, user.id);
    }
}
