import { AuthenticatedRoute } from "../../../features/auth/components/authenticated-route";
import { PhotographerPortfolioPage } from "../../../features/photographer/components/photographer-portfolio-page";

export default function PhotographerPortfolioRoute() {
    return (
        <AuthenticatedRoute>
            <PhotographerPortfolioPage />
        </AuthenticatedRoute>
    );
}
