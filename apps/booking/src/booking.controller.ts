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
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';

import { GetUser, IUser, JwtAuthGuard } from '@repo/common';

import { BookingService } from './booking.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { UpdateBookingStatusDto } from './dtos/update-booking-status.dto';
import { Booking } from './entities/booking.entity';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

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
