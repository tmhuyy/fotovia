import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AssetService } from './asset.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { JwtAuthGuard } from '@repo/common';
import { GetUser, IUser } from '@repo/common';
@Controller('booking')
export class AssetController {
    constructor(private readonly assetService: AssetService) {}

    @UseGuards(JwtAuthGuard) //1st
    @Post()
    createBooking(
        @Body() createBookingDto: CreateBookingDto,
        @GetUser() user: IUser,
    ) {
        return this.assetService.createBooking(createBookingDto, user.id);
    }
}
