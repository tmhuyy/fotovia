import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { JwtAuthGuard, GetUser, IUser } from '@repo/common';

import { CreateProfileDto } from './dtos/create-profile.dto';
import { CreateProfileFromAuthDto } from './dtos/create-profile-from-auth.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @UseGuards(JwtAuthGuard)
    @Get('/me')
    @ApiOperation({ summary: 'Get my profile' })
    @ApiOkResponse({
        description: 'Profile fetched successfully',
        type: Profile,
    })
    async getMyProfile(@GetUser() user: IUser): Promise<Profile> {
        return this.profileService.getMyProfile(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/me')
    @ApiOperation({ summary: 'Create a new profile' })
    @ApiCreatedResponse({
        description: 'Profile created successfully',
        type: Profile,
    })
    async createProfile(
        @Body() createProfileDto: CreateProfileDto,
        @GetUser() user: IUser,
    ): Promise<Profile> {
        return this.profileService.createProfile(createProfileDto, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/me')
    @ApiOperation({ summary: 'Update my profile' })
    @ApiOkResponse({
        description: 'Profile updated successfully',
        type: Profile,
    })
    async updateProfile(
        @Body() updateProfileDto: UpdateProfileDto,
        @GetUser() user: IUser,
    ): Promise<Profile> {
        return this.profileService.updateProfile(updateProfileDto, user.id);
    }

    @MessagePattern('profile.create_from_signup')
    async createProfileFromSignup(
        @Payload() payload: CreateProfileFromAuthDto,
    ): Promise<Profile> {
        return this.profileService.createProfileFromSignup(payload);
    }
}
