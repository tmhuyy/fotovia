import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { GetUser, IUser, JwtAuthGuard } from '@repo/common';

import { AssetService } from './asset.service';
import { AttachAssetUsageDto } from './dtos/attach-asset-usage.dto';
import { ConfirmUploadSessionDto } from './dtos/confirm-upload-session.dto';
import { CreateUploadSessionDto } from './dtos/create-upload-session.dto';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @UseGuards(JwtAuthGuard)
    @Post('upload-sessions')
    @ApiOperation({ summary: 'Create an asset upload session' })
    @ApiCreatedResponse({
        description: 'Asset upload session created successfully',
    })
    async createUploadSession(
        @Body() createUploadSessionDto: CreateUploadSessionDto,
        @GetUser() user: IUser,
    ) {
        return this.assetService.createUploadSession(
            createUploadSessionDto,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('upload-sessions/:sessionId/confirm')
    @ApiOperation({ summary: 'Confirm a completed asset upload session' })
    @ApiOkResponse({
        description: 'Asset upload session confirmed successfully',
    })
    async confirmUploadSession(
        @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
        @Body() confirmUploadSessionDto: ConfirmUploadSessionDto,
        @GetUser() user: IUser,
    ) {
        return this.assetService.confirmUploadSession(
            sessionId,
            confirmUploadSessionDto,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('usages/attach')
    @ApiOperation({
        summary: 'Attach an asset to a business entity usage slot',
    })
    @ApiCreatedResponse({
        description: 'Asset usage attached successfully',
    })
    async attachUsage(
        @Body() attachAssetUsageDto: AttachAssetUsageDto,
        @GetUser() user: IUser,
    ) {
        return this.assetService.attachUsage(attachAssetUsageDto, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('usages/:usageId/detach')
    @ApiOperation({ summary: 'Detach an existing asset usage' })
    @ApiOkResponse({
        description: 'Asset usage detached successfully',
    })
    async detachUsage(
        @Param('usageId', new ParseUUIDPipe()) usageId: string,
        @GetUser() user: IUser,
    ) {
        return this.assetService.detachUsage(usageId, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':assetId/read-url')
    @ApiOperation({
        summary: 'Get a public URL or signed read URL for an asset',
    })
    @ApiOkResponse({
        description: 'Asset read URL generated successfully',
    })
    async getReadUrl(
        @Param('assetId', new ParseUUIDPipe()) assetId: string,
        @GetUser() user: IUser,
    ) {
        return this.assetService.getReadUrl(assetId, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':assetId/usages')
    @ApiOperation({ summary: 'Get active usages for an asset' })
    @ApiOkResponse({
        description: 'Asset usages fetched successfully',
    })
    async getAssetUsages(
        @Param('assetId', new ParseUUIDPipe()) assetId: string,
        @GetUser() user: IUser,
    ) {
        return this.assetService.getAssetUsages(assetId, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':assetId')
    @ApiOperation({ summary: 'Get asset metadata by id' })
    @ApiOkResponse({
        description: 'Asset fetched successfully',
    })
    async getAsset(
        @Param('assetId', new ParseUUIDPipe()) assetId: string,
        @GetUser() user: IUser,
    ) {
        return this.assetService.getAsset(assetId, user.id);
    }
}
