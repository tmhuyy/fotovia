import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { SignInUserDto } from './dtos/signin-user.dto';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // @UseGuards(JwtAuthGuard)
    // @Get('/protected')
    // hello(@GetUser() user: User) {
    //     console.log(user);
    //     return `Here is ${user.id}`;
    // }

    @Post('/signup')
    signUp(@Body() createUserDto: CreateUserDto) {
        return this.authService.signUp(createUserDto);
    }

    @Post('/signin')
    signIn(@Body() signInUserDto: SignInUserDto) {
        return this.authService.signIn(signInUserDto);
    }

    @UseGuards(RefreshAuthGuard)
    @Post('/refresh-token')
    refreshToken(@GetUser() user: User, @Body("refresh_token") refresh_token: string) {
        return this.authService.refreshToken(user, refresh_token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/signout')
    signout(@GetUser() user: User) {
        return this.authService.signOut(user);
    }
}
