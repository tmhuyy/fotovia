"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Badge } from "../../../components/ui/badge";
import { Button, buttonVariants } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import
    {
        assetService,
        type AssetPurpose,
    } from "../../../services/asset.service";
import { photographerService } from "../../../services/photographer.service";
import { useAuthStore } from "../../../store/auth.store";
import type { AssetPreview } from "../../asset/types/asset.types";
import type {
    PhotographerPortfolioItem,
    PortfolioItemDraft,
    PortfolioItemMutationPayload,
} from "../types/portfolio.types";
import { PortfolioItemForm } from "./portfolio-item-form";

interface PhotographerPortfolioEditorPageProps
{
    mode: "create" | "edit";
    itemId?: string;
}

const sortPortfolioItems = (items: PhotographerPortfolioItem[]) =>
{
    return [...items].sort((a, b) =>
    {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();

        if (timeA !== timeB) {
            return timeB - timeA;
        }

        return b.sortOrder - a.sortOrder;
    });
};

const isClassificationInFlight = (item: PhotographerPortfolioItem) =>
{
    return (
        item.classificationStatus === "queued" ||
        item.classificationStatus === "processing"
    );
};

const mapItemToDraft = (
    item: PhotographerPortfolioItem | null,
): PortfolioItemDraft | undefined =>
{
    if (!item) {
        return undefined;
    }

    return {
        title: item.title,
        description: item.description,
        coverAsset: item.coverAsset,
        galleryAssets: item.galleryAssets,
        isFeatured: item.isFeatured,
    };
};

const buildSaveSuccessDescription = (
    item: PhotographerPortfolioItem,
    mode: "create" | "update",
) =>
{
    const actionLabel = mode === "create" ? "saved" : "updated";

    if (isClassificationInFlight(item)) {
        return `Your portfolio item was ${actionLabel}, and Fotovia is now detecting the style automatically.`;
    }

    return `Your portfolio item was ${actionLabel} successfully.`;
};

const resolveUploadedAssetId = async (
    asset: AssetPreview | null,
    purpose: AssetPurpose,
    metadataSource: string,
) =>
{
    if (!asset) {
        throw new Error("Please upload an image before saving this portfolio item.");
    }

    if (asset.source === "uploaded-remote" && asset.assetId) {
        return asset.assetId;
    }

    if (!asset.file) {
        throw new Error("Please choose the image again before saving.");
    }

    const uploadSession = await assetService.createUploadSession({
        purpose,
        visibility: "PUBLIC",
        resourceType: "IMAGE",
        originalFilename: asset.file.name,
        mimeType: asset.file.type,
        sizeBytes: asset.file.size,
    });

    await assetService.uploadToSignedUrl({
        bucketName: uploadSession.asset.bucketName,
        path: uploadSession.uploadData.path,
        token: uploadSession.uploadData.token,
        signedUrl: uploadSession.uploadData.signedUrl,
        file: asset.file,
        contentType: asset.file.type,
    });

    const confirmedUpload = await assetService.confirmUploadSession(
        uploadSession.uploadSession.id,
        {
            metadataJson: {
                source: metadataSource,
                originalFilename: asset.file.name,
                originalSizeInBytes: asset.originalSizeInBytes,
            },
        },
    );

    return confirmedUpload.asset.id;
};

const buildPortfolioMutationPayload = async (
    draft: PortfolioItemDraft,
): Promise<PortfolioItemMutationPayload> =>
{
    return {
        title: draft.title.trim(),
        description: draft.description.trim(),
        isFeatured: draft.isFeatured,
        coverAssetId: await resolveUploadedAssetId(
            draft.coverAsset,
            "PORTFOLIO_COVER",
            "web-portfolio-cover-upload",
        ),
        galleryAssetIds: await Promise.all(
            draft.galleryAssets.map((galleryAsset) =>
                resolveUploadedAssetId(
                    galleryAsset,
                    "PORTFOLIO_IMAGE",
                    "web-portfolio-gallery-upload",
                ),
            ),
        ),
    };
};

const PortfolioEditorSkeleton = () =>
{
    return (
        <>
            <Navbar />
            <main className="pb-16 pt-10">
                <Container className="space-y-8">
                    <div className="space-y-4">
                        <div className="h-5 w-40 animate-pulse rounded bg-border/60" />
                        <div className="h-12 w-[32rem] max-w-full animate-pulse rounded bg-border/60" />
                        <div className="h-6 w-[40rem] max-w-full animate-pulse rounded bg-border/50" />
                    </div>

                    <div className="h-[40rem] animate-pulse rounded-[2rem] border border-border bg-surface/60" />
                </Container>
            </main>
            <Footer />
        </>
    );
};

export const PhotographerPortfolioEditorPage = ({
    mode,
    itemId,
}: PhotographerPortfolioEditorPageProps) =>
{
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isAuthenticated, isHydrating, hasHydrated } = useAuthStore();

    const isEditMode = mode === "edit";
    const isPhotographer = user?.role === "photographer";
    const queryKey = ["my-photographer-portfolio", user?.id ?? "anonymous"] as const;

    const portfolioQuery = useQuery({
        queryKey,
        queryFn: () => photographerService.getMyPortfolioItems(),
        enabled:
            hasHydrated &&
            !isHydrating &&
            isAuthenticated &&
            isPhotographer &&
            isEditMode,
        retry: false,
    });

    const editingItem = useMemo(() =>
    {
        if (!isEditMode || !itemId) {
            return null;
        }

        return (
            (portfolioQuery.data ?? []).find((item) => item.id === itemId) ?? null
        );
    }, [isEditMode, itemId, portfolioQuery.data]);

    const createPortfolioItemMutation = useMutation({
        mutationFn: async (draft: PortfolioItemDraft) =>
        {
            const payload = await buildPortfolioMutationPayload(draft);
            return photographerService.createMyPortfolioItem(payload);
        },
        onSuccess: (createdItem) =>
        {
            queryClient.setQueryData<PhotographerPortfolioItem[]>(
                queryKey,
                (current) => sortPortfolioItems([createdItem, ...(current ?? [])]),
            );

            toast.success("Portfolio item saved", {
                description: buildSaveSuccessDescription(createdItem, "create"),
            });

            router.push("/photographer/portfolio");
        },
        onError: () =>
        {
            toast.error("We couldn’t save this portfolio item", {
                description: "Please try again after checking the selected images.",
            });
        },
    });

    const updatePortfolioItemMutation = useMutation({
        mutationFn: async (draft: PortfolioItemDraft) =>
        {
            if (!itemId) {
                throw new Error("Missing portfolio item id.");
            }

            const payload = await buildPortfolioMutationPayload(draft);
            return photographerService.updateMyPortfolioItem(itemId, payload);
        },
        onSuccess: (updatedItem) =>
        {
            queryClient.setQueryData<PhotographerPortfolioItem[]>(
                queryKey,
                (current) =>
                    sortPortfolioItems(
                        (current ?? []).map((item) =>
                            item.id === updatedItem.id ? updatedItem : item,
                        ),
                    ),
            );

            toast.success("Portfolio item updated", {
                description: buildSaveSuccessDescription(updatedItem, "update"),
            });

            router.push("/photographer/portfolio");
        },
        onError: () =>
        {
            toast.error("We couldn’t update this portfolio item", {
                description: "Please try again in a moment.",
            });
        },
    });

    if (!hasHydrated || isHydrating) {
        return <PortfolioEditorSkeleton />;
    }

    if (!isAuthenticated) {
        return (
            <>
                <Navbar />
                <main className="pb-16 pt-10">
                    <Container>
                        <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                            <CardContent className="space-y-4 p-8">
                                <h1 className="font-serif text-3xl text-foreground">
                                    Portfolio access requires sign-in
                                </h1>
                                <p className="text-sm leading-6 text-muted">
                                    Sign in with a photographer account to manage saved portfolio
                                    works.
                                </p>
                            </CardContent>
                        </Card>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    if (!isPhotographer) {
        return (
            <>
                <Navbar />
                <main className="pb-16 pt-10">
                    <Container>
                        <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                            <CardContent className="space-y-6 p-8">
                                <Badge variant="neutral">Portfolio access</Badge>

                                <div className="space-y-2">
                                    <h1 className="font-serif text-3xl text-foreground">
                                        This portfolio workspace is reserved for photographer
                                        accounts.
                                    </h1>

                                    <p className="text-sm leading-7 text-muted">
                                        Your account is signed in, but this route is meant for
                                        photographer-side portfolio setup.
                                    </p>
                                </div>

                                <Link
                                    href="/"
                                    className={buttonVariants({
                                        size: "lg",
                                        className: "rounded-full",
                                    })}
                                >
                                    Back to homepage
                                </Link>
                            </CardContent>
                        </Card>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    if (isEditMode && portfolioQuery.isLoading) {
        return <PortfolioEditorSkeleton />;
    }

    if (isEditMode && (portfolioQuery.isError || !editingItem)) {
        return (
            <>
                <Navbar />
                <main className="pb-16 pt-10">
                    <Container>
                        <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
                            <CardContent className="space-y-6 p-8">
                                <Badge variant="neutral">Portfolio item</Badge>

                                <div className="space-y-2">
                                    <h1 className="font-serif text-3xl text-foreground">
                                        We couldn’t find this portfolio item
                                    </h1>

                                    <p className="text-sm leading-7 text-muted">
                                        It may have been deleted, or the portfolio data could not be
                                        loaded right now.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/photographer/portfolio"
                                        className={buttonVariants({
                                            size: "lg",
                                            className: "rounded-full",
                                        })}
                                    >
                                        Back to portfolio
                                    </Link>

                                    <Button
                                        type="button"
                                        size="lg"
                                        variant="secondary"
                                        className="rounded-full"
                                        onClick={() => portfolioQuery.refetch()}
                                    >
                                        Try again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Container>
                </main>
                <Footer />
            </>
        );
    }

    const isSubmitting = isEditMode
        ? updatePortfolioItemMutation.isPending
        : createPortfolioItemMutation.isPending;

    return (
        <>
            <Navbar />

            <main className="pb-16 pt-10">
                <Container className="space-y-8">
                    <div className="space-y-5">
                        <Link
                            href="/photographer/portfolio"
                            className="inline-flex text-sm font-medium text-muted transition hover:text-foreground"
                        >
                            ← Back to portfolio
                        </Link>

                        <div className="space-y-4">
                            <Badge variant="ai">
                                {isEditMode ? "Edit AI portfolio item" : "New AI portfolio item"}
                            </Badge>

                            <div className="space-y-3">
                                <h1 className="max-w-4xl font-serif text-4xl text-foreground sm:text-5xl">
                                    {isEditMode
                                        ? "Update this portfolio collection."
                                        : "Create a new portfolio collection."}
                                </h1>

                                <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
                                    Keep the editing flow separate from the gallery so the main
                                    portfolio page can stay focused on visual collections and AI
                                    classification results.
                                </p>
                            </div>
                        </div>
                    </div>

                    <PortfolioItemForm
                        mode={isEditMode ? "edit" : "create"}
                        initialValue={mapItemToDraft(editingItem)}
                        isSubmitting={isSubmitting}
                        onCancel={() => router.push("/photographer/portfolio")}
                        onSubmit={async (draft) =>
                        {
                            if (isEditMode) {
                                await updatePortfolioItemMutation.mutateAsync(draft);
                                return;
                            }

                            await createPortfolioItemMutation.mutateAsync(draft);
                        }}
                    />
                </Container>
            </main>

            <Footer />
        </>
    );
};