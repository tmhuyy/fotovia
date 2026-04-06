import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProfilePortfolioItemImage } from 'src/entities/profile-portfolio-item-image.entity';

type CreateProfilePortfolioItemImageRecord = Omit<
    ProfilePortfolioItemImage,
    'id' | 'portfolioItem' | 'createdAt' | 'updatedAt'
>;

@Injectable()
export class ProfilePortfolioItemImageRepository extends Repository<ProfilePortfolioItemImage> {
    constructor(
        @InjectRepository(ProfilePortfolioItemImage)
        private readonly repo: Repository<ProfilePortfolioItemImage>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async replaceGalleryImages(
        portfolioItemId: string,
        payload: CreateProfilePortfolioItemImageRecord[],
    ): Promise<ProfilePortfolioItemImage[]> {
        await this.repo.delete({
            portfolioItemId,
        });

        if (payload.length === 0) {
            return [];
        }

        const records = this.repo.create(payload);
        return this.repo.save(records);
    }

    async deleteByPortfolioItemId(portfolioItemId: string): Promise<void> {
        await this.repo.delete({
            portfolioItemId,
        });
    }
}
