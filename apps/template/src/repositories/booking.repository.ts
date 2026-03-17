import { Repository } from 'typeorm';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    // UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Booking } from 'src/entities/booking.entity';

@Injectable()
export class BookingRepository extends Repository<Booking> {
    // constructor(private dataSource: DataSource) {
    //   super(User, dataSource.createEntityManager());
    // }
    private readonly logger = new Logger(BookingRepository.name);

    constructor(@InjectRepository(Booking) private repo: Repository<Booking>) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

}
