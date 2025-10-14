import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { GetUser } from '@repo/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtStrategyAuthGuard } from './guard/jwt-auth.guard';
import { CreateUserDto, SignInUserDto } from '@repo/types';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // http transport
    @UseGuards(JwtStrategyAuthGuard)
    @Get('/me')
    hello(@GetUser() user: User) {
        console.log(user);
        return `Here is ${user.id}`;
    }

    @Post('/signup')
    signUp(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @ApiBody({ type: SignInUserDto })
    signIn(
        @GetUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.signIn(user, response);
    }

    @UseGuards(RefreshAuthGuard)
    @Post('/refresh-token')
    refreshToken(
        @GetUser() user: User,
        @Res({ passthrough: true }) response: Response,
        @Req() request: Request,
    ) {
        return this.authService.refreshToken(user, response, request);
    }

    @UseGuards(JwtStrategyAuthGuard)
    @Post('/signout')
    signout(@GetUser() user: User) {
        return this.authService.signOut(user);
    }

    // rpc transport
    //3rd
    @UseGuards(JwtStrategyAuthGuard)
    @MessagePattern('authenticate')
    async authenticate(
        @Payload() data: any, // here is the returned data from request + returned result after validate JWT strategy -> is user object
    ): Promise<User> {
        //5th
        return data.user; 
    }
}
