import { PickType } from '@nestjs/swagger';

import { CreateOpenBookingDto } from './create-open-booking.dto';

export class UpdateOpenBookingDto extends PickType(CreateOpenBookingDto, [
    'title',
    'shootType',
    'sessionType',
    'sessionDate',
    'sessionTime',
    'duration',
    'location',
    'budget',
    'contactPreference',
    'concept',
    'inspiration',
    'notes',
] as const) {}
