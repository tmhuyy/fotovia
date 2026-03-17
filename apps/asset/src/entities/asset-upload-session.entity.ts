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
import { UploadSessionStatus } from '@repo/types';
import { Asset } from './asset.entity';

@Entity('asset_upload_sessions')
@Index('IDX_UPLOAD_SESSIONS_ASSET_ID', ['assetId'])
@Index('IDX_UPLOAD_SESSIONS_REQUESTED_BY_STATUS', [
    'requestedByUserId',
    'status',
])
@Index('IDX_UPLOAD_SESSIONS_EXPIRES_AT_STATUS', ['expiresAt', 'status'])
export class AssetUploadSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    assetId: string;

    @ManyToOne(() => Asset, (asset) => asset.uploadSessions, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'assetId' })
    asset: Asset;

    @Column({ type: 'uuid' })
    requestedByUserId: string;

    @Column({ type: 'varchar', length: 50, default: 'signed_url' })
    uploadMethod: string;

    @Column({ type: 'varchar', length: 100 })
    expectedMimeType: string;

    @Column({ type: 'bigint' })
    maxSizeBytes: string;

    @Column({ type: 'varchar', length: 255 })
    clientFilename: string;

    @Column({
        type: 'enum',
        enum: UploadSessionStatus,
        default: UploadSessionStatus.ISSUED,
    })
    status: UploadSessionStatus;

    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @Column({ type: 'timestamptz', nullable: true })
    uploadedAt: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    confirmedAt: Date | null;

    @Column({ type: 'text', nullable: true })
    failureReason: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}
