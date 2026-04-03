import { Injectable } from '@nestjs/common';

import { CreateProfileDto } from './dtos/create-profile.dto';
import { CreateProfileFromAuthDto } from './dtos/create-profile-from-auth.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfileRepository } from './repositories/profile.repository';

@Injectable()
export class ProfileService {
    constructor(private readonly profileRepository: ProfileRepository) {}

    async createProfile(
        createProfileDto: CreateProfileDto,
        userId: string,
    ): Promise<Profile> {
        return this.profileRepository.createProfile(createProfileDto, userId);
    }

    async createProfileFromSignup(
        createProfileFromAuthDto: CreateProfileFromAuthDto,
    ): Promise<Profile> {
        return this.profileRepository.createProfileFromSignup(
            createProfileFromAuthDto,
        );
    }

    async updateProfile(
        updateProfileDto: UpdateProfileDto,
        userId: string,
    ): Promise<Profile> {
        return this.profileRepository.updateProfile(updateProfileDto, userId);
    }

    async getMyProfile(userId: string): Promise<Profile> {
        return this.profileRepository.getProfileByUserId(userId);
    }
}
