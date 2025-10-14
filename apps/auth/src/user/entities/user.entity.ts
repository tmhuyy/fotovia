import { Moment } from 'moment';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { IUser } from '@repo/common';
@Entity()
export class User implements IUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ unique: true })
    email: string;
    @Column()
    password: string;
    @Column({ nullable: true })
    hashedRefreshToken: string | null;

    @Column({ nullable: true, type: 'timestamptz' })
    loggedInAt: Moment;

    @CreateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
