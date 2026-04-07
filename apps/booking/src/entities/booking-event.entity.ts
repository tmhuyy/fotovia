import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

export type BookingEventType =
    | 'created'
    | 'confirmed'
    | 'declined'
    | 'cancelled'
    | 'completed';

export type BookingEventActorRole = 'client' | 'photographer' | 'system';

@Entity({ name: 'booking_events' })
export class BookingEvent {
    @ApiProperty({ format: 'uuid' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ format: 'uuid' })
    @Column({ type: 'uuid' })
    bookingId: string;

    @ApiProperty({
        enum: ['created', 'confirmed', 'declined', 'cancelled', 'completed'],
    })
    @Column({ type: 'varchar', length: 40 })
    eventType: BookingEventType;

    @ApiProperty({
        enum: ['client', 'photographer', 'system'],
    })
    @Column({ type: 'varchar', length: 30 })
    actorRole: BookingEventActorRole;

    @ApiPropertyOptional({ format: 'uuid' })
    @Column({ type: 'uuid', nullable: true })
    actorUserId: string | null;

    @ApiProperty()
    @Column({ type: 'varchar', length: 255 })
    actorLabel: string;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    note: string | null;

    @ApiProperty()
    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;
}
