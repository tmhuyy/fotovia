import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { map, Observable, tap } from "rxjs";

import { AUTH_SERVICE } from "../constants/services";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy, // inject client proxy (object allow us to communicate with the other microservices via the provided transport layer )
    ) {}
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        const cookieToken = request.cookies?.Authentication;
        const authorizationHeader = request.headers?.authorization;
        const bearerToken =
            typeof authorizationHeader === "string" &&
            authorizationHeader.startsWith("Bearer ")
                ? authorizationHeader.slice(7).trim()
                : undefined;

        const jwt = cookieToken || bearerToken;

        if (!jwt) {
            return false;
        }

        return this.authClient
            .send("authenticate", { Authentication: jwt })
            .pipe(
                tap((user) => {
                    request.user = user;
                }),
                map(() => true),
            );
    }
}
