import { Injectable } from '@nestjs/common';
import { Profile } from './entities/profile.entity';
import { ProfileRepository } from './repositories/profile.repository';
import { CreateProfileDto } from './dtos/create-profile.dto';

@Injectable()
export class ProfileService {
    constructor(private readonly profileRepository: ProfileRepository) {}

    async createProfile(createProfileDto: CreateProfileDto, userId: string): Promise<Profile> {
        return this.profileRepository.createProfile(createProfileDto, userId);
    }
}
