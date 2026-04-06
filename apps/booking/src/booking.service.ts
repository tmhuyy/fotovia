import { Injectable } from '@nestjs/common';

import { CreateBookingDto } from './dtos/create-booking.dto';
import { Booking } from './entities/booking.entity';
import { BookingRepository } from './repositories/booking.repository';

@Injectable()
export class BookingService {
    constructor(private readonly bookingRepository: BookingRepository) {}

    async createBooking(
        createBookingDto: CreateBookingDto,
        userId: string,
    ): Promise<Booking> {
        const booking = this.bookingRepository.create({
            clientUserId: userId,
            photographerProfileId: createBookingDto.photographerProfileId,
            photographerSlug: createBookingDto.photographerSlug.trim(),
            photographerName: createBookingDto.photographerName.trim(),
            sessionType: createBookingDto.sessionType.trim(),
            sessionDate: createBookingDto.sessionDate.trim(),
            sessionTime: createBookingDto.sessionTime.trim(),
            duration: createBookingDto.duration.trim(),
            location: createBookingDto.location.trim(),
            budget: createBookingDto.budget.trim(),
            contactPreference: createBookingDto.contactPreference.trim(),
            concept: createBookingDto.concept.trim(),
            inspiration: createBookingDto.inspiration?.trim() || null,
            notes: createBookingDto.notes?.trim() || null,
            status: 'pending',
        });

        return this.bookingRepository.save(booking);
    }
}
