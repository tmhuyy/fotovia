import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInUserDto {
    @ApiProperty({
        example: "alex@example.com",
        description: "User email address used to sign in",
    })
    @IsEmail({}, { message: "Enter a valid email address." })
    email: string;

    @ApiProperty({
        example: "your-password",
        description: "User password used to sign in",
    })
    @IsString()
    @IsNotEmpty({ message: "Enter your password." })
    password: string;
}
