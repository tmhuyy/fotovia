import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import {
    AssetStatus,
    AssetVisibility,
    AssetResourceType,
    AssetPurpose,
    StorageProvider,
} from '@repo/types';
import { AssetUploadSession } from './asset-upload-session.entity';
import { AssetUsage } from './asset-usage.entity';

@Entity('assets')
@Index('IDX_ASSETS_OWNER_PURPOSE_STATUS', ['ownerUserId', 'purpose', 'status'])
@Index('IDX_ASSETS_STATUS_CREATED_AT', ['status', 'createdAt'])
@Index(
    'UQ_ASSETS_PROVIDER_BUCKET_OBJECT_KEY',
    ['provider', 'bucketName', 'objectKey'],
    {
        unique: true,
    },
)
export class Asset {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    ownerUserId: string;

    @Column({
        type: 'enum',
        enum: StorageProvider,
        default: StorageProvider.SUPABASE_STORAGE,
    })
    provider: StorageProvider;

    @Column({ type: 'varchar', length: 255 })
    bucketName: string;

    @Column({ type: 'varchar', length: 1024 })
    objectKey: string;

    @Column({ type: 'varchar', length: 255 })
    originalFilename: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    fileExtension: string | null;

    @Column({ type: 'varchar', length: 100 })
    mimeType: string;

    @Column({ type: 'bigint' })
    sizeBytes: string;

    @Column({ type: 'varchar', length: 128, nullable: true })
    checksumSha256: string | null;

    @Column({
        type: 'enum',
        enum: AssetResourceType,
        default: AssetResourceType.IMAGE,
    })
    resourceType: AssetResourceType;

    @Column({
        type: 'enum',
        enum: AssetPurpose,
    })
    purpose: AssetPurpose;

    @Column({
        type: 'enum',
        enum: AssetVisibility,
        default: AssetVisibility.PUBLIC,
    })
    visibility: AssetVisibility;

    @Column({
        type: 'enum',
        enum: AssetStatus,
        default: AssetStatus.PENDING_UPLOAD,
    })
    status: AssetStatus;

    @Column({ type: 'int', nullable: true })
    width: number | null;

    @Column({ type: 'int', nullable: true })
    height: number | null;

    @Column({ type: 'int', nullable: true })
    durationMs: number | null;

    @Column({ type: 'jsonb', nullable: true })
    metadataJson: Record<string, any> | null;

    @Column({ type: 'text', nullable: true })
    failureReason: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    uploadedAt: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    deletedAt: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToMany(() => AssetUploadSession, (uploadSession) => uploadSession.asset)
    uploadSessions: AssetUploadSession[];

    @OneToMany(() => AssetUsage, (usage) => usage.asset)
    usages: AssetUsage[];
}
