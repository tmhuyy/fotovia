import { PartialType } from '@nestjs/swagger';

import { CreateProfilePortfolioItemDto } from './create-profile-portfolio-item.dto';

export class UpdateProfilePortfolioItemDto extends PartialType(
    CreateProfilePortfolioItemDto,
) {}
