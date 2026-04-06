import { Test, TestingModule } from '@nestjs/testing';

import { BookingService } from './booking.service';
import { BookingRepository } from './repositories/booking.repository';

describe('BookingService', () => {
    let service: BookingService;
    let bookingRepository: {
        create: jest.Mock;
        save: jest.Mock;
    };

    beforeEach(async () => {
        bookingRepository = {
            create: jest.fn(),
            save: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingService,
                {
                    provide: BookingRepository,
                    useValue: bookingRepository,
                },
            ],
        }).compile();

        service = module.get<BookingService>(BookingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a pending booking request', async () => {
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

        const createdEntity = {
            clientUserId: '22222222-2222-2222-2222-222222222222',
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
        );

        expect(bookingRepository.create).toHaveBeenCalledWith({
            clientUserId: '22222222-2222-2222-2222-222222222222',
            photographerProfileId: dto.photographerProfileId,
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
            photographerSlug: dto.photographerSlug,
        });
    });
});
