import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { ProfilePortfolioItem } from './profile-portfolio-item.entity';

@Entity('profile_portfolio_item_image_classifications')
export class ProfilePortfolioItemImageClassification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'portfolio_item_id', type: 'uuid' })
    portfolioItemId: string;

    @ManyToOne(
        () => ProfilePortfolioItem,
        (portfolioItem) => portfolioItem.imageClassifications,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'portfolio_item_id' })
    portfolioItem: ProfilePortfolioItem;

    @Column({ name: 'asset_id', type: 'uuid' })
    assetId: string;

    @Column({ name: 'image_key', type: 'varchar', length: 150 })
    imageKey: string;

    @Column({ type: 'varchar', length: 20 })
    role: string;

    @Column({ type: 'varchar', length: 20 })
    status: string;

    @Column({ name: 'predictions_json', type: 'jsonb', nullable: true })
    predictionsJson: Array<{ label: string; confidence: number }> | null;

    @Column({ name: 'top_label', type: 'varchar', length: 100, nullable: true })
    topLabel: string | null;

    @Column({ name: 'top_confidence', type: 'float', nullable: true })
    topConfidence: number | null;

    @Column({ type: 'text', nullable: true })
    error: string | null;

    @Column({ name: 'classified_at', type: 'timestamptz', nullable: true })
    classifiedAt: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
