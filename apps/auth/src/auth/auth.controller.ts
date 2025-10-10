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
import { GetUser } from './decorator/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { CreateUserDto, SignInUserDto } from '@repo/types';
import { User } from 'src/user/entities/user.entity';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Request, Response } from 'express';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(JwtAuthGuard)
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

    @UseGuards(JwtAuthGuard)
    @Post('/signout')
    signout(@GetUser() user: User) {
        return this.authService.signOut(user);
    }
}
