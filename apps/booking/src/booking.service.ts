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
import {
    GetOpenBookingsQueryDto,
    OPEN_BOOKING_ADDITIONAL_SERVICE_VALUES,
    OPEN_BOOKING_SORT_VALUES,
    type OpenBookingAdditionalServicesFilter,
    type OpenBookingSort,
} from './dtos/get-open-bookings-query.dto';
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
import { UpdateOpenBookingDto } from './dtos/update-open-booking.dto';
import {
    CancelBookingDto,
    type BookingCancelReason,
} from './dtos/cancel-booking.dto';

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

export interface PaginatedOpenBookingFeed {
    items: Booking[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

const CANCEL_REASON_LABELS: Record<BookingCancelReason, string> = {
    duplicated_booking: 'Duplicated booking',
    found_another_photographer: 'Found another photographer',
    no_longer_needed: 'No longer need this photoshoot',
    other: 'Other',
};

const parsePositiveInteger = (
    value: string | undefined,
    fallback: number,
    max?: number,
): number => {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }

    const normalized = Math.floor(parsed);

    return typeof max === 'number' ? Math.min(normalized, max) : normalized;
};

const parseMoneyFilter = (value?: string): number | null => {
    if (!value?.trim()) {
        return null;
    }

    const parsed = Number(value.replace(/[^\d]/g, ''));

    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseCommaValues = (value?: string): string[] => {
    if (!value?.trim()) {
        return [];
    }

    return value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
};

const isOpenBookingServiceFilter = (
    value?: string,
): value is OpenBookingAdditionalServicesFilter => {
    return OPEN_BOOKING_ADDITIONAL_SERVICE_VALUES.includes(
        value as OpenBookingAdditionalServicesFilter,
    );
};

const isOpenBookingSort = (value?: string): value is OpenBookingSort => {
    return OPEN_BOOKING_SORT_VALUES.includes(value as OpenBookingSort);
};

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

    async updateMyOpenBooking(
        bookingId: string,
        updateOpenBookingDto: UpdateOpenBookingDto,
        userId: string,
        userEmail?: string,
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

        if (
            booking.status !== 'pending' ||
            booking.photographerProfileId !== null ||
            booking.photographerUserId !== null
        ) {
            throw new BadRequestException(
                'Only pending open booking requests can be edited.',
            );
        }

        const activeApplicationsCount =
            await this.bookingApplicationRepository.count({
                where: {
                    bookingId,
                    status: 'submitted',
                },
            });

        if (activeApplicationsCount > 0) {
            throw new BadRequestException(
                'This booking already has photographer applications, so it can no longer be edited.',
            );
        }

        const resolvedShootType =
            updateOpenBookingDto.shootType?.trim() ||
            updateOpenBookingDto.sessionType?.trim();

        if (!resolvedShootType) {
            throw new BadRequestException('Shoot type is required.');
        }

        booking.title = updateOpenBookingDto.title?.trim() || null;
        booking.shootType = resolvedShootType;
        booking.sessionType =
            updateOpenBookingDto.sessionType?.trim() || resolvedShootType;
        booking.sessionDate = updateOpenBookingDto.sessionDate.trim();
        booking.sessionTime =
            updateOpenBookingDto.sessionTime?.trim() || 'flexible';
        booking.duration = updateOpenBookingDto.duration?.trim() || 'flexible';
        booking.location = updateOpenBookingDto.location.trim();
        booking.budget = updateOpenBookingDto.budget.trim();
        booking.contactPreference =
            updateOpenBookingDto.contactPreference.trim();
        booking.concept = updateOpenBookingDto.concept.trim();
        booking.inspiration = updateOpenBookingDto.inspiration?.trim() || null;
        booking.notes = normalizeBookingAdditionalServices(
            updateOpenBookingDto.notes,
        );

        const savedBooking = await this.bookingRepository.save(booking);

        await this.recordBookingEvent({
            bookingId: savedBooking.id,
            eventType: 'updated',
            actorRole: 'client',
            actorUserId: userId,
            actorLabel: userEmail?.trim() || 'Client',
            note: 'Open booking request updated.',
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
                  AND applications.status NOT IN ('withdrawn', 'expired', 'rejected')
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

    async getOpenBookingMarketplace(
        query: GetOpenBookingsQueryDto,
    ): Promise<PaginatedOpenBookingFeed> {
        const page = parsePositiveInteger(query.page, 1);
        const pageSize = parsePositiveInteger(query.pageSize, 8, 20);

        const allowedShootTypes = new Set([
            'aerial',
            'architecture',
            'event',
            'fashion',
            'food',
            'nature',
            'sports',
            'street',
            'wedding',
            'wildlife',
        ]);

        const shootTypes = parseCommaValues(query.shootTypes).filter((type) =>
            allowedShootTypes.has(type),
        );

        const services = isOpenBookingServiceFilter(query.services)
            ? query.services
            : 'all';

        const sort = isOpenBookingSort(query.sort) ? query.sort : 'earliest';

        const budgetFrom = parseMoneyFilter(query.budgetFrom);
        const budgetTo = parseMoneyFilter(query.budgetTo);

        const params: unknown[] = ['pending'];
        const conditions: string[] = [
            'b."photographerProfileId" IS NULL',
            'b."photographerUserId" IS NULL',
            'b.status = $1',
        ];

        const pushParam = (value: unknown): string => {
            params.push(value);
            return `$${params.length}`;
        };

        if (shootTypes.length > 0) {
            const placeholder = pushParam(shootTypes);

            conditions.push(
                `(LOWER(b."shootType") = ANY(${placeholder}::text[]) OR LOWER(b."sessionType") = ANY(${placeholder}::text[]))`,
            );
        }

        if (query.location?.trim()) {
            const placeholder = pushParam(query.location.trim());
            conditions.push(`LOWER(b.location) = LOWER(${placeholder})`);
        }

        if (query.dateFrom?.trim()) {
            const placeholder = pushParam(query.dateFrom.trim());
            conditions.push(`b."sessionDate" >= ${placeholder}`);
        }

        if (query.dateTo?.trim()) {
            const placeholder = pushParam(query.dateTo.trim());
            conditions.push(`b."sessionDate" <= ${placeholder}`);
        }

        const budgetMinExpression = `
            NULLIF(
                regexp_replace(
                    split_part(COALESCE(b.budget, ''), '-', 1),
                    '[^0-9]',
                    '',
                    'g'
                ),
                ''
            )::numeric
        `;

        const budgetMaxExpression = `
            COALESCE(
                NULLIF(
                    regexp_replace(
                        split_part(COALESCE(b.budget, ''), '-', 2),
                        '[^0-9]',
                        '',
                        'g'
                    ),
                    ''
                )::numeric,
                ${budgetMinExpression}
            )
        `;

        if (budgetFrom !== null) {
            const placeholder = pushParam(budgetFrom);
            conditions.push(`${budgetMaxExpression} >= ${placeholder}`);
        }

        if (budgetTo !== null) {
            const placeholder = pushParam(budgetTo);
            conditions.push(`${budgetMinExpression} <= ${placeholder}`);
        }

        if (services === 'with') {
            conditions.push(
                `NULLIF(TRIM(COALESCE(b.notes, '')), '') IS NOT NULL`,
            );
        }

        if (services === 'without') {
            conditions.push(`NULLIF(TRIM(COALESCE(b.notes, '')), '') IS NULL`);
        }

        const whereClause = conditions.join('\n              AND ');

        const orderBy = (() => {
            switch (sort) {
                case 'newest':
                    return `b."createdAt" DESC, b."sessionDate" ASC`;

                case 'most_applications':
                    return `"applicationsCount" DESC, b."sessionDate" ASC, b."createdAt" DESC`;

                case 'budget_low':
                    return `"budgetMinValue" ASC NULLS LAST, b."sessionDate" ASC`;

                case 'budget_high':
                    return `"budgetMaxValue" DESC NULLS LAST, b."sessionDate" ASC`;

                case 'earliest':
                default:
                    return `b."sessionDate" ASC, b."createdAt" DESC`;
            }
        })();

        const totalRows = await this.dataSource.query<{ count: number }[]>(
            `
            SELECT COUNT(*)::int AS count
            FROM public.bookings b
            WHERE ${whereClause}
            `,
            params,
        );

        const total = Number(totalRows[0]?.count ?? 0);
        const totalPages = Math.max(Math.ceil(total / pageSize), 1);
        const safePage = Math.min(page, totalPages);
        const safeOffset = (safePage - 1) * pageSize;

        const itemParams = [...params, pageSize, safeOffset];

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
                false AS "canApply",
                ${budgetMinExpression} AS "budgetMinValue",
                ${budgetMaxExpression} AS "budgetMaxValue"
            FROM public.bookings b
            LEFT JOIN public.profiles client_profile
                ON client_profile.user_id = b."clientUserId"
            LEFT JOIN LATERAL (
                SELECT COUNT(*) AS "applicationsCount"
                FROM public.booking_applications applications
                WHERE applications."bookingId" = b.id
                  AND applications.status NOT IN ('withdrawn', 'expired', 'rejected')
            ) application_counts ON true
            WHERE ${whereClause}
            ORDER BY ${orderBy}
            LIMIT $${itemParams.length - 1}
            OFFSET $${itemParams.length}
            `,
            itemParams,
        );

        return {
            items: rows as Booking[],
            page: safePage,
            pageSize,
            total,
            totalPages,
            hasNextPage: safePage < totalPages,
            hasPreviousPage: safePage > 1,
        };
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

    async updateMyOpenBookingApplication(
        bookingId: string,
        updateBookingApplicationDto: CreateBookingApplicationDto,
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

        if (
            application.status !== 'submitted' &&
            application.status !== 'shortlisted'
        ) {
            throw new BadRequestException(
                'Only submitted or shortlisted applications can be edited.',
            );
        }

        application.message = updateBookingApplicationDto.message.trim();
        application.proposedPrice = updateBookingApplicationDto.proposedPrice;
        application.includedDeliverables =
            updateBookingApplicationDto.includedDeliverables.trim();
        application.estimatedDuration =
            updateBookingApplicationDto.estimatedDuration?.trim() || null;
        application.availableOnRequestedDate =
            updateBookingApplicationDto.availableOnRequestedDate;

        return this.bookingApplicationRepository.save(application);
    }

    async selectMyClientBookingApplication(
        bookingId: string,
        applicationId: string,
        userId: string,
    ): Promise<Booking> {
        return this.dataSource.transaction(async (manager) => {
            const bookingRepository = manager.getRepository(Booking);
            const applicationRepository =
                manager.getRepository(BookingApplication);
            const eventRepository = manager.getRepository(BookingEvent);

            const booking = await bookingRepository.findOne({
                where: {
                    id: bookingId,
                    clientUserId: userId,
                },
            });

            if (!booking) {
                throw new NotFoundException('Booking request not found.');
            }

            if (
                booking.photographerProfileId !== null ||
                booking.photographerUserId !== null ||
                booking.status !== 'pending'
            ) {
                throw new BadRequestException(
                    'Only pending open booking requests can select a photographer.',
                );
            }

            const application = await applicationRepository.findOne({
                where: {
                    id: applicationId,
                    bookingId,
                },
            });

            if (!application) {
                throw new NotFoundException(
                    'Photographer application was not found.',
                );
            }

            if (
                application.status === 'withdrawn' ||
                application.status === 'rejected' ||
                application.status === 'expired'
            ) {
                throw new BadRequestException(
                    'This photographer application is no longer available.',
                );
            }

            const now = new Date();

            application.status = 'selected';
            application.selectedAt = now;
            application.rejectedAt = null;
            application.withdrawnAt = null;

            await applicationRepository.save(application);

            await manager
                .createQueryBuilder()
                .update(BookingApplication)
                .set({
                    status: 'rejected',
                    rejectedAt: now,
                })
                .where('"bookingId" = :bookingId', { bookingId })
                .andWhere('id <> :applicationId', { applicationId })
                .andWhere('status IN (:...statuses)', {
                    statuses: ['submitted', 'shortlisted'],
                })
                .execute();

            booking.photographerProfileId = application.photographerProfileId;
            booking.photographerUserId = application.photographerUserId;
            booking.photographerSlug = application.photographerSlug;
            booking.photographerName = application.photographerName;
            booking.status = 'confirmed';

            const savedBooking = await bookingRepository.save(booking);

            const event = eventRepository.create({
                bookingId: savedBooking.id,
                eventType: 'confirmed',
                actorRole: 'client',
                actorUserId: userId,
                actorLabel: booking.clientEmail?.trim() || 'Client',
                note: `Client selected ${application.photographerName} for this open booking request.`,
            });

            await eventRepository.save(event);

            return savedBooking;
        });
    }

    async rejectMyClientBookingApplication(
        bookingId: string,
        applicationId: string,
        userId: string,
    ): Promise<BookingApplication> {
        const booking = await this.bookingRepository.findOne({
            where: {
                id: bookingId,
                clientUserId: userId,
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking request not found.');
        }

        const application = await this.bookingApplicationRepository.findOne({
            where: {
                id: applicationId,
                bookingId,
            },
        });

        if (!application) {
            throw new NotFoundException(
                'Photographer application was not found.',
            );
        }

        if (application.status === 'selected') {
            throw new BadRequestException(
                'A selected application cannot be rejected.',
            );
        }

        if (application.status === 'rejected') {
            return application;
        }

        application.status = 'rejected';
        application.rejectedAt = new Date();

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
                true AS "isOwner",
                CASE
                    WHEN b.status = 'pending'
                     AND b."photographerProfileId" IS NULL
                     AND b."photographerUserId" IS NULL
                    THEN true
                    ELSE false
                END AS "canManage",
                true AS "canViewApplications",
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
                  AND applications.status NOT IN ('withdrawn', 'expired', 'rejected')
            ) application_counts ON true
            WHERE b."clientUserId" = $1
            ORDER BY b."createdAt" DESC
            `,
            [userId],
        );

        return rows as Booking[];
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
        cancelBookingDto: CancelBookingDto,
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

        const reasonLabel =
            CANCEL_REASON_LABELS[cancelBookingDto.cancelReason] ??
            CANCEL_REASON_LABELS.other;

        const noteParts = [`Cancel reason: ${reasonLabel}.`];

        if (cancelBookingDto.cancelReasonNote?.trim()) {
            noteParts.push(cancelBookingDto.cancelReasonNote.trim());
        }

        await this.recordBookingEvent({
            bookingId: savedBooking.id,
            eventType: 'cancelled',
            actorRole: 'client',
            actorUserId: userId,
            actorLabel: booking.clientEmail?.trim() || 'Client',
            note: noteParts.join(' '),
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
                     AND b."photographerProfileId" IS NULL
                     AND b."photographerUserId" IS NULL
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
                     AND b."photographerProfileId" IS NULL
                     AND b."photographerUserId" IS NULL
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
                  AND applications.status NOT IN ('withdrawn', 'expired', 'rejected')
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
              AND (
                (
                    b."photographerProfileId" IS NULL
                    AND b."photographerUserId" IS NULL
                    AND b.status = $3
                )
                OR (
                    $2::uuid IS NOT NULL
                    AND b."clientUserId" = $2::uuid
                )
                OR (
                    $2::uuid IS NOT NULL
                    AND viewer_profile.role = $4
                    AND (
                        b."photographerUserId" = $2::uuid
                        OR b."photographerProfileId" = viewer_profile.id
                    )
                )
              )
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
