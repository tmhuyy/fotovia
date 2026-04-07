import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import {
    CLASSIFY_PORTFOLIO_ITEM_JOB,
    PORTFOLIO_ITEM_CLASSIFICATION_QUEUE,
} from './portfolio-item-classification.constants';
import { PortfolioItemClassificationService } from './portfolio-item-classification.service';
import { QueuePortfolioItemClassificationPayload } from './portfolio-item-classification.types';

@Processor(PORTFOLIO_ITEM_CLASSIFICATION_QUEUE)
export class PortfolioItemClassificationProcessor extends WorkerHost {
    constructor(
        private readonly portfolioItemClassificationService: PortfolioItemClassificationService,
    ) {
        super();
    }

    async process(
        job: Job<QueuePortfolioItemClassificationPayload>,
    ): Promise<void> {
        if (job.name !== CLASSIFY_PORTFOLIO_ITEM_JOB) {
            return;
        }

        await this.portfolioItemClassificationService.processPortfolioItemClassification(
            job.data,
            String(job.id),
        );
    }
}
