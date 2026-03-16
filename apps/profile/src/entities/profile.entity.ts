// import { Moment } from 'moment';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum ProfileRole {
    CLIENT = 'CLIENT',
    PHOTOGRAPHER = 'PHOTOGRAPHER',
}

@Entity('profiles')
export class Profile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid', unique: true })
    userId: string;

    @Column({ type: 'varchar', length: 30, default: ProfileRole.CLIENT })
    role: ProfileRole;

    @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
    fullName: string;

    @Column({ name: 'avatar_url', type: 'text', nullable: true })
    avatarUrl: string;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

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
    pricePerHour: number;

    @Column({ name: 'experience_years', type: 'int', nullable: true })
    experienceYears: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
