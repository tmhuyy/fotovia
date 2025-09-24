import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from '../dtos/signin-user.dto';
import { AccessToken } from '../interface/access-token.interface';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository extends Repository<User> {
    // constructor(private dataSource: DataSource) {
    //   super(User, dataSource.createEntityManager());
    // }

    constructor(@InjectRepository(User) private repo: Repository<User>) {
        super(repo.target, repo.manager, repo.queryRunner);
    }

    async createUser(createUserDto: CreateUserDto) {
        const { username, password } = createUserDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        try {
            const user = this.repo.create({
                username,
                password: hashedPassword,
            });

            await this.repo.save(user);
        } catch (err) {
            throw new BadRequestException(`Sign up Failed`);
        }
    }

    async checkUser(username: string) {
        const foundUser = await this.repo.findOne({
            where: {
                username,
            },
        });

        if (!foundUser) throw new NotFoundException('User is not exist');
        return foundUser
    }

    async signIn(signInUserDto: SignInUserDto): Promise<AccessToken> {
        const { username, password } = signInUserDto;

        const foundUser = await this.checkUser(username)

        const result: boolean = await bcrypt.compare(
            password,
            foundUser.password,
        );

        if (!result)
            throw new UnauthorizedException('Username or Password is wrong');

        const payload = {
            username
        };
        return payload;
    }

}
