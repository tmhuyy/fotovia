import {
    Body,
    Controller,
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
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { GetUser, IUser, JwtAuthGuard } from '@repo/common';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { CreateOpenBookingDto } from './dtos/create-open-booking.dto';
import { UpdateBookingStatusDto } from './dtos/update-booking-status.dto';
import { Booking } from './entities/booking.entity';
import { BookingEvent } from './entities/booking-event.entity';
import { CreateBookingApplicationDto } from './dtos/create-booking-application.dto';
import { BookingApplication } from './entities/booking-application.entity';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @UseGuards(JwtAuthGuard)
    @Get('/open/:bookingId/viewer')
    @ApiOperation({
        summary:
            'Get one open booking request detail with current viewer permissions',
    })
    @ApiOkResponse({
        description: 'Open booking viewer detail fetched successfully',
        type: Booking,
    })
    async getOpenBookingDetailForViewer(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @GetUser() user: IUser,
    ): Promise<Booking> {
        return this.bookingService.getOpenBookingDetailForViewer(
            bookingId,
            user.id,
        );
    }

    @Get('/open/:bookingId')
    @ApiOperation({
        summary: 'Get one public open booking request detail',
    })
    @ApiOkResponse({
        description: 'Open booking request detail fetched successfully',
        type: Booking,
    })
    async getOpenBookingDetail(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
    ): Promise<Booking> {
        return this.bookingService.getOpenBookingDetail(bookingId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/open/:bookingId/applications')
    @ApiOperation({
        summary: 'Apply to an open booking request as a photographer',
    })
    @ApiCreatedResponse({
        description: 'Photographer application submitted successfully',
        type: BookingApplication,
    })
    @ApiForbiddenResponse({
        description:
            'Only photographer accounts can apply, and clients cannot apply to their own booking',
    })
    async createOpenBookingApplication(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @Body() createBookingApplicationDto: CreateBookingApplicationDto,
        @GetUser() user: IUser,
    ): Promise<BookingApplication> {
        return this.bookingService.createOpenBookingApplication(
            bookingId,
            createBookingApplicationDto,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('/open/:bookingId/applications/me')
    @ApiOperation({
        summary: 'Get my photographer application for one open booking request',
    })
    @ApiOkResponse({
        description: 'Current photographer application fetched successfully',
        type: BookingApplication,
    })
    async getMyOpenBookingApplication(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @GetUser() user: IUser,
    ): Promise<BookingApplication | null> {
        return this.bookingService.getMyOpenBookingApplication(
            bookingId,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/open/:bookingId/applications/me/withdraw')
    @ApiOperation({
        summary:
            'Withdraw my photographer application from an open booking request',
    })
    @ApiOkResponse({
        description: 'Photographer application withdrawn successfully',
        type: BookingApplication,
    })
    async withdrawMyOpenBookingApplication(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @GetUser() user: IUser,
    ): Promise<BookingApplication> {
        return this.bookingService.withdrawMyOpenBookingApplication(
            bookingId,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/open/:bookingId/applications/me')
    @ApiOperation({
        summary:
            'Update my photographer application for one open booking request',
    })
    @ApiOkResponse({
        description: 'Photographer application updated successfully',
        type: BookingApplication,
    })
    async updateMyOpenBookingApplication(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @Body() updateBookingApplicationDto: CreateBookingApplicationDto,
        @GetUser() user: IUser,
    ): Promise<BookingApplication> {
        return this.bookingService.updateMyOpenBookingApplication(
            bookingId,
            updateBookingApplicationDto,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/client/me/:bookingId/applications/:applicationId/select')
    @ApiOperation({
        summary:
            'Select one photographer application as the main photographer for my open booking',
    })
    @ApiOkResponse({
        description: 'Photographer selected successfully',
        type: Booking,
    })
    async selectMyClientBookingApplication(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
        @GetUser() user: IUser,
    ): Promise<Booking> {
        return this.bookingService.selectMyClientBookingApplication(
            bookingId,
            applicationId,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/client/me/:bookingId/applications/:applicationId/reject')
    @ApiOperation({
        summary: 'Reject one photographer application for my open booking',
    })
    @ApiOkResponse({
        description: 'Photographer application rejected successfully',
        type: BookingApplication,
    })
    async rejectMyClientBookingApplication(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @Param('applicationId', new ParseUUIDPipe()) applicationId: string,
        @GetUser() user: IUser,
    ): Promise<BookingApplication> {
        return this.bookingService.rejectMyClientBookingApplication(
            bookingId,
            applicationId,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('/client/me/:bookingId/applications')
    @ApiOperation({
        summary:
            'Get photographer applications for a booking owned by the current client',
    })
    @ApiOkResponse({
        description: 'Booking applications fetched successfully',
        type: BookingApplication,
        isArray: true,
    })
    async getMyClientBookingApplications(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @GetUser() user: IUser,
    ): Promise<BookingApplication[]> {
        return this.bookingService.getMyClientBookingApplications(
            bookingId,
            user.id,
        );
    }

    @Get('/open')
    @ApiOperation({
        summary:
            'Get public open booking requests that are still waiting for a photographer',
    })
    @ApiOkResponse({
        description: 'Open booking request feed fetched successfully',
        type: Booking,
        isArray: true,
    })
    async getOpenBookingFeed(
        @Query('limit') limit?: string,
    ): Promise<Booking[]> {
        const parsedLimit = Number(limit);
        const safeLimit =
            Number.isFinite(parsedLimit) && parsedLimit > 0
                ? Math.min(parsedLimit, 50)
                : 6;

        return this.bookingService.getOpenBookingFeed(safeLimit);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/open')
    @ApiOperation({
        summary:
            'Create an open booking request before the client chooses a photographer',
    })
    @ApiCreatedResponse({
        description: 'Open booking request created successfully',
        type: Booking,
    })
    async createOpenBooking(
        @Body() createOpenBookingDto: CreateOpenBookingDto,
        @GetUser() user: IUser,
    ): Promise<Booking> {
        return this.bookingService.createOpenBooking(
            createOpenBookingDto,
            user.id,
            user.email,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Create a booking request' })
    @ApiCreatedResponse({
        description: 'Booking request created successfully',
        type: Booking,
    })
    async createBooking(
        @Body() createBookingDto: CreateBookingDto,
        @GetUser() user: IUser,
    ): Promise<Booking> {
        return this.bookingService.createBooking(
            createBookingDto,
            user.id,
            user.email,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get('/client/me')
    @ApiOperation({
        summary: 'Get booking requests created by the current client account',
    })
    @ApiOkResponse({
        description: 'Client booking history fetched successfully',
        type: Booking,
        isArray: true,
    })
    async getMyClientBookings(@GetUser() user: IUser): Promise<Booking[]> {
        return this.bookingService.getMyClientBookings(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/client/me/:bookingId/timeline')
    @ApiOperation({
        summary: 'Get booking activity timeline for the current client',
    })
    @ApiOkResponse({
        description: 'Client booking timeline fetched successfully',
        type: BookingEvent,
        isArray: true,
    })
    async getMyClientBookingTimeline(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @GetUser() user: IUser,
    ): Promise<BookingEvent[]> {
        return this.bookingService.getMyClientBookingTimeline(
            bookingId,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/client/me/:bookingId/cancel')
    @ApiOperation({
        summary: 'Cancel a pending booking request as the current client',
    })
    @ApiOkResponse({
        description: 'Booking request cancelled successfully',
        type: Booking,
    })
    async cancelMyClientBooking(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @GetUser() user: IUser,
    ): Promise<Booking> {
        return this.bookingService.cancelMyClientBooking(bookingId, user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/photographer/me')
    @ApiOperation({
        summary: 'Get incoming booking requests for my photographer account',
    })
    @ApiOkResponse({
        description: 'Photographer booking requests fetched successfully',
        type: Booking,
        isArray: true,
    })
    @ApiForbiddenResponse({
        description: 'Only photographer accounts can access this inbox',
    })
    async getMyPhotographerBookings(
        @GetUser() user: IUser,
    ): Promise<Booking[]> {
        return this.bookingService.getMyPhotographerBookings(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/photographer/me/:bookingId/timeline')
    @ApiOperation({
        summary: 'Get booking activity timeline for the current photographer',
    })
    @ApiOkResponse({
        description: 'Photographer booking timeline fetched successfully',
        type: BookingEvent,
        isArray: true,
    })
    @ApiForbiddenResponse({
        description: 'Only photographer accounts can access this timeline',
    })
    async getMyPhotographerBookingTimeline(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @GetUser() user: IUser,
    ): Promise<BookingEvent[]> {
        return this.bookingService.getMyPhotographerBookingTimeline(
            bookingId,
            user.id,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/photographer/me/:bookingId/status')
    @ApiOperation({
        summary:
            'Update an incoming booking request status as the photographer',
    })
    @ApiOkResponse({
        description: 'Booking request status updated successfully',
        type: Booking,
    })
    @ApiForbiddenResponse({
        description: 'Only photographer accounts can update this inbox',
    })
    async updateMyPhotographerBookingStatus(
        @Param('bookingId', new ParseUUIDPipe()) bookingId: string,
        @Body() updateBookingStatusDto: UpdateBookingStatusDto,
        @GetUser() user: IUser,
    ): Promise<Booking> {
        return this.bookingService.updateMyPhotographerBookingStatus(
            bookingId,
            user.id,
            updateBookingStatusDto,
        );
    }
}
