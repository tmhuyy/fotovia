export type AssetSource = "local-preview" | "seeded-remote";

export type AssetStatus = "local-ready" | "seeded";

export interface AssetPreview {
    id: string;
    source: AssetSource;
    status: AssetStatus;
    fileName: string;
    mimeType: string;
    sizeInBytes: number;
    previewUrl: string;
    createdAt: string;
}
