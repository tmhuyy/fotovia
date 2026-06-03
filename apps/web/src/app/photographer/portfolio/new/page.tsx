import { AuthenticatedRoute } from "../../../../features/auth/components/authenticated-route";
import { PhotographerPortfolioEditorPage } from "../../../../features/photographer/components/photographer-portfolio-editor-page";

export default function NewPortfolioItemRoute()
{
    return (
        <AuthenticatedRoute>
            <PhotographerPortfolioEditorPage mode="create" />
        </AuthenticatedRoute>
    );
}