import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProfilePortfolioItemImageClassification } from 'src/entities/profile-portfolio-item-image-classification.entity';

type CreateProfilePortfolioItemImageClassificationRecord = Omit<
    ProfilePortfolioItemImageClassification,
    'id' | 'portfolioItem' | 'createdAt' | 'updatedAt'
>;

@Injectable()
export class ProfilePortfolioItemImageClassificationRepository extends Repository<ProfilePortfolioItemImageClassification> {
    constructor(
        @InjectRepository(ProfilePortfolioItemImageClassification)
        private readonly repo: Repository<ProfilePortfolioItemImageClassification>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async replaceForPortfolioItem(
        portfolioItemId: string,
        payload: CreateProfilePortfolioItemImageClassificationRecord[],
    ): Promise<ProfilePortfolioItemImageClassification[]> {
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
