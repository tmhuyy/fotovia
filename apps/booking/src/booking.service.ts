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
import { CreateBookingApplicationDto } from './dtos/create-booking-application.dto';
import {
    BookingApplication,
    BookingApplicationStatus,
} from './entities/booking-application.entity';

interface ProfileLookupRow {
    id: string;
    userId: string;
    role: UserRole;
    slug: string | null;
    fullName: string | null;
    avatarUrl: string | null;
}

interface OpenBookingFeedRow extends Booking {
    clientName: string;
    clientFullName: string | null;
    clientProfileName: string | null;
    applicationsCount: number;
    applicationCount: number;
    photographerApplicationsCount: number;
    isOwner?: boolean;
    canManage?: boolean;
    canViewApplications?: boolean;
    hasApplied?: boolean;
    myApplicationId?: string | null;
    myApplicationStatus?: BookingApplicationStatus | null;
    canApply?: boolean;
}

@Injectable()
export class BookingService {
    constructor(
        private readonly bookingRepository: BookingRepository,
        @InjectRepository(BookingEvent)
        private readonly bookingEventRepository: Repository<BookingEvent>,
        private readonly dataSource: DataSource,
        @InjectRepository(BookingApplication)
        private readonly bookingApplicationRepository: Repository<BookingApplication>,
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

    async getOpenBookingFeed(limit = 6): Promise<Booking[]> {
        const safeLimit = Math.min(Math.max(limit, 1), 50);

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
                COALESCE(application_counts."applicationsCount", 0)::int AS "applicationsCount",
                COALESCE(application_counts."applicationsCount", 0)::int AS "applicationCount",
                COALESCE(application_counts."applicationsCount", 0)::int AS "photographerApplicationsCount",
                false AS "isOwner",
                false AS "canManage",
                false AS "canViewApplications",
                false AS "hasApplied",
                null AS "myApplicationId",
                null AS "myApplicationStatus",
                false AS "canApply"
            FROM public.bookings b
            LEFT JOIN public.profiles client_profile
                ON client_profile.user_id = b."clientUserId"
            LEFT JOIN LATERAL (
                SELECT COUNT(*) AS "applicationsCount"
                FROM public.booking_applications applications
                WHERE applications."bookingId" = b.id
                  AND applications.status NOT IN ('withdrawn', 'expired')
            ) application_counts ON true
            WHERE b."photographerProfileId" IS NULL
              AND b."photographerUserId" IS NULL
              AND b.status = $1
            ORDER BY b."sessionDate" ASC, b."createdAt" DESC
            LIMIT $2
            `,
            ['pending', safeLimit],
        );

        return rows as Booking[];
    }

    async getOpenBookingDetail(bookingId: string): Promise<Booking> {
        return this.getOpenBookingDetailWithViewer(bookingId, null);
    }

    async getOpenBookingDetailForViewer(
        bookingId: string,
        viewerUserId: string,
    ): Promise<Booking> {
        return this.getOpenBookingDetailWithViewer(bookingId, viewerUserId);
    }

    async createOpenBookingApplication(
        bookingId: string,
        createBookingApplicationDto: CreateBookingApplicationDto,
        userId: string,
    ): Promise<BookingApplication> {
        const photographerProfile =
            await this.getPhotographerWorkspaceProfile(userId);

        const booking = await this.bookingRepository.findOne({
            where: {
                id: bookingId,
            },
        });

        if (
            !booking ||
            booking.photographerProfileId !== null ||
            booking.photographerUserId !== null ||
            booking.status !== 'pending'
        ) {
            throw new NotFoundException('Open booking request was not found.');
        }

        if (booking.clientUserId === userId) {
            throw new ForbiddenException(
                'You cannot apply to your own booking request.',
            );
        }

        const existingApplication =
            await this.bookingApplicationRepository.findOne({
                where: {
                    bookingId,
                    photographerProfileId: photographerProfile.id,
                },
            });

        if (
            existingApplication &&
            existingApplication.status !== 'withdrawn' &&
            existingApplication.status !== 'rejected' &&
            existingApplication.status !== 'expired'
        ) {
            throw new BadRequestException(
                'You have already applied to this photoshoot.',
            );
        }

        const application =
            existingApplication ?? this.bookingApplicationRepository.create();

        application.bookingId = bookingId;
        application.photographerProfileId = photographerProfile.id;
        application.photographerUserId = userId;
        application.photographerName =
            photographerProfile.fullName?.trim() || 'Photographer';
        application.photographerSlug = photographerProfile.slug;
        application.photographerAvatarUrl = photographerProfile.avatarUrl;
        application.message = createBookingApplicationDto.message.trim();
        application.proposedPrice = createBookingApplicationDto.proposedPrice;
        application.includedDeliverables =
            createBookingApplicationDto.includedDeliverables.trim();
        application.estimatedDuration =
            createBookingApplicationDto.estimatedDuration?.trim() || null;
        application.availableOnRequestedDate =
            createBookingApplicationDto.availableOnRequestedDate;
        application.status = 'submitted';
        application.withdrawnAt = null;
        application.selectedAt = null;
        application.rejectedAt = null;

        return this.bookingApplicationRepository.save(application);
    }

    async getMyOpenBookingApplication(
        bookingId: string,
        userId: string,
    ): Promise<BookingApplication | null> {
        const photographerProfile =
            await this.getPhotographerWorkspaceProfile(userId);

        return this.bookingApplicationRepository.findOne({
            where: {
                bookingId,
                photographerProfileId: photographerProfile.id,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async withdrawMyOpenBookingApplication(
        bookingId: string,
        userId: string,
    ): Promise<BookingApplication> {
        const photographerProfile =
            await this.getPhotographerWorkspaceProfile(userId);

        const application = await this.bookingApplicationRepository.findOne({
            where: {
                bookingId,
                photographerProfileId: photographerProfile.id,
            },
        });

        if (!application) {
            throw new NotFoundException('Application was not found.');
        }

        if (application.status === 'selected') {
            throw new BadRequestException(
                'A selected application cannot be withdrawn.',
            );
        }

        if (application.status === 'withdrawn') {
            return application;
        }

        application.status = 'withdrawn';
        application.withdrawnAt = new Date();

        return this.bookingApplicationRepository.save(application);
    }

    async getMyClientBookingApplications(
        bookingId: string,
        userId: string,
    ): Promise<BookingApplication[]> {
        const booking = await this.bookingRepository.findOne({
            where: {
                id: bookingId,
                clientUserId: userId,
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking request not found.');
        }

        return this.bookingApplicationRepository.find({
            where: {
                bookingId,
            },
            order: {
                createdAt: 'DESC',
            },
        });
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

    private async getOpenBookingDetailWithViewer(
        bookingId: string,
        viewerUserId: string | null,
    ): Promise<Booking> {
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
                COALESCE(application_counts."applicationsCount", 0)::int AS "applicationsCount",
                COALESCE(application_counts."applicationsCount", 0)::int AS "applicationCount",
                COALESCE(application_counts."applicationsCount", 0)::int AS "photographerApplicationsCount",
                CASE
                    WHEN $2::uuid IS NOT NULL AND b."clientUserId" = $2::uuid
                    THEN true
                    ELSE false
                END AS "isOwner",
                CASE
                    WHEN $2::uuid IS NOT NULL
                     AND b."clientUserId" = $2::uuid
                     AND b.status = 'pending'
                    THEN true
                    ELSE false
                END AS "canManage",
                CASE
                    WHEN $2::uuid IS NOT NULL AND b."clientUserId" = $2::uuid
                    THEN true
                    ELSE false
                END AS "canViewApplications",
                CASE
                    WHEN my_application.id IS NOT NULL
                     AND my_application.status NOT IN ('withdrawn', 'rejected', 'expired')
                    THEN true
                    ELSE false
                END AS "hasApplied",
                my_application.id AS "myApplicationId",
                my_application.status AS "myApplicationStatus",
                CASE
                    WHEN $2::uuid IS NOT NULL
                     AND viewer_profile.role = $4
                     AND b."clientUserId" <> $2::uuid
                     AND b.status = 'pending'
                     AND (
                        my_application.id IS NULL
                        OR my_application.status IN ('withdrawn', 'rejected', 'expired')
                     )
                    THEN true
                    ELSE false
                END AS "canApply"
            FROM public.bookings b
            LEFT JOIN public.profiles client_profile
                ON client_profile.user_id = b."clientUserId"
            LEFT JOIN public.profiles viewer_profile
                ON $2::uuid IS NOT NULL
               AND viewer_profile.user_id = $2::uuid
            LEFT JOIN LATERAL (
                SELECT COUNT(*) AS "applicationsCount"
                FROM public.booking_applications applications
                WHERE applications."bookingId" = b.id
                  AND applications.status NOT IN ('withdrawn', 'expired')
            ) application_counts ON true
            LEFT JOIN LATERAL (
                SELECT application.*
                FROM public.booking_applications application
                WHERE application."bookingId" = b.id
                  AND $2::uuid IS NOT NULL
                  AND application."photographerUserId" = $2::uuid
                ORDER BY application."createdAt" DESC
                LIMIT 1
            ) my_application ON true
            WHERE b.id = $1
              AND b."photographerProfileId" IS NULL
              AND b."photographerUserId" IS NULL
              AND b.status = $3
            LIMIT 1
            `,
            [bookingId, viewerUserId, 'pending', UserRole.PHOTOGRAPHER],
        );

        const booking = rows[0];

        if (!booking) {
            throw new NotFoundException('Open booking request was not found.');
        }

        return booking as Booking;
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
            SELECT
                id,
                user_id AS "userId",
                role,
                slug,
                full_name AS "fullName",
                avatar_url AS "avatarUrl"
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
            SELECT
                id,
                user_id AS "userId",
                role,
                slug,
                full_name AS "fullName",
                avatar_url AS "avatarUrl"
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
