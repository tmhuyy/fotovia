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
import { CheckUserTypeEnum } from '../enum/check-user.type.enum';

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
            console.log(err.detail);
            throw new BadRequestException(`Sign up Failed`);
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

    async signIn(signInUserDto: SignInUserDto) {
        const { username, password } = signInUserDto;

        const foundUser = await this.checkUser(
            username,
            CheckUserTypeEnum.USERNAME,
        );

        const result: boolean = await bcrypt.compare(
            password,
            foundUser.password,
        );

        if (!result)
            throw new UnauthorizedException('Username or Password is wrong');

        // const payload = {
        //     username,
        //     userId: foundUser.id
        // };
        return foundUser;
    }

    async updateHashedRefreshToken(
        userId: string,
        refreshTokenValue: string | null,
    ) {
        const user = await this.repo.findOne({ where: { id: userId } });
        const updatedUser = { ...user, hashedRefreshToken: refreshTokenValue };
        const result = this.repo.save(updatedUser);
        return result;
    }
}
