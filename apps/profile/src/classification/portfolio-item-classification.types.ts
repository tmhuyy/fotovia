export type PortfolioItemClassificationStatus =
    | 'not_requested'
    | 'queued'
    | 'processing'
    | 'completed'
    | 'failed';

export type PortfolioImageRole = 'cover' | 'gallery';

export type PortfolioItemClassificationTrigger = 'create' | 'update';

export type ClassificationPrediction = {
    label: string;
    confidence: number;
};

export type ClassificationServiceImageInput = {
    imageKey: string;
    url: string;
    role: PortfolioImageRole;
};

export type ClassificationServiceImageResult = {
    imageKey: string;
    role: PortfolioImageRole;
    status: 'completed' | 'failed';
    predictions: ClassificationPrediction[];
    error?: string | null;
};

export type ClassificationServiceBatchResponse = {
    statusCode: number;
    data: {
        modelName: string;
        numClasses: number;
        topKApplied: number;
        totalImages: number;
        completedCount: number;
        failedCount: number;
        results: ClassificationServiceImageResult[];
    };
};

export type QueuePortfolioItemClassificationPayload = {
    portfolioItemId: string;
    profileId: string;
    userId: string;
    trigger: PortfolioItemClassificationTrigger;
};

export type StyleDistributionEntry = {
    label: string;
    score: number;
};
