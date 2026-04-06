import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'completed';

@Entity({ name: 'bookings' })
export class Booking {
    @ApiProperty({ format: 'uuid' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ format: 'uuid' })
    @Column({ type: 'uuid' })
    clientUserId: string;

    @ApiProperty({ format: 'uuid' })
    @Column({ type: 'uuid' })
    photographerProfileId: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 255 })
    photographerSlug: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 255 })
    photographerName: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 100 })
    sessionType: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 50 })
    sessionDate: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 50 })
    sessionTime: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 50 })
    duration: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 255 })
    location: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 100 })
    budget: string;

    @ApiProperty()
    @Column({ type: 'varchar', length: 100 })
    contactPreference: string;

    @ApiProperty()
    @Column({ type: 'text' })
    concept: string;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    inspiration: string | null;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @ApiProperty({ example: 'pending' })
    @Column({ type: 'varchar', length: 32, default: 'pending' })
    status: BookingStatus;

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
