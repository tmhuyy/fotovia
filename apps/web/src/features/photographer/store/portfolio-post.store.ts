import { create } from "zustand";

import {
    assetService,
    type AssetPurpose,
} from "../../../services/asset.service";
import { photographerService } from "../../../services/photographer.service";
import type { AssetPreview } from "../../asset/types/asset.types";
import type {
    PhotographerPortfolioItem,
    PortfolioItemDraft,
    PortfolioItemMutationPayload,
} from "../types/portfolio.types";

export type PortfolioPostJobStatus =
    | "uploading"
    | "saving"
    | "completed"
    | "failed";

export interface PortfolioPostJob {
    id: string;
    operation: "create" | "update";
    title: string;
    authorName: string;
    status: PortfolioPostJobStatus;
    progress: number;
    message: string;
    createdItem?: PhotographerPortfolioItem;
    error?: string;
}

interface StartCreatePortfolioPostInput {
    draft: PortfolioItemDraft;
    authorName: string;
}

interface StartUpdatePortfolioPostInput {
    itemId: string;
    draft: PortfolioItemDraft;
    authorName: string;
}

interface PortfolioPostState {
    activeJob: PortfolioPostJob | null;
    startCreatePortfolioPost: (input: StartCreatePortfolioPostInput) => void;
    startUpdatePortfolioPost: (input: StartUpdatePortfolioPostInput) => void;
    clearPortfolioPostJob: () => void;
}

type SetPortfolioPostState = (
    partial:
        | Partial<PortfolioPostState>
        | ((state: PortfolioPostState) => Partial<PortfolioPostState>),
) => void;

const createJobId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `portfolio-post-${Date.now()}`;
};

const updateActiveJob = (
    set: SetPortfolioPostState,
    jobId: string,
    patch: Partial<PortfolioPostJob>,
) => {
    set((state) => {
        if (state.activeJob?.id !== jobId) {
            return {};
        }

        return {
            activeJob: {
                ...state.activeJob,
                ...patch,
            },
        };
    });
};

const resolveUploadedAssetId = async (
    asset: AssetPreview | null,
    purpose: AssetPurpose,
    metadataSource: string,
) => {
    if (!asset) {
        throw new Error(
            "Please upload an image before saving this portfolio item.",
        );
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
): Promise<PortfolioItemMutationPayload> => {
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

export const usePortfolioPostStore = create<PortfolioPostState>((set) => ({
    activeJob: null,

    startCreatePortfolioPost: ({ draft, authorName }) => {
        const jobId = createJobId();
        const normalizedTitle = draft.title.trim() || "Untitled collection";

        set({
            activeJob: {
                id: jobId,
                operation: "create",
                title: normalizedTitle,
                authorName,
                status: "uploading",
                progress: 12,
                message: `Preparing ${normalizedTitle} for ${authorName}...`,
            },
        });

        void (async () => {
            try {
                updateActiveJob(set, jobId, {
                    status: "uploading",
                    progress: 28,
                    message: `Uploading images for ${normalizedTitle}...`,
                });

                const payload = await buildPortfolioMutationPayload(draft);

                updateActiveJob(set, jobId, {
                    status: "saving",
                    progress: 76,
                    message: `Posting to ${authorName}...`,
                });

                const createdItem =
                    await photographerService.createMyPortfolioItem(payload);

                updateActiveJob(set, jobId, {
                    status: "completed",
                    progress: 100,
                    message: `Posted to ${authorName}. Opening collection...`,
                    createdItem,
                });
            } catch (error) {
                updateActiveJob(set, jobId, {
                    status: "failed",
                    progress: 100,
                    message: "We couldn’t post this portfolio collection.",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Please try again in a moment.",
                });
            }
        })();
    },

    startUpdatePortfolioPost: ({ itemId, draft, authorName }) => {
        const jobId = createJobId();
        const normalizedTitle = draft.title.trim() || "Untitled collection";

        set({
            activeJob: {
                id: jobId,
                operation: "update",
                title: normalizedTitle,
                authorName,
                status: "uploading",
                progress: 12,
                message: `Preparing updates for ${normalizedTitle}...`,
            },
        });

        void (async () => {
            try {
                updateActiveJob(set, jobId, {
                    status: "uploading",
                    progress: 32,
                    message: `Uploading updated images for ${normalizedTitle}...`,
                });

                const payload = await buildPortfolioMutationPayload(draft);

                updateActiveJob(set, jobId, {
                    status: "saving",
                    progress: 78,
                    message: `Updating collection for ${authorName}...`,
                });

                const updatedItem =
                    await photographerService.updateMyPortfolioItem(
                        itemId,
                        payload,
                    );

                updateActiveJob(set, jobId, {
                    status: "completed",
                    progress: 100,
                    message: `Updated ${normalizedTitle}. Opening collection...`,
                    createdItem: updatedItem,
                });
            } catch (error) {
                updateActiveJob(set, jobId, {
                    status: "failed",
                    progress: 100,
                    message: "We couldn’t update this portfolio collection.",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Please try again in a moment.",
                });
            }
        })();
    },

    clearPortfolioPostJob: () => {
        set({
            activeJob: null,
        });
    },
}));
