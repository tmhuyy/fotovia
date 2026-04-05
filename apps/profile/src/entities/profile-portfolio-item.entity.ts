import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
