import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from "class-validator";
import { UserRole } from "../enum";

export class CreateUserDto {
    @ApiProperty({ example: "huy@example.com" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "StrongPass1!" })
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Password is too weak",
    })
    password: string;

    @ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
    @IsEnum(UserRole)
    role: UserRole;

    @ApiProperty({ example: "Huy Tran" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    fullName: string;
}
