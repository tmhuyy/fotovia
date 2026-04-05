import type { AssetPreview } from "../features/asset/types/asset.types";

const ACCEPTED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

const generateAssetId = () => {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `asset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;

            if (typeof result === "string") {
                resolve(result);
                return;
            }

            reject(new Error("Unable to read this file."));
        };

        reader.onerror = () => {
            reject(new Error("Unable to read this file."));
        };

        reader.readAsDataURL(file);
    });

export const assetService = {
    acceptedImageMimeTypes: ACCEPTED_IMAGE_MIME_TYPES,
    maxImageSizeBytes: MAX_IMAGE_SIZE_BYTES,

    validateImageFile(file?: File | null) {
        if (!file) {
            return {
                isValid: false,
                message: "Please choose an image file first.",
            };
        }

        if (
            !ACCEPTED_IMAGE_MIME_TYPES.includes(
                file.type as (typeof ACCEPTED_IMAGE_MIME_TYPES)[number],
            )
        ) {
            return {
                isValid: false,
                message: "Please use a JPG, PNG, or WEBP image.",
            };
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            return {
                isValid: false,
                message: "Please choose an image smaller than 8MB.",
            };
        }

        return {
            isValid: true,
            message: null,
        };
    },

    async createLocalAssetPreview(file: File): Promise<AssetPreview> {
        const previewUrl = await readFileAsDataUrl(file);

        return {
            id: generateAssetId(),
            source: "local-preview",
            status: "local-ready",
            fileName: file.name,
            mimeType: file.type,
            sizeInBytes: file.size,
            previewUrl,
            createdAt: new Date().toISOString(),
        };
    },

    createSeededAssetPreview({
        previewUrl,
        fileName,
        mimeType = "image/jpeg",
        sizeInBytes = 0,
    }: {
        previewUrl: string;
        fileName: string;
        mimeType?: string;
        sizeInBytes?: number;
    }): AssetPreview {
        return {
            id: generateAssetId(),
            source: "seeded-remote",
            status: "seeded",
            fileName,
            mimeType,
            sizeInBytes,
            previewUrl,
            createdAt: new Date().toISOString(),
        };
    },

    formatFileSize(sizeInBytes: number) {
        if (sizeInBytes <= 0) return "Unknown size";

        const units = ["B", "KB", "MB", "GB"];
        let value = sizeInBytes;
        let unitIndex = 0;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex += 1;
        }

        const rounded =
            value >= 10 || unitIndex === 0
                ? Math.round(value)
                : Number(value.toFixed(1));

        return `${rounded} ${units[unitIndex]}`;
    },
};
