import type { AssetPreview } from "../features/asset/types/asset.types";
import { assetClient } from "./api/axios";
import { unwrapResponse } from "./api/response";
import type { ApiResponse } from "./api/types";

const ACCEPTED_IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
] as const;

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

type AnyRecord = Record<string, unknown>;

export type AssetPurpose = "AVATAR" | "PORTFOLIO_IMAGE" | "PORTFOLIO_COVER";
export type AssetVisibility = "PUBLIC" | "PRIVATE";
export type AssetResourceType = "IMAGE" | "VIDEO" | "DOCUMENT";
export type ImageCompressionTarget =
    | "avatar"
    | "portfolio-cover"
    | "portfolio-gallery";

export interface CreateUploadSessionPayload {
    purpose: AssetPurpose;
    visibility?: AssetVisibility;
    resourceType?: AssetResourceType;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
}

export interface ConfirmUploadSessionPayload {
    checksumSha256?: string;
    width?: number;
    height?: number;
    durationMs?: number;
    metadataJson?: Record<string, unknown>;
}

export interface AssetUploadData {
    path: string;
    token: string;
    signedUrl?: string | null;
}

export interface AssetRecord {
    id: string;
    bucketName: string;
    objectKey: string;
    purpose: string;
    visibility: string;
    status: string;
    originalFilename: string | null;
    mimeType: string | null;
    sizeBytes: number | null;
}

export interface AssetUploadSessionRecord {
    id: string;
    assetId: string;
    status: string;
}

export interface CreateUploadSessionResult {
    asset: AssetRecord;
    uploadSession: AssetUploadSessionRecord;
    uploadData: AssetUploadData;
}

export interface ConfirmUploadSessionResult {
    asset: AssetRecord;
    uploadSession: AssetUploadSessionRecord;
}

interface UploadToSignedUrlParams {
    bucketName: string;
    path: string;
    token: string;
    file: File;
    contentType?: string;
    signedUrl?: string | null;
}

type CompressionProfile = {
    maxWidthOrHeight: number;
    quality: number;
    skipIfSmallerThanBytes: number;
};

const ASSET_ENDPOINTS = {
    uploadSessions: "/assets/upload-sessions",
};

const COMPRESSION_PROFILES: Record<ImageCompressionTarget, CompressionProfile> =
    {
        avatar: {
            maxWidthOrHeight: 1600,
            quality: 0.8,
            skipIfSmallerThanBytes: 350 * 1024,
        },
        "portfolio-cover": {
            maxWidthOrHeight: 2400,
            quality: 0.82,
            skipIfSmallerThanBytes: 500 * 1024,
        },
        "portfolio-gallery": {
            maxWidthOrHeight: 2000,
            quality: 0.78,
            skipIfSmallerThanBytes: 450 * 1024,
        },
    };

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

const loadImageFromFile = (file: File) =>
    new Promise<{
        image: HTMLImageElement;
        width: number;
        height: number;
        cleanup: () => void;
    }>((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            resolve({
                image,
                width: image.naturalWidth,
                height: image.naturalHeight,
                cleanup: () => URL.revokeObjectURL(objectUrl),
            });
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("We couldn’t process this image."));
        };

        image.src = objectUrl;
    });

const replaceFileExtension = (fileName: string, nextExtension: string) => {
    const normalizedExtension = nextExtension.replace(/^\./, "");

    if (!fileName.includes(".")) {
        return `${fileName}.${normalizedExtension}`;
    }

    return fileName.replace(/\.[^.]+$/, `.${normalizedExtension}`);
};

const getCompressedOutputType = (mimeType: string) => {
    if (mimeType === "image/png") {
        return "image/webp";
    }

    if (mimeType === "image/webp") {
        return "image/webp";
    }

    return "image/jpeg";
};

const getCompressedFileName = (fileName: string, mimeType: string) => {
    if (mimeType === "image/webp") {
        return replaceFileExtension(fileName, "webp");
    }

    return replaceFileExtension(fileName, "jpg");
};

const createCanvasBlob = (
    canvas: HTMLCanvasElement,
    outputType: string,
    quality: number,
) =>
    new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
            (blob) => {
                resolve(blob);
            },
            outputType,
            quality,
        );
    });

const normalizeString = (value: unknown): string => {
    return typeof value === "string" ? value : "";
};

const normalizeNullableString = (value: unknown): string | null => {
    return typeof value === "string" && value.trim().length > 0 ? value : null;
};

const normalizeNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (
        typeof value === "string" &&
        value.trim() &&
        !Number.isNaN(Number(value))
    ) {
        return Number(value);
    }

    return null;
};

const normalizeAsset = (payload: AnyRecord): AssetRecord => {
    return {
        id: normalizeString(payload.id),
        bucketName: normalizeString(payload.bucketName),
        objectKey: normalizeString(payload.objectKey),
        purpose: normalizeString(payload.purpose),
        visibility: normalizeString(payload.visibility),
        status: normalizeString(payload.status),
        originalFilename: normalizeNullableString(payload.originalFilename),
        mimeType: normalizeNullableString(payload.mimeType),
        sizeBytes: normalizeNumber(payload.sizeBytes),
    };
};

const normalizeUploadSession = (
    payload: AnyRecord,
): AssetUploadSessionRecord => {
    return {
        id: normalizeString(payload.id),
        assetId: normalizeString(payload.assetId),
        status: normalizeString(payload.status),
    };
};

const normalizeUploadData = (payload: AnyRecord): AssetUploadData => {
    return {
        path: normalizeString(payload.path),
        token: normalizeString(payload.token),
        signedUrl: normalizeNullableString(payload.signedUrl),
    };
};

const encodeObjectPath = (path: string) => {
    return path
        .split("/")
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join("/");
};

const buildSignedUploadUrl = (
    bucketName: string,
    uploadData: AssetUploadData,
): string => {
    if (uploadData.signedUrl) {
        return uploadData.signedUrl;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to the web app env before using real asset uploads.",
        );
    }

    const normalizedBaseUrl = supabaseUrl.replace(/\/+$/, "");
    const encodedBucketName = encodeURIComponent(bucketName);
    const encodedPath = encodeObjectPath(uploadData.path);
    const encodedToken = encodeURIComponent(uploadData.token);

    return `${normalizedBaseUrl}/storage/v1/object/upload/sign/${encodedBucketName}/${encodedPath}?token=${encodedToken}`;
};

const parseUploadErrorMessage = async (response: Response) => {
    try {
        const payload = (await response.json()) as
            | { message?: string; error?: string }
            | undefined;

        if (typeof payload?.message === "string" && payload.message.trim()) {
            return payload.message;
        }

        if (typeof payload?.error === "string" && payload.error.trim()) {
            return payload.error;
        }
    } catch {
        // fall through
    }

    return "We couldn’t upload this file to storage.";
};

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

    async compressImageFile(
        file: File,
        target: ImageCompressionTarget,
    ): Promise<File> {
        const validation = this.validateImageFile(file);

        if (!validation.isValid) {
            throw new Error(validation.message ?? "Invalid image file.");
        }

        const profile = COMPRESSION_PROFILES[target];

        if (
            typeof window === "undefined" ||
            typeof document === "undefined" ||
            file.size <= profile.skipIfSmallerThanBytes
        ) {
            return file;
        }

        const { image, width, height, cleanup } = await loadImageFromFile(file);

        try {
            const longestEdge = Math.max(width, height);
            const scale =
                longestEdge > profile.maxWidthOrHeight
                    ? profile.maxWidthOrHeight / longestEdge
                    : 1;

            const targetWidth = Math.max(1, Math.round(width * scale));
            const targetHeight = Math.max(1, Math.round(height * scale));

            if (
                scale === 1 &&
                file.size <= profile.skipIfSmallerThanBytes * 1.2
            ) {
                return file;
            }

            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const context = canvas.getContext("2d");

            if (!context) {
                return file;
            }

            context.drawImage(image, 0, 0, targetWidth, targetHeight);

            const outputType = getCompressedOutputType(file.type);
            const blob = await createCanvasBlob(
                canvas,
                outputType,
                profile.quality,
            );

            if (!blob) {
                return file;
            }

            const didResize = targetWidth !== width || targetHeight !== height;
            const isMeaningfullySmaller = blob.size < file.size * 0.95;

            if (!didResize && !isMeaningfullySmaller) {
                return file;
            }

            return new File(
                [blob],
                getCompressedFileName(file.name, outputType),
                {
                    type: outputType,
                    lastModified: Date.now(),
                },
            );
        } finally {
            cleanup();
        }
    },

    async createLocalAssetPreview(
        file: File,
        options?: {
            originalSizeInBytes?: number | null;
        },
    ): Promise<AssetPreview> {
        const previewUrl = await readFileAsDataUrl(file);

        return {
            id: generateAssetId(),
            source: "local-preview",
            status: "local-ready",
            assetId: null,
            fileName: file.name,
            mimeType: file.type,
            sizeInBytes: file.size,
            originalSizeInBytes: options?.originalSizeInBytes ?? null,
            previewUrl,
            createdAt: new Date().toISOString(),
            file,
        };
    },

    async prepareImageAsset(
        file: File,
        target: ImageCompressionTarget,
    ): Promise<AssetPreview> {
        const compressedFile = await this.compressImageFile(file, target);

        return this.createLocalAssetPreview(compressedFile, {
            originalSizeInBytes:
                compressedFile.size !== file.size ? file.size : null,
        });
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
            assetId: null,
            fileName,
            mimeType,
            sizeInBytes,
            originalSizeInBytes: null,
            previewUrl,
            createdAt: new Date().toISOString(),
            file: null,
        };
    },

    createUploadedAssetPreview({
        assetId,
        previewUrl,
        fileName,
        mimeType = "image/jpeg",
        sizeInBytes = 0,
        createdAt,
    }: {
        assetId: string;
        previewUrl: string;
        fileName: string;
        mimeType?: string;
        sizeInBytes?: number;
        createdAt?: string;
    }): AssetPreview {
        return {
            id: assetId,
            source: "uploaded-remote",
            status: "uploaded",
            assetId,
            fileName,
            mimeType,
            sizeInBytes,
            originalSizeInBytes: null,
            previewUrl,
            createdAt: createdAt ?? new Date().toISOString(),
            file: null,
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

    async createUploadSession(
        payload: CreateUploadSessionPayload,
    ): Promise<CreateUploadSessionResult> {
        const response = await assetClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(ASSET_ENDPOINTS.uploadSessions, payload);

        const data = unwrapResponse<AnyRecord>(response.data);

        return {
            asset: normalizeAsset((data.asset as AnyRecord | undefined) ?? {}),
            uploadSession: normalizeUploadSession(
                (data.uploadSession as AnyRecord | undefined) ?? {},
            ),
            uploadData: normalizeUploadData(
                (data.uploadData as AnyRecord | undefined) ?? {},
            ),
        };
    },

    async uploadToSignedUrl({
        bucketName,
        path,
        token,
        file,
        contentType,
        signedUrl,
    }: UploadToSignedUrlParams): Promise<void> {
        const uploadUrl = buildSignedUploadUrl(bucketName, {
            path,
            token,
            signedUrl,
        });

        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type":
                    contentType ?? (file.type || "application/octet-stream"),
            },
            body: file,
        });

        if (!response.ok) {
            const message = await parseUploadErrorMessage(response);
            throw new Error(message);
        }
    },

    async confirmUploadSession(
        sessionId: string,
        payload: ConfirmUploadSessionPayload = {},
    ): Promise<ConfirmUploadSessionResult> {
        const response = await assetClient.post<
            ApiResponse<AnyRecord> | AnyRecord
        >(`${ASSET_ENDPOINTS.uploadSessions}/${sessionId}/confirm`, payload);

        const data = unwrapResponse<AnyRecord>(response.data);

        return {
            asset: normalizeAsset((data.asset as AnyRecord | undefined) ?? {}),
            uploadSession: normalizeUploadSession(
                (data.uploadSession as AnyRecord | undefined) ?? {},
            ),
        };
    },
};
