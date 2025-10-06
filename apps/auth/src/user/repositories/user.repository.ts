import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, SignInUserDto } from '@repo/types';
import { InjectRepository } from '@nestjs/typeorm';
import { CheckUserTypeEnum } from '@repo/types';
import { QueryFailedError } from 'typeorm';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserRepository extends Repository<User> {
    // constructor(private dataSource: DataSource) {
    //   super(User, dataSource.createEntityManager());
    // }
    private readonly logger = new Logger(UserRepository.name);

    constructor(@InjectRepository(User) private repo: Repository<User>) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async createUser(createUserDto: CreateUserDto) {
        const { email, password } = createUserDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const user = this.repo.create({
                email,
                password: hashedPassword,
            });

            await this.repo.save(user);
        } catch (err) {
            if (err instanceof QueryFailedError) {
                // Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
                if ((err as any).code === '23505') {
                    this.logger.error('Duplicate email error', err.stack);

                    throw new ConflictException('Username already exists');
                }
            }
            throw new BadRequestException(`Sign up failed`);
        }
    }

    async checkUser(value: string, type: CheckUserTypeEnum) {
        const foundUser = await this.repo.findOne({
            where: {
                [type]: value,
            },
        });

        if (!foundUser) throw new NotFoundException('User is not exist');
        return foundUser;
    }

    // async signIn(signInUserDto: SignInUserDto) {
    //     const { email, password } = signInUserDto;

    //     const foundUser = await this.checkUser(
    //         email,
    //         CheckUserTypeEnum.USERNAME,
    //     );

    //     const result: boolean = await bcrypt.compare(
    //         password,
    //         foundUser.password,
    //     );

    //     if (!result)
    //         throw new UnauthorizedException('Username or Password is wrong');

    //     // const payload = {
    //     //     email,
    //     //     userId: foundUser.id
    //     // };
    //     return foundUser;
    // }
}
