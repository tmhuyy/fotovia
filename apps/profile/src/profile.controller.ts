import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetUser, IUser, JwtAuthGuard } from '@repo/common';

import { PortfolioItemClassificationRetryService } from './portfolio-item-classification-retry.service';
import { CreateProfileFromAuthDto } from './dtos/create-profile-from-auth.dto';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { CreateProfilePortfolioItemDto } from './dtos/create-profile-portfolio-item.dto';
import { GetPublicPhotographersQueryDto } from './dtos/get-public-photographers-query.dto';
import { UpdateProfileAvatarDto } from './dtos/update-profile-avatar.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { UpdateProfilePortfolioItemDto } from './dtos/update-profile-portfolio-item.dto';
import { ProfilePortfolioItem } from './entities/profile-portfolio-item.entity';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService,
        private readonly portfolioItemClassificationRetryService: PortfolioItemClassificationRetryService,
    ) {}

    @Get('/public/photographers')
    @ApiOperation({ summary: 'Get public photographer summaries' })
    @ApiOkResponse({
        description: 'Public photographers fetched successfully',
    })
    async getPublicPhotographers(
        @Query() query: GetPublicPhotographersQueryDto,
    ): Promise<Record<string, unknown>[]> {
        return this.profileService.getPublicPhotographers(query);
    }

    @Get('/public/photographers/:slug')
    @ApiOperation({ summary: 'Get public photographer detail by slug' })
    @ApiOkResponse({
        description: 'Public photographer detail fetched successfully',
    })
    async getPublicPhotographerBySlug(
        @Param('slug') slug: string,
    ): Promise<Record<string, unknown>> {
        return this.profileService.getPublicPhotographerBySlug(slug);
    }

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

    @UseGuards(JwtAuthGuard)
    @Patch('/me/avatar')
    @ApiOperation({ summary: 'Set my avatar from an uploaded asset' })
    @ApiOkResponse({
        description: 'Profile avatar updated successfully',
        type: Profile,
    })
    async updateMyAvatar(
        @Body() updateProfileAvatarDto: UpdateProfileAvatarDto,
        @GetUser() user: IUser,
    ): Promise<Profile> {
        return this.profileService.updateMyAvatar(
            updateProfileAvatarDto,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('/me/portfolio-items')
    @ApiOperation({ summary: 'Get my photographer portfolio items' })
    @ApiOkResponse({
        description: 'Portfolio items fetched successfully',
        type: ProfilePortfolioItem,
        isArray: true,
    })
    async getMyPortfolioItems(
        @GetUser() user: IUser,
    ): Promise<ProfilePortfolioItem[]> {
        return this.profileService.getMyPortfolioItems(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/me/portfolio-items')
    @ApiOperation({ summary: 'Create a new photographer portfolio item' })
    @ApiCreatedResponse({
        description: 'Portfolio item created successfully',
        type: ProfilePortfolioItem,
    })
    async createMyPortfolioItem(
        @Body() createProfilePortfolioItemDto: CreateProfilePortfolioItemDto,
        @GetUser() user: IUser,
    ): Promise<ProfilePortfolioItem> {
        return this.profileService.createMyPortfolioItem(
            createProfilePortfolioItemDto,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/me/portfolio-items/:itemId')
    @ApiOperation({ summary: 'Update a photographer portfolio item' })
    @ApiOkResponse({
        description: 'Portfolio item updated successfully',
        type: ProfilePortfolioItem,
    })
    async updateMyPortfolioItem(
        @Param('itemId', new ParseUUIDPipe()) itemId: string,
        @Body() updateProfilePortfolioItemDto: UpdateProfilePortfolioItemDto,
        @GetUser() user: IUser,
    ): Promise<ProfilePortfolioItem> {
        return this.profileService.updateMyPortfolioItem(
            itemId,
            updateProfilePortfolioItemDto,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('/me/portfolio-items/:itemId/retry-classification')
    @ApiOperation({ summary: 'Retry AI classification for a portfolio item' })
    @ApiOkResponse({
        description: 'Portfolio item classification requeued successfully',
        type: ProfilePortfolioItem,
    })
    async retryMyPortfolioItemClassification(
        @Param('itemId', new ParseUUIDPipe()) itemId: string,
        @GetUser() user: IUser,
    ): Promise<ProfilePortfolioItem> {
        return this.portfolioItemClassificationRetryService.retryMyPortfolioItemClassification(
            itemId,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/me/portfolio-items/:itemId')
    @ApiOperation({ summary: 'Delete a photographer portfolio item' })
    @ApiOkResponse({
        description: 'Portfolio item deleted successfully',
    })
    async deleteMyPortfolioItem(
        @Param('itemId', new ParseUUIDPipe()) itemId: string,
        @GetUser() user: IUser,
    ): Promise<{ deleted: true }> {
        return this.profileService.deleteMyPortfolioItem(itemId, user.id);
    }

    @MessagePattern('profile.create_from_signup')
    async createProfileFromSignup(
        @Payload() payload: CreateProfileFromAuthDto,
    ): Promise<Profile> {
        return this.profileService.createProfileFromSignup(payload);
    }
}
