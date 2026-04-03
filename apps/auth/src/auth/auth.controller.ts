import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Request, Response } from 'express';

import { GetUser } from '@repo/common';
import { CreateUserDto, SignInUserDto } from '@repo/types';

import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { JwtStrategyAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { User } from 'src/user/entities/user.entity';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @UseGuards(JwtStrategyAuthGuard)
    @Get('/me')
    getMe(@GetUser() user: User) {
        return this.authService.getMe(user);
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
    signout(
        @GetUser() user: User,
        @Res({ passthrough: true }) response: Response,
    ) {
        return this.authService.signOut(user, response);
    }

    // rpc transport
    //3rd
    @UseGuards(JwtStrategyAuthGuard)
    @MessagePattern('authenticate')
    async authenticate(@Payload() data: any): Promise<any> {
        return data.user;
    }
}
