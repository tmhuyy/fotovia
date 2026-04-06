import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Booking } from 'src/entities/booking.entity';

@Injectable()
export class BookingRepository extends Repository<Booking> {
    constructor(
        @InjectRepository(Booking)
        private readonly repo: Repository<Booking>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }
}
