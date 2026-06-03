import { AuthenticatedRoute } from "../../../../../features/auth/components/authenticated-route";
import { PhotographerPortfolioEditorPage } from "../../../../../features/photographer/components/photographer-portfolio-editor-page";

interface EditPortfolioItemRouteProps
{
    params: Promise<{
        itemId: string;
    }>;
}

export default async function EditPortfolioItemRoute({
    params,
}: EditPortfolioItemRouteProps)
{
    const { itemId } = await params;

    return (
        <AuthenticatedRoute>
            <PhotographerPortfolioEditorPage mode="edit" itemId={itemId} />
        </AuthenticatedRoute>
    );
}