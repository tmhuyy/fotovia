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

@Entity('profile_portfolio_item_images')
export class ProfilePortfolioItemImage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'portfolio_item_id', type: 'uuid' })
    portfolioItemId: string;

    @ManyToOne(
        () => ProfilePortfolioItem,
        (portfolioItem) => portfolioItem.galleryImages,
        {
            onDelete: 'CASCADE',
        },
    )
    @JoinColumn({ name: 'portfolio_item_id' })
    portfolioItem: ProfilePortfolioItem;

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

    @Column({ name: 'sort_order', type: 'int', default: 0 })
    sortOrder: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
