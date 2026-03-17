import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    // UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Logger  } from '@nestjs/common';
import { Asset } from 'src/entities/asset.entity';

@Injectable()
export class AssetRepository extends Repository<Asset> {
    // constructor(private dataSource: DataSource) {
    //   super(User, dataSource.createEntityManager());
    // }
    private readonly logger = new Logger(AssetRepository.name);

    constructor(@InjectRepository(Asset) private repo: Repository<Asset>) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

}
