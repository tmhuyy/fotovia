import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRole } from '@repo/types';

import { BookingService } from './booking.service';
import { BookingEvent } from './entities/booking-event.entity';
import { BookingRepository } from './repositories/booking.repository';

describe('BookingService', () => {
    let service: BookingService;
    let bookingRepository: {
        create: jest.Mock;
        save: jest.Mock;
        find: jest.Mock;
        findOne: jest.Mock;
    };
    let bookingEventRepository: {
        create: jest.Mock;
        save: jest.Mock;
        find: jest.Mock;
    };
    let dataSource: {
        query: jest.Mock;
    };

    beforeEach(async () => {
        bookingRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
        };

        bookingEventRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };

        dataSource = {
            query: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingService,
                {
                    provide: BookingRepository,
                    useValue: bookingRepository,
                },
                {
                    provide: getRepositoryToken(BookingEvent),
                    useValue: bookingEventRepository,
                },
                {
                    provide: DataSource,
                    useValue: dataSource,
                },
            ],
        }).compile();

        service = module.get<BookingService>(BookingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a pending booking request and record a created timeline event', async () => {
        const dto = {
            photographerProfileId: '11111111-1111-1111-1111-111111111111',
            photographerSlug: 'anna-nguyen',
            photographerName: 'Anna Nguyen',
            sessionType: 'editorial',
            sessionDate: '2026-04-20',
            sessionTime: '15:30',
            duration: '120',
            location: 'Ho Chi Minh City',
            budget: '1000-2500',
            contactPreference: 'email',
            concept: 'Modern outdoor editorial portraits for a campaign.',
            inspiration: 'Soft natural light',
            notes: 'Need edited images in one week',
        };

        dataSource.query.mockResolvedValueOnce([
            {
                id: dto.photographerProfileId,
                userId: '99999999-9999-9999-9999-999999999999',
                role: UserRole.PHOTOGRAPHER,
            },
        ]);

        const createdEntity = {
            clientUserId: '22222222-2222-2222-2222-222222222222',
            clientEmail: 'client@example.com',
            photographerUserId: '99999999-9999-9999-9999-999999999999',
            ...dto,
            status: 'pending',
        };

        const savedEntity = {
            id: '33333333-3333-3333-3333-333333333333',
            ...createdEntity,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        bookingRepository.create.mockReturnValue(createdEntity);
        bookingRepository.save.mockResolvedValue(savedEntity);
        bookingEventRepository.create.mockImplementation((value) => value);
        bookingEventRepository.save.mockResolvedValue({
            id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        });

        const result = await service.createBooking(
            dto,
            '22222222-2222-2222-2222-222222222222',
            'client@example.com',
        );

        expect(bookingEventRepository.create).toHaveBeenCalledWith({
            bookingId: savedEntity.id,
            eventType: 'created',
            actorRole: 'client',
            actorUserId: '22222222-2222-2222-2222-222222222222',
            actorLabel: 'client@example.com',
            note: 'Booking request created.',
        });

        expect(result).toMatchObject({
            id: savedEntity.id,
            status: 'pending',
        });
    });

    it('should return booking history for the current client account', async () => {
        bookingRepository.find.mockResolvedValue([]);

        await service.getMyClientBookings(
            '22222222-2222-2222-2222-222222222222',
        );

        expect(bookingRepository.find).toHaveBeenCalledWith({
            where: {
                clientUserId: '22222222-2222-2222-2222-222222222222',
            },
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should return activity timeline for the current client booking', async () => {
        bookingRepository.findOne.mockResolvedValue({
            id: '88888888-8888-8888-8888-888888888888',
            clientUserId: '22222222-2222-2222-2222-222222222222',
        });

        bookingEventRepository.find.mockResolvedValue([]);

        await service.getMyClientBookingTimeline(
            '88888888-8888-8888-8888-888888888888',
            '22222222-2222-2222-2222-222222222222',
        );

        expect(bookingEventRepository.find).toHaveBeenCalledWith({
            where: {
                bookingId: '88888888-8888-8888-8888-888888888888',
            },
            order: {
                createdAt: 'ASC',
            },
        });
    });

    it('should cancel a pending booking request and record a cancelled timeline event', async () => {
        bookingRepository.findOne.mockResolvedValue({
            id: '88888888-8888-8888-8888-888888888888',
            clientUserId: '22222222-2222-2222-2222-222222222222',
            clientEmail: 'client@example.com',
            status: 'pending',
        });

        bookingRepository.save.mockImplementation(async (booking) => booking);
        bookingEventRepository.create.mockImplementation((value) => value);
        bookingEventRepository.save.mockResolvedValue({
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        });

        const result = await service.cancelMyClientBooking(
            '88888888-8888-8888-8888-888888888888',
            '22222222-2222-2222-2222-222222222222',
        );

        expect(bookingEventRepository.create).toHaveBeenCalledWith({
            bookingId: '88888888-8888-8888-8888-888888888888',
            eventType: 'cancelled',
            actorRole: 'client',
            actorUserId: '22222222-2222-2222-2222-222222222222',
            actorLabel: 'client@example.com',
            note: 'Client cancelled the pending request.',
        });

        expect(result).toMatchObject({
            id: '88888888-8888-8888-8888-888888888888',
            status: 'cancelled',
        });
    });

    it('should reject non-photographer access to the inbox', async () => {
        dataSource.query.mockResolvedValueOnce([]);

        await expect(
            service.getMyPhotographerBookings(
                '99999999-9999-9999-9999-999999999999',
            ),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should return photographer timeline for an owned booking', async () => {
        dataSource.query.mockResolvedValueOnce([
            {
                id: '44444444-4444-4444-4444-444444444444',
                userId: '99999999-9999-9999-9999-999999999999',
                role: UserRole.PHOTOGRAPHER,
            },
        ]);

        bookingRepository.findOne.mockResolvedValue({
            id: '55555555-5555-5555-5555-555555555555',
            photographerProfileId: '44444444-4444-4444-4444-444444444444',
            photographerUserId: '99999999-9999-9999-9999-999999999999',
        });

        bookingEventRepository.find.mockResolvedValue([]);

        await service.getMyPhotographerBookingTimeline(
            '55555555-5555-5555-5555-555555555555',
            '99999999-9999-9999-9999-999999999999',
        );

        expect(bookingEventRepository.find).toHaveBeenCalledWith({
            where: {
                bookingId: '55555555-5555-5555-5555-555555555555',
            },
            order: {
                createdAt: 'ASC',
            },
        });
    });

    it('should record a confirmed event for the photographer owner', async () => {
        dataSource.query.mockResolvedValueOnce([
            {
                id: '44444444-4444-4444-4444-444444444444',
                userId: '99999999-9999-9999-9999-999999999999',
                role: UserRole.PHOTOGRAPHER,
            },
        ]);

        bookingRepository.findOne.mockResolvedValue({
            id: '55555555-5555-5555-5555-555555555555',
            photographerProfileId: '44444444-4444-4444-4444-444444444444',
            photographerUserId: '99999999-9999-9999-9999-999999999999',
            photographerName: 'Anna Nguyen',
            status: 'pending',
        });

        bookingRepository.save.mockImplementation(async (booking) => booking);
        bookingEventRepository.create.mockImplementation((value) => value);
        bookingEventRepository.save.mockResolvedValue({
            id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        });

        const result = await service.updateMyPhotographerBookingStatus(
            '55555555-5555-5555-5555-555555555555',
            '99999999-9999-9999-9999-999999999999',
            { status: 'confirmed' },
        );

        expect(bookingEventRepository.create).toHaveBeenCalledWith({
            bookingId: '55555555-5555-5555-5555-555555555555',
            eventType: 'confirmed',
            actorRole: 'photographer',
            actorUserId: '99999999-9999-9999-9999-999999999999',
            actorLabel: 'Anna Nguyen',
            note: 'Photographer confirmed the booking request.',
        });

        expect(result).toMatchObject({
            id: '55555555-5555-5555-5555-555555555555',
            status: 'confirmed',
        });
    });

    it('should record a completed event for the photographer owner', async () => {
        dataSource.query.mockResolvedValueOnce([
            {
                id: '44444444-4444-4444-4444-444444444444',
                userId: '99999999-9999-9999-9999-999999999999',
                role: UserRole.PHOTOGRAPHER,
            },
        ]);

        bookingRepository.findOne.mockResolvedValue({
            id: '66666666-6666-6666-6666-666666666666',
            photographerProfileId: '44444444-4444-4444-4444-444444444444',
            photographerUserId: '99999999-9999-9999-9999-999999999999',
            photographerName: 'Anna Nguyen',
            status: 'confirmed',
        });

        bookingRepository.save.mockImplementation(async (booking) => booking);
        bookingEventRepository.create.mockImplementation((value) => value);
        bookingEventRepository.save.mockResolvedValue({
            id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        });

        const result = await service.updateMyPhotographerBookingStatus(
            '66666666-6666-6666-6666-666666666666',
            '99999999-9999-9999-9999-999999999999',
            { status: 'completed' },
        );

        expect(bookingEventRepository.create).toHaveBeenCalledWith({
            bookingId: '66666666-6666-6666-6666-666666666666',
            eventType: 'completed',
            actorRole: 'photographer',
            actorUserId: '99999999-9999-9999-9999-999999999999',
            actorLabel: 'Anna Nguyen',
            note: 'Photographer marked the booking as completed.',
        });

        expect(result).toMatchObject({
            id: '66666666-6666-6666-6666-666666666666',
            status: 'completed',
        });
    });
});
