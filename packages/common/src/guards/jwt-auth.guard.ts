import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { map, Observable, tap } from "rxjs";
import { AUTH_SERVICE } from "../constants/services";
import { IUser } from "../interfaces";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy // inject client proxy (object allow us to communicate with the other microservices via the provided transport layer )
    ) {}
    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        
        const jwt = context.switchToHttp().getRequest().cookies?.Authentication;

        if (!jwt) {
            return false;
        }
        return this.authClient
            .send<IUser>("authenticate", { // call message pattern named authenticate in Auth service
                Authentication: jwt, //2nd
            })
            .pipe(
                tap((res) =>
                {
                    //6th
                    /*
                        @UseGuards(JwtStrategyAuthGuard)
                        @MessagePattern('authenticate')
                        async authenticate(
                            @Payload() data: any, // here is the returned data from request + returned result after validate JWT strategy -> is user object
                        ): Promise<User> {
                            return data.user; 
                        } -> res === data.user
                    */
                    context.switchToHttp().getRequest().user = res;
                    console.log(
                        "Send response result to request.user after finishing message pattern named authenticate"
                    );
                }),
                map(() => true)
            );
    }
}
