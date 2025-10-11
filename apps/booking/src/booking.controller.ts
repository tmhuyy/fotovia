import { Body, Controller, Post } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }
    
    @Post()
    createBooking(@Body() createBookingDto: CreateBookingDto)
    {
        return this.bookingService.createBooking(createBookingDto)
    }
}
