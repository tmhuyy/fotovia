import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProfilePortfolioItem } from 'src/entities/profile-portfolio-item.entity';

type CreateProfilePortfolioItemRecord = Omit<
    ProfilePortfolioItem,
    'id' | 'profile' | 'createdAt' | 'updatedAt'
>;

@Injectable()
export class ProfilePortfolioItemRepository extends Repository<ProfilePortfolioItem> {
    constructor(
        @InjectRepository(ProfilePortfolioItem)
        private readonly repo: Repository<ProfilePortfolioItem>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async listByProfileId(profileId: string): Promise<ProfilePortfolioItem[]> {
        return this.repo.find({
            where: { profileId },
            order: {
                createdAt: 'DESC',
                sortOrder: 'DESC',
            },
        });
    }

    async getByIdForProfile(
        itemId: string,
        profileId: string,
    ): Promise<ProfilePortfolioItem> {
        const item = await this.repo.findOne({
            where: {
                id: itemId,
                profileId,
            },
        });

        if (!item) {
            throw new NotFoundException('Portfolio item does not exist.');
        }

        return item;
    }

    async getNextSortOrder(profileId: string): Promise<number> {
        const count = await this.repo.count({
            where: { profileId },
        });

        return count + 1;
    }

    async createPortfolioItem(
        payload: CreateProfilePortfolioItemRecord,
    ): Promise<ProfilePortfolioItem> {
        const item = this.repo.create(payload);
        return this.repo.save(item);
    }

    async updatePortfolioItem(
        itemId: string,
        profileId: string,
        payload: Partial<ProfilePortfolioItem>,
    ): Promise<ProfilePortfolioItem> {
        const currentItem = await this.getByIdForProfile(itemId, profileId);
        const nextItem = this.repo.merge(currentItem, payload);

        return this.repo.save(nextItem);
    }

    async deletePortfolioItem(
        itemId: string,
        profileId: string,
    ): Promise<void> {
        const item = await this.getByIdForProfile(itemId, profileId);
        await this.repo.remove(item);
    }
}
