import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ASSET_SERVICE } from '@repo/common';
import { AssetPurpose, AssetUsageRole } from '@repo/types';

import { CreateProfileFromAuthDto } from './dtos/create-profile-from-auth.dto';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileAvatarDto } from './dtos/update-profile-avatar.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfileRepository } from './repositories/profile.repository';

const ASSET_GET_BY_ID_PATTERN = 'asset.get_by_id';
const ASSET_GET_READ_URL_PATTERN = 'asset.get_read_url';
const ASSET_ATTACH_USAGE_PATTERN = 'asset.attach_usage';

type AssetRecord = {
    id: string;
    purpose: AssetPurpose;
};

type AssetReadUrlResponse = {
    assetId: string;
    url: string;
    expiresInSeconds: number | null;
};

type AttachAssetUsagePayload = {
    userId: string;
    dto: {
        assetId: string;
        serviceName: string;
        entityType: string;
        entityId: string;
        fieldName: string;
        usageRole: AssetUsageRole;
        replaceExistingActiveUsage: boolean;
    };
};

@Injectable()
export class ProfileService {
    constructor(
        private readonly profileRepository: ProfileRepository,
        @Inject(ASSET_SERVICE) private readonly assetClient: ClientProxy,
    ) {}

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

    async updateMyAvatar(
        updateProfileAvatarDto: UpdateProfileAvatarDto,
        userId: string,
    ): Promise<Profile> {
        const profile = await this.profileRepository.getProfileByUserId(userId);

        const asset = await this.sendAssetRpc<AssetRecord>(
            ASSET_GET_BY_ID_PATTERN,
            {
                assetId: updateProfileAvatarDto.assetId,
                userId,
            },
        );

        if (asset.purpose !== AssetPurpose.AVATAR) {
            throw new BadRequestException(
                'Selected asset is not an avatar asset.',
            );
        }

        await this.sendAssetRpc(ASSET_ATTACH_USAGE_PATTERN, <
            AttachAssetUsagePayload
        >{
            userId,
            dto: {
                assetId: updateProfileAvatarDto.assetId,
                serviceName: 'profile',
                entityType: 'profile',
                entityId: profile.id,
                fieldName: 'avatar',
                usageRole: AssetUsageRole.PRIMARY,
                replaceExistingActiveUsage: true,
            },
        });

        const readUrl = await this.sendAssetRpc<AssetReadUrlResponse>(
            ASSET_GET_READ_URL_PATTERN,
            {
                assetId: updateProfileAvatarDto.assetId,
                userId,
            },
        );

        if (!readUrl.url) {
            throw new BadRequestException(
                'Could not resolve a readable URL for the avatar asset.',
            );
        }

        return this.profileRepository.updateAvatar(
            userId,
            updateProfileAvatarDto.assetId,
            readUrl.url,
        );
    }

    private async sendAssetRpc<T>(
        pattern: string,
        payload: unknown,
    ): Promise<T> {
        return firstValueFrom(
            this.assetClient.send<T, unknown>(pattern, payload),
        );
    }
}
