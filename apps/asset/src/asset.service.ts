import { Injectable } from '@nestjs/common';
import { AssetRepository } from './repositories/asset.repository';
import { CreateBookingDto } from './dtos/create-booking.dto';

@Injectable()
export class AssetService {
    constructor(private readonly assetRepository: AssetRepository) {}

    async createBooking(createBookingDto: CreateBookingDto, userId: string) {
        const booking = this.assetRepository.create({ ...createBookingDto });

        await this.assetRepository.save(booking);
    }
}
