import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { Profile } from './entities/profile.entity';
import { JwtAuthGuard, GetUser, IUser } from '@repo/common';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @UseGuards(JwtAuthGuard) //1st
    @Post("/me")
    @ApiOperation({ summary: 'Create a new profile' })
    @ApiCreatedResponse({
        description: 'Profile created successfully',
        type: Profile,
    })
    async createProfile(
        @Body() createProfileDto: CreateProfileDto,
        @GetUser() user: IUser,
    ): Promise<Profile>
    {
        console.log(`ProfileController---createProfile: ${user}`)
        return this.profileService.createProfile(createProfileDto, user.id);
    }
}
