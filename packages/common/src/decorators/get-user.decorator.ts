import { IUser } from "./../interfaces/user.interface";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): IUser => {
        const req = ctx.switchToHttp().getRequest();
        return req.user;
        // in request body, get user params
    }
);
