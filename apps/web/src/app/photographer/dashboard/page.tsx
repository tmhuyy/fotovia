import { AuthenticatedRoute } from "../../../features/auth/components/authenticated-route";
import { PhotographerDashboardPage } from "../../../features/photographer/components/photographer-dashboard-page";

export default function PhotographerDashboardRoute() {
    return (
        <AuthenticatedRoute>
            <PhotographerDashboardPage />
        </AuthenticatedRoute>
    );
}
