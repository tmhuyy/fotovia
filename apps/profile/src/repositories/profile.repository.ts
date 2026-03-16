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
import { Profile } from 'src/entities/profile.entity';

@Injectable()
export class ProfileRepository extends Repository<Profile> {
    // constructor(private dataSource: DataSource) {
    //   super(User, dataSource.createEntityManager());
    // }
    private readonly logger = new Logger(ProfileRepository.name);

    constructor(@InjectRepository(Profile) private repo: Repository<Profile>) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

}
