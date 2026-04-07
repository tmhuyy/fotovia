import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { UserRole } from '@repo/types';

import { PortfolioItemClassificationService } from './classification/portfolio-item-classification.service';
import { ProfilePortfolioItem } from './entities/profile-portfolio-item.entity';
import { ProfilePortfolioItemRepository } from './repositories/profile-portfolio-item.repository';
import { ProfileRepository } from './repositories/profile.repository';

@Injectable()
export class PortfolioItemClassificationRetryService {
    constructor(
        private readonly profileRepository: ProfileRepository,
        private readonly profilePortfolioItemRepository: ProfilePortfolioItemRepository,
        private readonly portfolioItemClassificationService: PortfolioItemClassificationService,
    ) {}

    async retryMyPortfolioItemClassification(
        itemId: string,
        userId: string,
    ): Promise<ProfilePortfolioItem> {
        const profile = await this.profileRepository.getProfileByUserId(userId);

        if (profile.role !== UserRole.PHOTOGRAPHER) {
            throw new ForbiddenException(
                'Portfolio management is only available for photographer accounts.',
            );
        }

        const currentItem =
            await this.profilePortfolioItemRepository.getByIdForProfile(
                itemId,
                profile.id,
            );

        if (
            currentItem.classificationStatus === 'queued' ||
            currentItem.classificationStatus === 'processing'
        ) {
            throw new BadRequestException(
                'AI classification is already running for this portfolio item.',
            );
        }

        await this.portfolioItemClassificationService.queuePortfolioItemClassification(
            {
                portfolioItemId: currentItem.id,
                profileId: profile.id,
                userId,
                trigger: 'manual_retry',
            },
        );

        return this.profilePortfolioItemRepository.getByIdForProfile(
            currentItem.id,
            profile.id,
        );
    }
}
