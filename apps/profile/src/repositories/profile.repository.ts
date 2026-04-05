import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProfileFromAuthDto } from 'src/dtos/create-profile-from-auth.dto';
import { CreateProfileDto } from 'src/dtos/create-profile.dto';
import { UpdateProfileDto } from 'src/dtos/update-profile.dto';
import { Profile } from 'src/entities/profile.entity';

@Injectable()
export class ProfileRepository extends Repository<Profile> {
    private readonly logger = new Logger(ProfileRepository.name);

    constructor(
        @InjectRepository(Profile)
        private readonly repo: Repository<Profile>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async getProfileByUserId(userId: string): Promise<Profile> {
        const profile = await this.repo.findOne({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundException('Profile does not exist');
        }

        return profile;
    }

    async createProfile(
        createProfileDto: CreateProfileDto,
        userId: string,
    ): Promise<Profile> {
        const existingProfile = await this.repo.findOne({
            where: { userId },
        });

        if (existingProfile) {
            throw new ConflictException('Profile already exists');
        }

        const profile = this.repo.create({
            ...createProfileDto,
            userId,
        });

        return this.repo.save(profile);
    }

    async createProfileFromSignup(
        createProfileFromAuthDto: CreateProfileFromAuthDto,
    ): Promise<Profile> {
        const existingProfile = await this.repo.findOne({
            where: { userId: createProfileFromAuthDto.userId },
        });

        if (existingProfile) {
            this.logger.warn(
                `Profile already exists for userId=${createProfileFromAuthDto.userId}`,
            );
            throw new ConflictException('Profile already exists');
        }

        const profile = this.repo.create(createProfileFromAuthDto);
        return this.repo.save(profile);
    }

    async updateProfile(
        updateProfileDto: UpdateProfileDto,
        userId: string,
    ): Promise<Profile> {
        const profile = await this.getProfileByUserId(userId);
        const updatedProfile = this.repo.merge(profile, updateProfileDto);

        return this.repo.save(updatedProfile);
    }

    async updateAvatar(
        userId: string,
        avatarAssetId: string,
        avatarUrl: string,
    ): Promise<Profile> {
        const profile = await this.getProfileByUserId(userId);

        profile.avatarAssetId = avatarAssetId;
        profile.avatarUrl = avatarUrl;

        return this.repo.save(profile);
    }
}
