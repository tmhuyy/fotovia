import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateProfileAvatarDto {
    @ApiProperty({
        format: 'uuid',
        example: '5fa9cc8c-e71c-4746-b427-da36b06030e2',
        description: 'A READY avatar asset that belongs to the signed-in user.',
    })
    @IsUUID()
    assetId: string;
}
