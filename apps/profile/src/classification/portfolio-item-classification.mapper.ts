import { Injectable } from '@nestjs/common';

import {
    PORTFOLIO_ITEM_CLASSIFICATION_COVER_WEIGHT,
    PORTFOLIO_ITEM_CLASSIFICATION_GALLERY_WEIGHT,
    PORTFOLIO_ITEM_CLASSIFICATION_MIN_CONFIDENCE,
} from './portfolio-item-classification.constants';
import {
    ClassificationServiceImageResult,
    PortfolioImageRole,
    StyleDistributionEntry,
} from './portfolio-item-classification.types';

@Injectable()
export class PortfolioItemClassificationMapper {
    buildSummary(results: ClassificationServiceImageResult[]): {
        detectedPrimaryStyle: string | null;
        detectedPrimaryScore: number | null;
        detectedSecondaryStyles: StyleDistributionEntry[] | null;
        detectedStyleDistribution: StyleDistributionEntry[] | null;
        successfulImageCount: number;
    } {
        const successfulResults = results.filter(
            (result) =>
                result.status === 'completed' &&
                Array.isArray(result.predictions) &&
                result.predictions.length > 0,
        );

        if (successfulResults.length === 0) {
            return {
                detectedPrimaryStyle: null,
                detectedPrimaryScore: null,
                detectedSecondaryStyles: null,
                detectedStyleDistribution: null,
                successfulImageCount: 0,
            };
        }

        const scoreByLabel = new Map<string, number>();

        for (const result of successfulResults) {
            const roleWeight = this.getRoleWeight(result.role);

            for (const prediction of result.predictions) {
                if (
                    typeof prediction.confidence !== 'number' ||
                    prediction.confidence <
                        PORTFOLIO_ITEM_CLASSIFICATION_MIN_CONFIDENCE
                ) {
                    continue;
                }

                const currentScore = scoreByLabel.get(prediction.label) ?? 0;
                scoreByLabel.set(
                    prediction.label,
                    currentScore + prediction.confidence * roleWeight,
                );
            }
        }

        const totalScore = Array.from(scoreByLabel.values()).reduce(
            (sum, value) => sum + value,
            0,
        );

        if (totalScore <= 0) {
            return {
                detectedPrimaryStyle: null,
                detectedPrimaryScore: null,
                detectedSecondaryStyles: null,
                detectedStyleDistribution: null,
                successfulImageCount: successfulResults.length,
            };
        }

        const detectedStyleDistribution = Array.from(scoreByLabel.entries())
            .map(([label, score]) => ({
                label,
                score: this.roundScore(score / totalScore),
            }))
            .sort((a, b) => b.score - a.score);

        const [primaryStyle, ...secondaryStyles] = detectedStyleDistribution;

        return {
            detectedPrimaryStyle: primaryStyle?.label ?? null,
            detectedPrimaryScore: primaryStyle?.score ?? null,
            detectedSecondaryStyles:
                secondaryStyles.length > 0 ? secondaryStyles.slice(0, 2) : null,
            detectedStyleDistribution,
            successfulImageCount: successfulResults.length,
        };
    }

    private getRoleWeight(role: PortfolioImageRole): number {
        return role === 'cover'
            ? PORTFOLIO_ITEM_CLASSIFICATION_COVER_WEIGHT
            : PORTFOLIO_ITEM_CLASSIFICATION_GALLERY_WEIGHT;
    }

    private roundScore(value: number): number {
        return Number(value.toFixed(4));
    }
}
