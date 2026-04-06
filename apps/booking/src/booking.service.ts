import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRole } from '@repo/types';

import { CreateBookingDto } from './dtos/create-booking.dto';
import { UpdateBookingStatusDto } from './dtos/update-booking-status.dto';
import { Booking } from './entities/booking.entity';
import { BookingRepository } from './repositories/booking.repository';

interface ProfileLookupRow {
    id: string;
    userId: string;
    role: UserRole;
}

@Injectable()
export class BookingService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        private readonly dataSource: DataSource,
    ) {}

    async createBooking(
        createBookingDto: CreateBookingDto,
        userId: string,
        userEmail?: string,
    ): Promise<Booking> {
        const selectedPhotographer = await this.findPhotographerByProfileId(
            createBookingDto.photographerProfileId,
        );

        if (!selectedPhotographer) {
            throw new NotFoundException('Selected photographer was not found.');
        }

        const booking = this.bookingRepository.create({
            clientUserId: userId,
            clientEmail: userEmail?.trim() || null,
            photographerProfileId: createBookingDto.photographerProfileId,
            photographerUserId: selectedPhotographer.userId,
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

    async getMyClientBookings(userId: string): Promise<Booking[]> {
        return this.bookingRepository.find({
            where: {
                clientUserId: userId,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async getMyPhotographerBookings(userId: string): Promise<Booking[]> {
        const photographerProfile =
            await this.getPhotographerWorkspaceProfile(userId);

        return this.bookingRepository.find({
            where: [
                { photographerUserId: userId },
                { photographerProfileId: photographerProfile.id },
            ],
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async updateMyPhotographerBookingStatus(
        bookingId: string,
        userId: string,
        updateBookingStatusDto: UpdateBookingStatusDto,
    ): Promise<Booking> {
        const photographerProfile =
            await this.getPhotographerWorkspaceProfile(userId);

        const booking = await this.bookingRepository.findOne({
            where: [
                {
                    id: bookingId,
                    photographerUserId: userId,
                },
                {
                    id: bookingId,
                    photographerProfileId: photographerProfile.id,
                },
            ],
        });

        if (!booking) {
            throw new NotFoundException('Booking request not found.');
        }

        if (booking.status !== 'pending') {
            throw new BadRequestException(
                'Only pending booking requests can be updated right now.',
            );
        }

        booking.status = updateBookingStatusDto.status;
        return this.bookingRepository.save(booking);
    }

    private async getPhotographerWorkspaceProfile(
        userId: string,
    ): Promise<ProfileLookupRow> {
        const photographerProfile =
            await this.findPhotographerProfileByUserId(userId);

        if (!photographerProfile) {
            throw new ForbiddenException(
                'Only photographer accounts can access photographer booking inbox.',
            );
        }

        return photographerProfile;
    }

    private async findPhotographerByProfileId(
        profileId: string,
    ): Promise<ProfileLookupRow | null> {
        const rows = await this.dataSource.query(
            `
      SELECT id, user_id AS "userId", role
      FROM public.profiles
      WHERE id = $1
        AND role = $2
      LIMIT 1
      `,
            [profileId, UserRole.PHOTOGRAPHER],
        );

        return (rows[0] as ProfileLookupRow | undefined) ?? null;
    }

    private async findPhotographerProfileByUserId(
        userId: string,
    ): Promise<ProfileLookupRow | null> {
        const rows = await this.dataSource.query(
            `
      SELECT id, user_id AS "userId", role
      FROM public.profiles
      WHERE user_id = $1
        AND role = $2
      LIMIT 1
      `,
            [userId, UserRole.PHOTOGRAPHER],
        );

        return (rows[0] as ProfileLookupRow | undefined) ?? null;
    }
}
