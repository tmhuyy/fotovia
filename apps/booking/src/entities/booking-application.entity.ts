import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';

export type BookingApplicationStatus =
    | 'submitted'
    | 'shortlisted'
    | 'selected'
    | 'rejected'
    | 'withdrawn'
    | 'expired';

@Entity({ name: 'booking_applications' })
@Unique('uq_booking_application_photographer', [
    'bookingId',
    'photographerProfileId',
])
@Index('idx_booking_applications_booking_status', ['bookingId', 'status'])
@Index('idx_booking_applications_photographer', [
    'photographerUserId',
    'status',
])
export class BookingApplication {
    @ApiProperty({ format: 'uuid' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ format: 'uuid' })
    @Column({ type: 'uuid' })
    bookingId: string;

    @ApiProperty({ format: 'uuid' })
    @Column({ type: 'uuid' })
    photographerProfileId: string;

    @ApiProperty({ format: 'uuid' })
    @Column({ type: 'uuid' })
    photographerUserId: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 255 })
    photographerName: string;

    @ApiPropertyOptional()
    @Column({ type: 'varchar', length: 255, nullable: true })
    photographerSlug: string | null;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    photographerAvatarUrl: string | null;

    @ApiProperty()
    @Column({ type: 'text' })
    message: string;

    @ApiProperty({ example: 1500000 })
    @Column({ type: 'int' })
    proposedPrice: number;

    @ApiProperty()
    @Column({ type: 'text' })
    includedDeliverables: string;

    @ApiPropertyOptional()
    @Column({ type: 'varchar', length: 50, nullable: true })
    estimatedDuration: string | null;

    @ApiProperty({ example: true })
    @Column({ type: 'boolean', default: true })
    availableOnRequestedDate: boolean;

    @ApiProperty({
        enum: [
            'submitted',
            'shortlisted',
            'selected',
            'rejected',
            'withdrawn',
            'expired',
        ],
    })
    @Column({ type: 'varchar', length: 32, default: 'submitted' })
    status: BookingApplicationStatus;

    @ApiPropertyOptional()
    @Column({ type: 'timestamptz', nullable: true })
    withdrawnAt: Date | null;

    @ApiPropertyOptional()
    @Column({ type: 'timestamptz', nullable: true })
    selectedAt: Date | null;

    @ApiPropertyOptional()
    @Column({ type: 'timestamptz', nullable: true })
    rejectedAt: Date | null;

    @ApiProperty()
    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
