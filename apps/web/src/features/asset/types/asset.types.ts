export type AssetSource = "local-preview" | "seeded-remote" | "uploaded-remote";

export type AssetStatus = "local-ready" | "seeded" | "uploaded";

export interface AssetPreview {
    id: string;
    source: AssetSource;
    status: AssetStatus;
    assetId?: string | null;
    fileName: string;
    mimeType: string;
    sizeInBytes: number;
    previewUrl: string;
    createdAt: string;
    file?: File | null;
}
