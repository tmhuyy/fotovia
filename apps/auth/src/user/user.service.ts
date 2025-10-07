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

    async verifyUser(email: string, password: string) {
        const foundUser = await this.checkUser(email, CheckUserTypeEnum.EMAIL);

        const result: boolean = await bcrypt.compare(
            password,
            foundUser.password,
        );

        if (!result)
            throw new UnauthorizedException('Username or Password is wrong');
        return foundUser;
    }

    async signIn(signInUserDto: SignInUserDto) {
        const { email, password } = signInUserDto;

        const foundUser = await this.checkUser(email, CheckUserTypeEnum.EMAIL);

        const result: boolean = await bcrypt.compare(
            password,
            foundUser.password,
        );

        if (!result)
            throw new UnauthorizedException('Username or Password is wrong');

        // const payload = {
        //     email,
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
