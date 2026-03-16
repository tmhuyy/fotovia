import { Injectable } from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { ProfileRepository } from './repositories/profile.repository';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable()
export class ProfileService {
    constructor(private readonly profileRepository: ProfileRepository) {}
    //TODO check about pass role value from request body
    async createProfile(
        createProfileDto: CreateProfileDto,
        userId: string,
    ): Promise<Profile> {
        return this.profileRepository.createProfile(createProfileDto, userId);
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
