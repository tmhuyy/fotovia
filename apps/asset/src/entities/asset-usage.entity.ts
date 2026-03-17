import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Asset } from './asset.entity';
import { AssetUsageRole } from '@repo/types';

@Entity('asset_usages')
@Index('IDX_ASSET_USAGES_ASSET_ID_DETACHED_AT', ['assetId', 'detachedAt'])
@Index('IDX_ASSET_USAGES_ENTITY_LOOKUP', [
    'serviceName',
    'entityType',
    'entityId',
])
@Index('IDX_ASSET_USAGES_ENTITY_FIELD_LOOKUP', [
    'serviceName',
    'entityType',
    'entityId',
    'fieldName',
])
export class AssetUsage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    assetId: string;

    @ManyToOne(() => Asset, (asset) => asset.usages, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'assetId' })
    asset: Asset;

    @Column({ type: 'varchar', length: 100 })
    serviceName: string;

    @Column({ type: 'varchar', length: 100 })
    entityType: string;

    @Column({ type: 'varchar', length: 255 })
    entityId: string;

    @Column({ type: 'varchar', length: 100 })
    fieldName: string;

    @Column({
        type: 'enum',
        enum: AssetUsageRole,
        default: AssetUsageRole.PRIMARY,
    })
    usageRole: AssetUsageRole;

    @Column({ type: 'int', nullable: true })
    sortOrder: number | null;

    @Column({ type: 'uuid', nullable: true })
    attachedByUserId: string | null;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    attachedAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    detachedAt: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
