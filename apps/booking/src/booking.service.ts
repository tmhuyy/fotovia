import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserRole } from '@repo/types';

import { CreateBookingDto } from './dtos/create-booking.dto';
import { CreateOpenBookingDto } from './dtos/create-open-booking.dto';
import { UpdateBookingStatusDto } from './dtos/update-booking-status.dto';
import { Booking } from './entities/booking.entity';
import {
    BookingEvent,
    BookingEventActorRole,
    BookingEventType,
} from './entities/booking-event.entity';
import { BookingRepository } from './repositories/booking.repository';
import { normalizeBookingAdditionalServices } from './constants/booking-additional-services';

interface ProfileLookupRow {
    id: string;
    userId: string;
    role: UserRole;
}

interface OpenBookingFeedRow extends Booking {
    clientName: string;
    clientFullName: string | null;
    clientProfileName: string | null;
    applicationsCount: number;
    applicationCount: number;
    photographerApplicationsCount: number;
}

@Injectable()
export class BookingService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        @InjectRepository(BookingEvent)
        private readonly bookingEventRepository: Repository<BookingEvent>,
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

        const resolvedShootType =
            createBookingDto.shootType?.trim() ||
            createBookingDto.sessionType?.trim();

        if (!resolvedShootType) {
            throw new BadRequestException('Shoot type is required.');
        }

        const normalizedNotes = normalizeBookingAdditionalServices(
            createBookingDto.notes,
        );

        const booking = this.bookingRepository.create({
            clientUserId: userId,
            clientEmail: userEmail?.trim() || null,
            photographerProfileId: createBookingDto.photographerProfileId,
            photographerUserId: selectedPhotographer.userId,
            photographerSlug: createBookingDto.photographerSlug.trim(),
            photographerName: createBookingDto.photographerName.trim(),
            title: createBookingDto.title?.trim() || null,
            shootType: resolvedShootType,
            sessionType:
                createBookingDto.sessionType?.trim() || resolvedShootType,
            sessionDate: createBookingDto.sessionDate.trim(),
            sessionTime: createBookingDto.sessionTime.trim(),
            duration: createBookingDto.duration.trim(),
            location: createBookingDto.location.trim(),
            budget: createBookingDto.budget.trim(),
            contactPreference: createBookingDto.contactPreference.trim(),
            concept: createBookingDto.concept.trim(),
            inspiration: createBookingDto.inspiration?.trim() || null,
            notes: normalizedNotes,
            status: 'pending',
        });

        const savedBooking = await this.bookingRepository.save(booking);

        await this.recordBookingEvent({
            bookingId: savedBooking.id,
            eventType: 'created',
            actorRole: 'client',
            actorUserId: userId,
            actorLabel: userEmail?.trim() || 'Client',
            note: 'Booking request created.',
        });

        return savedBooking;
    }

    async createOpenBooking(
        createOpenBookingDto: CreateOpenBookingDto,
        userId: string,
        userEmail?: string,
    ): Promise<Booking> {
        const resolvedShootType =
            createOpenBookingDto.shootType?.trim() ||
            createOpenBookingDto.sessionType?.trim();

        if (!resolvedShootType) {
            throw new BadRequestException('Shoot type is required.');
        }
        const normalizedNotes = normalizeBookingAdditionalServices(
            createOpenBookingDto.notes,
        );
        const booking = this.bookingRepository.create({
            clientUserId: userId,
            clientEmail: userEmail?.trim() || null,
            photographerProfileId: null,
            photographerUserId: null,
            photographerSlug: null,
            photographerName: null,
            title: createOpenBookingDto.title?.trim() || null,
            shootType: resolvedShootType,
            sessionType:
                createOpenBookingDto.sessionType?.trim() || resolvedShootType,
            sessionDate: createOpenBookingDto.sessionDate.trim(),
            sessionTime: createOpenBookingDto.sessionTime.trim(),
            duration: createOpenBookingDto.duration.trim(),
            location: createOpenBookingDto.location.trim(),
            budget: createOpenBookingDto.budget.trim(),
            contactPreference: createOpenBookingDto.contactPreference.trim(),
            concept: createOpenBookingDto.concept.trim(),
            inspiration: createOpenBookingDto.inspiration?.trim() || null,
            notes: normalizedNotes,
            status: 'pending',
        });

        const savedBooking = await this.bookingRepository.save(booking);

        await this.recordBookingEvent({
            bookingId: savedBooking.id,
            eventType: 'created',
            actorRole: 'client',
            actorUserId: userId,
            actorLabel: userEmail?.trim() || 'Client',
            note: 'Open booking request created.',
        });

        return savedBooking;
    }

    async getOpenBookingFeed(): Promise<Booking[]> {
        const rows = await this.dataSource.query<OpenBookingFeedRow[]>(
            `
            SELECT
                b.*,
                COALESCE(
                    NULLIF(TRIM(client_profile.full_name), ''),
                    NULLIF(TRIM(b."clientEmail"), ''),
                    'Client'
                ) AS "clientName",
                NULLIF(TRIM(client_profile.full_name), '') AS "clientFullName",
                NULLIF(TRIM(client_profile.full_name), '') AS "clientProfileName",
                0 AS "applicationsCount",
                0 AS "applicationCount",
                0 AS "photographerApplicationsCount"
            FROM public.bookings b
            LEFT JOIN public.profiles client_profile
                ON client_profile.user_id = b."clientUserId"
            WHERE b."photographerProfileId" IS NULL
              AND b."photographerUserId" IS NULL
              AND b.status = $1
            ORDER BY b."sessionDate" ASC, b."createdAt" DESC
            LIMIT $2
            `,
            ['pending', 6],
        );

        return rows as Booking[];
    }

    async getOpenBookingDetail(bookingId: string): Promise<Booking> {
        const rows = await this.dataSource.query<OpenBookingFeedRow[]>(
            `
            SELECT
                b.*,
                COALESCE(
                    NULLIF(TRIM(client_profile.full_name), ''),
                    NULLIF(TRIM(b."clientEmail"), ''),
                    'Client'
                ) AS "clientName",
                NULLIF(TRIM(client_profile.full_name), '') AS "clientFullName",
                NULLIF(TRIM(client_profile.full_name), '') AS "clientProfileName",
                0 AS "applicationsCount",
                0 AS "applicationCount",
                0 AS "photographerApplicationsCount"
            FROM public.bookings b
            LEFT JOIN public.profiles client_profile
                ON client_profile.user_id = b."clientUserId"
            WHERE b.id = $1
              AND b."photographerProfileId" IS NULL
              AND b."photographerUserId" IS NULL
              AND b.status = $2
            LIMIT 1
            `,
            [bookingId, 'pending'],
        );

        const booking = rows[0];

        if (!booking) {
            throw new NotFoundException('Open booking request was not found.');
        }

        return booking as Booking;
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

    async getMyClientBookingTimeline(
        bookingId: string,
        userId: string,
    ): Promise<BookingEvent[]> {
        const booking = await this.bookingRepository.findOne({
            where: {
                id: bookingId,
                clientUserId: userId,
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking request not found.');
        }

        return this.bookingEventRepository.find({
            where: {
                bookingId,
            },
            order: {
                createdAt: 'ASC',
            },
        });
    }

    async cancelMyClientBooking(
        bookingId: string,
        userId: string,
    ): Promise<Booking> {
        const booking = await this.bookingRepository.findOne({
            where: {
                id: bookingId,
                clientUserId: userId,
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking request not found.');
        }

        if (booking.status !== 'pending') {
            throw new BadRequestException(
                'Only pending booking requests can be cancelled right now.',
            );
        }

        booking.status = 'cancelled';
        const savedBooking = await this.bookingRepository.save(booking);

        await this.recordBookingEvent({
            bookingId: savedBooking.id,
            eventType: 'cancelled',
            actorRole: 'client',
            actorUserId: userId,
            actorLabel: booking.clientEmail?.trim() || 'Client',
            note: 'Client cancelled the pending request.',
        });

        return savedBooking;
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

    async getMyPhotographerBookingTimeline(
        bookingId: string,
        userId: string,
    ): Promise<BookingEvent[]> {
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

        return this.bookingEventRepository.find({
            where: {
                bookingId,
            },
            order: {
                createdAt: 'ASC',
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

        if (updateBookingStatusDto.status === 'completed') {
            if (booking.status !== 'confirmed') {
                throw new BadRequestException(
                    'Only confirmed bookings can be marked as completed right now.',
                );
            }

            booking.status = 'completed';
            const savedBooking = await this.bookingRepository.save(booking);

            await this.recordBookingEvent({
                bookingId: savedBooking.id,
                eventType: 'completed',
                actorRole: 'photographer',
                actorUserId: userId,
                actorLabel: booking.photographerName ?? 'Photographer',
                note: 'Photographer marked the booking as completed.',
            });

            return savedBooking;
        }

        if (booking.status !== 'pending') {
            throw new BadRequestException(
                'Only pending booking requests can be confirmed or declined right now.',
            );
        }

        booking.status = updateBookingStatusDto.status;
        const savedBooking = await this.bookingRepository.save(booking);

        await this.recordBookingEvent({
            bookingId: savedBooking.id,
            eventType: updateBookingStatusDto.status as Extract<
                BookingEventType,
                'confirmed' | 'declined'
            >,
            actorRole: 'photographer',
            actorUserId: userId,
            actorLabel: booking.photographerName ?? 'Photographer',
            note:
                updateBookingStatusDto.status === 'confirmed'
                    ? 'Photographer confirmed the booking request.'
                    : 'Photographer declined the booking request.',
        });

        return savedBooking;
    }

    private async recordBookingEvent(input: {
        bookingId: string;
        eventType: BookingEventType;
        actorRole: BookingEventActorRole;
        actorUserId: string | null;
        actorLabel: string;
        note?: string | null;
    }): Promise<BookingEvent> {
        const event = this.bookingEventRepository.create({
            bookingId: input.bookingId,
            eventType: input.eventType,
            actorRole: input.actorRole,
            actorUserId: input.actorUserId,
            actorLabel: input.actorLabel,
            note: input.note?.trim() || null,
        });

        return this.bookingEventRepository.save(event);
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
