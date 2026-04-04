import { AuthenticatedRoute } from "../../features/auth/components/authenticated-route";
import { ProfilePage } from "../../features/profile/components/profile-page";

export default function ProfileRoute() {
    return (
        <AuthenticatedRoute>
            <ProfilePage />
        </AuthenticatedRoute>
    );
}
