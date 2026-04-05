import { UserRole } from '@repo/types';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid', unique: true })
    userId: string;

    @Column({ type: 'varchar', length: 30, default: UserRole.CLIENT })
    role: UserRole;

    @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
    slug: string | null;

    @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
    fullName: string | null;

    @Column({ name: 'avatar_asset_id', type: 'uuid', nullable: true })
    avatarAssetId: string | null;

    @Column({ name: 'avatar_url', type: 'text', nullable: true })
    avatarUrl: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string | null;

    @Column({ type: 'text', nullable: true })
    bio: string | null;

    @Column('text', {
        array: true,
        nullable: true,
        default: () => 'ARRAY[]::text[]',
    })
    specialties: string[];

    @Column({
        name: 'price_per_hour',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    pricePerHour: number | null;

    @Column({ name: 'experience_years', type: 'int', nullable: true })
    experienceYears: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
