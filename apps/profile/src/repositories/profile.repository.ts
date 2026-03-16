import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    // UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Profile } from 'src/entities/profile.entity';
import { CreateProfileDto } from 'src/dtos/create-profile.dto';
import { UpdateProfileDto } from 'src/dtos/update-profile.dto';

@Injectable()
export class ProfileRepository extends Repository<Profile> {
    // constructor(private dataSource: DataSource) {
    //   super(User, dataSource.createEntityManager());
    // }
    private readonly logger = new Logger(ProfileRepository.name);

    constructor(@InjectRepository(Profile) private repo: Repository<Profile>) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async createProfile(
        createProfileDto: CreateProfileDto,
        userId: string,
    ): Promise<Profile> {
        const existingProfile = await this.repo.findOne({
            where: { userId: userId },
        });

        if (existingProfile) {
            throw new ConflictException('Profile already exists for this user');
        }

        const profile = this.repo.create({
            ...createProfileDto,
            userId,
            specialties: createProfileDto.specialties ?? [],
        });

        try {
            return await this.repo.save(profile);
        } catch (error) {
            this.logger.error(
                'Failed to create profile',
                error?.stack || error,
            );

            if (error instanceof QueryFailedError) {
                throw new InternalServerErrorException(
                    'Database error while creating profile',
                );
            }

            throw error;
        }
    }

    async updateProfile(
        updateProfileDto: UpdateProfileDto,
        userId: string,
    ): Promise<Profile> {
        const existingProfile = await this.repo.findOne({
            where: { userId },
        });

        if (!existingProfile) {
            throw new NotFoundException('Profile not found');
        }

        const mergedProfile = this.repo.merge(existingProfile, {
            ...updateProfileDto,
            specialties:
                updateProfileDto.specialties ?? existingProfile.specialties,
        });

        try {
            return await this.repo.save(mergedProfile);
        } catch (error) {
            this.logger.error(
                'Failed to update profile',
                error?.stack || error,
            );

            if (error instanceof QueryFailedError) {
                throw new InternalServerErrorException(
                    'Database error while updating profile',
                );
            }

            throw error;
        }
    }
}
