import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CheckUserTypeEnum, CreateUserDto, SignInUserDto } from '@repo/types';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async createUser(createUserDto: CreateUserDto) {
        return this.userRepository.createUser(createUserDto);
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

    async checkUser(value: string, type: CheckUserTypeEnum) {
        const foundUser = await this.userRepository.findOne({
            where: {
                [type]: value,
            },
        });

        if (!foundUser) throw new NotFoundException('User is not exist');
        return foundUser;
    }

    async save(data: User) {
        const result = await this.userRepository.save(data);
        return result;
    }

    async findOne(filterOption: FindOptionsWhere<User>) {
        const result = await this.userRepository.findOne({
            where: filterOption,
        });

        return result;
    }
}
