import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { UserRole } from '@repo/types';

import { BookingService } from './booking.service';
import { BookingRepository } from './repositories/booking.repository';

describe('BookingService', () => {
    let service: BookingService;
    let bookingRepository: {
        create: jest.Mock;
        save: jest.Mock;
        find: jest.Mock;
        findOne: jest.Mock;
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

    it('should create a pending booking request with photographer ownership resolved', async () => {
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

        const result = await service.createBooking(
            dto,
            '22222222-2222-2222-2222-222222222222',
            'client@example.com',
        );

        expect(dataSource.query).toHaveBeenCalledWith(
            expect.stringContaining('FROM profiles'),
            [dto.photographerProfileId, UserRole.PHOTOGRAPHER],
        );

        expect(bookingRepository.create).toHaveBeenCalledWith({
            clientUserId: '22222222-2222-2222-2222-222222222222',
            clientEmail: 'client@example.com',
            photographerProfileId: dto.photographerProfileId,
            photographerUserId: '99999999-9999-9999-9999-999999999999',
            photographerSlug: dto.photographerSlug,
            photographerName: dto.photographerName,
            sessionType: dto.sessionType,
            sessionDate: dto.sessionDate,
            sessionTime: dto.sessionTime,
            duration: dto.duration,
            location: dto.location,
            budget: dto.budget,
            contactPreference: dto.contactPreference,
            concept: dto.concept,
            inspiration: dto.inspiration,
            notes: dto.notes,
            status: 'pending',
        });

        expect(bookingRepository.save).toHaveBeenCalledWith(createdEntity);
        expect(result).toMatchObject({
            id: savedEntity.id,
            status: 'pending',
            clientEmail: 'client@example.com',
            photographerUserId: '99999999-9999-9999-9999-999999999999',
        });
    });

    it('should get photographer bookings using current ownership conditions', async () => {
        dataSource.query.mockResolvedValueOnce([
            {
                id: '44444444-4444-4444-4444-444444444444',
                userId: '99999999-9999-9999-9999-999999999999',
                role: UserRole.PHOTOGRAPHER,
            },
        ]);

        bookingRepository.find.mockResolvedValue([]);

        await service.getMyPhotographerBookings(
            '99999999-9999-9999-9999-999999999999',
        );

        expect(bookingRepository.find).toHaveBeenCalledWith({
            where: [
                {
                    photographerUserId: '99999999-9999-9999-9999-999999999999',
                },
                {
                    photographerProfileId:
                        '44444444-4444-4444-4444-444444444444',
                },
            ],
            order: {
                createdAt: 'DESC',
            },
        });
    });

    it('should update a pending booking request status for the photographer owner', async () => {
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
            status: 'pending',
        });

        bookingRepository.save.mockImplementation(async (booking) => booking);

        const result = await service.updateMyPhotographerBookingStatus(
            '55555555-5555-5555-5555-555555555555',
            '99999999-9999-9999-9999-999999999999',
            { status: 'confirmed' },
        );

        expect(bookingRepository.findOne).toHaveBeenCalledWith({
            where: [
                {
                    id: '55555555-5555-5555-5555-555555555555',
                    photographerUserId: '99999999-9999-9999-9999-999999999999',
                },
                {
                    id: '55555555-5555-5555-5555-555555555555',
                    photographerProfileId:
                        '44444444-4444-4444-4444-444444444444',
                },
            ],
        });

        expect(bookingRepository.save).toHaveBeenCalledWith(
            expect.objectContaining({
                id: '55555555-5555-5555-5555-555555555555',
                status: 'confirmed',
            }),
        );

        expect(result).toMatchObject({
            id: '55555555-5555-5555-5555-555555555555',
            status: 'confirmed',
        });
    });
});
