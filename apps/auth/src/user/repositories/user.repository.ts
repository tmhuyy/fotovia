import { QueryFailedError, Repository } from 'typeorm';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CheckUserTypeEnum, CreateUserDto } from '@repo/types';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
    private readonly logger = new Logger(UserRepository.name);

    constructor(
        @InjectRepository(User) private readonly repo: Repository<User>,
    ) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const { email, password, role } = createUserDto;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const user = this.repo.create({
                email,
                password: hashedPassword,
                role,
            });

            return await this.repo.save(user);
        } catch (err) {
            if (
                err instanceof QueryFailedError &&
                (err as any).code === '23505'
            ) {
                this.logger.error('Duplicate email error', err.stack);
                throw new ConflictException('Email already exists');
            }

            throw new BadRequestException('Sign up failed');
        }
    }

    async checkUser(value: string, type: CheckUserTypeEnum): Promise<User> {
        const foundUser = await this.repo.findOne({
            where: { [type]: value },
        });

        if (!foundUser) {
            throw new NotFoundException('User does not exist');
        }

        return foundUser;
    }

    async deleteUserById(userId: string): Promise<void> {
        await this.repo.delete({ id: userId });
    }
}
