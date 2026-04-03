import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { FindOptionsWhere } from 'typeorm';

import { CheckUserTypeEnum, CreateUserDto, SignInUserDto } from '@repo/types';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        return this.userRepository.createUser(createUserDto);
    }

    async verifyUser(email: string, password: string): Promise<User> {
        const foundUser = await this.checkUser(email, CheckUserTypeEnum.EMAIL);
        const result: boolean = await bcrypt.compare(
            password,
            foundUser.password,
        );

        if (!result) {
            throw new UnauthorizedException('Username or Password is wrong');
        }

        return foundUser;
    }

    async signIn(signInUserDto: SignInUserDto): Promise<User> {
        const { email, password } = signInUserDto;
        const foundUser = await this.checkUser(email, CheckUserTypeEnum.EMAIL);
        const result: boolean = await bcrypt.compare(password, foundUser.password);

        if (!result) {
            throw new UnauthorizedException('Username or Password is wrong');
        }

        return foundUser;
    }

    async checkUser(value: string, type: CheckUserTypeEnum): Promise<User> {
        const foundUser = await this.userRepository.findOne({
            where: { [type]: value },
        });

        if (!foundUser) {
            throw new NotFoundException('User is not exist');
        }

        return foundUser;
    }

    async save(data: User): Promise<User> {
        return this.userRepository.save(data);
    }

    async findOne(filterOption: FindOptionsWhere<User>): Promise<User | null> {
        return this.userRepository.findOne({
            where: filterOption,
        });
    }

    async deleteById(userId: string): Promise<void> {
        await this.userRepository.deleteUserById(userId);
    }
}
