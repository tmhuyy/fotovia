import { Injectable } from '@nestjs/common';
import { BookingRepository } from './repositories/booking.repository';
import { CreateBookingDto } from './dtos/create-booking.dto';

@Injectable()
export class BookingService {
    constructor(private readonly bookingRepository: BookingRepository) {}

    async createBooking(createBookingDto: CreateBookingDto) {
        const booking = this.bookingRepository.create({ ...createBookingDto });

        await this.bookingRepository.save(booking);
    }
}
