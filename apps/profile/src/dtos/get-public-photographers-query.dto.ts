import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetPublicPhotographersQueryDto {
    @IsOptional()
    @IsString()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : undefined,
    )
    search?: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) =>
        typeof value === 'string' ? value.trim() : undefined,
    )
    style?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'number') {
            return value;
        }

        if (typeof value === 'string' && value.trim().length > 0) {
            return Number(value);
        }

        return undefined;
    })
    @IsInt()
    @Min(1)
    @Max(24)
    limit?: number;
}
