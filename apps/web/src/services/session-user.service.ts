import type { AuthUser } from "../types/auth.types";

import { authService } from "./auth.service";
import { profileService } from "./profile.service";

const pickFullName = (authUser: AuthUser, profileUser?: Partial<AuthUser>) => {
    const profileFullName = profileUser?.fullName?.trim();
    if (profileFullName) return profileFullName;

    const authFullName = authUser.fullName?.trim();
    if (authFullName) return authFullName;

    return undefined;
};

export const sessionUserService = {
    async getSessionUser(accessToken?: string): Promise<AuthUser> {
        const authUser = await authService.getCurrentUser(accessToken);

        try {
            const profile = await profileService.getMyProfile(
                authUser.email ?? "",
            );

            return {
                ...authUser,
                email: authUser.email ?? profile.email,
                fullName: pickFullName(authUser, profile),
                role: profile.role ?? authUser.role,
            };
        } catch {
            return authUser;
        }
    },
};
