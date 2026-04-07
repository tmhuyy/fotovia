import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

import { ProfilePortfolioItemImageClassification } from './profile-portfolio-item-image-classification.entity';
import { ProfilePortfolioItemImage } from './profile-portfolio-item-image.entity';
import { Profile } from './profile.entity';

@Entity('profile_portfolio_items')
export class ProfilePortfolioItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'profile_id', type: 'uuid' })
    profileId: string;

    @ManyToOne(() => Profile, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'profile_id' })
    profile: Profile;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ name: 'asset_id', type: 'uuid' })
    assetId: string;

    @Column({ name: 'asset_url', type: 'text' })
    assetUrl: string;

    @Column({
        name: 'asset_file_name',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    assetFileName: string | null;

    @Column({
        name: 'asset_mime_type',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    assetMimeType: string | null;

    @Column({ name: 'asset_size_bytes', type: 'int', nullable: true })
    assetSizeBytes: number | null;

    @Column({ type: 'varchar', length: 50 })
    category: string;

    @Column({ name: 'is_featured', type: 'boolean', default: false })
    isFeatured: boolean;

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @Column({
        name: 'classification_status',
        type: 'varchar',
        length: 30,
        default: 'not_requested',
    })
    classificationStatus: string;

    @Column({
        name: 'classification_job_id',
        type: 'varchar',
        length: 120,
        nullable: true,
    })
    classificationJobId: string | null;

    @Column({
        name: 'classification_requested_at',
        type: 'timestamptz',
        nullable: true,
    })
    classificationRequestedAt: Date | null;

    @Column({
        name: 'classification_started_at',
        type: 'timestamptz',
        nullable: true,
    })
    classificationStartedAt: Date | null;

    @Column({
        name: 'classification_completed_at',
        type: 'timestamptz',
        nullable: true,
    })
    classificationCompletedAt: Date | null;

    @Column({
        name: 'classification_failed_at',
        type: 'timestamptz',
        nullable: true,
    })
    classificationFailedAt: Date | null;

    @Column({
        name: 'classification_error',
        type: 'text',
        nullable: true,
    })
    classificationError: string | null;

    @Column({
        name: 'detected_primary_style',
        type: 'varchar',
        length: 100,
        nullable: true,
    })
    detectedPrimaryStyle: string | null;

    @Column({
        name: 'detected_primary_score',
        type: 'float',
        nullable: true,
    })
    detectedPrimaryScore: number | null;

    @Column({
        name: 'detected_secondary_styles',
        type: 'jsonb',
        nullable: true,
    })
    detectedSecondaryStyles: Array<{ label: string; score: number }> | null;

    @Column({
        name: 'detected_style_distribution',
        type: 'jsonb',
        nullable: true,
    })
    detectedStyleDistribution: Array<{ label: string; score: number }> | null;

    @OneToMany(
        () => ProfilePortfolioItemImage,
        (galleryImage) => galleryImage.portfolioItem,
    )
    galleryImages: ProfilePortfolioItemImage[];

    @OneToMany(
        () => ProfilePortfolioItemImageClassification,
        (imageClassification) => imageClassification.portfolioItem,
    )
    imageClassifications: ProfilePortfolioItemImageClassification[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
