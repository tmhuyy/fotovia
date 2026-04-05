"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";

import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { assetService } from "../../../services/asset.service";
import type { AssetPreview } from "../../asset/types/asset.types";
import type { ProfileData } from "../types/profile.types";

interface ProfileAvatarUploaderProps
{
    profile: ProfileData;
    isUploading: boolean;
    onUpload: (file: File) => Promise<void>;
}

const getInitials = (name: string) =>
{
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

export const ProfileAvatarUploader = ({
    profile,
    isUploading,
    onUpload,
}: ProfileAvatarUploaderProps) =>
{
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<AssetPreview | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const maxSizeLabel = useMemo(() =>
    {
        return assetService.formatFileSize(assetService.maxImageSizeBytes);
    }, []);

    const currentPreviewUrl = preview?.previewUrl ?? profile.avatarUrl;
    const previewLabel = preview
        ? "New avatar preview"
        : profile.avatarUrl
            ? "Current avatar"
            : "No avatar uploaded yet";

    const resetSelection = () =>
    {
        setSelectedFile(null);
        setPreview(null);
        setMessage(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) =>
    {
        const nextFile = event.target.files?.[0] ?? null;
        const validation = assetService.validateImageFile(nextFile);

        if (!validation.isValid || !nextFile) {
            setSelectedFile(null);
            setPreview(null);
            setMessage(validation.message);
            return;
        }

        try {
            const localPreview = await assetService.createLocalAssetPreview(nextFile);

            setSelectedFile(nextFile);
            setPreview(localPreview);
            setMessage(null);
        } catch {
            setSelectedFile(null);
            setPreview(null);
            setMessage("We couldn’t prepare a preview for this file.");
        }
    };

    const handleUpload = async () =>
    {
        const validation = assetService.validateImageFile(selectedFile);

        if (!validation.isValid || !selectedFile) {
            setMessage(validation.message);
            return;
        }

        await onUpload(selectedFile);
        resetSelection();
    };

    return (
        <Card className="rounded-[2rem] border-border bg-surface shadow-sm">
            <CardContent className="space-y-6 p-8">
                <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted">
                        Avatar
                    </p>
                    <h2 className="font-serif text-2xl text-foreground">
                        Upload profile photo
                    </h2>
                    <p className="text-sm leading-6 text-muted">
                        Choose a JPG, PNG, or WEBP image. The current local bridge keeps the
                        experience simple while your backend asset flow handles real
                        persistence.
                    </p>
                </div>

                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-xl font-semibold text-foreground">
                        {currentPreviewUrl ? (
                            <img
                                src={currentPreviewUrl}
                                alt={`${profile.fullName || "Fotovia user"} avatar`}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            getInitials(profile.fullName || "Fotovia User")
                        )}
                    </div>

                    <div className="min-w-0 space-y-2">
                        <p className="text-sm font-medium text-foreground">{previewLabel}</p>

                        {selectedFile ? (
                            <p className="break-all text-sm text-muted">
                                {selectedFile.name} ·{" "}
                                {assetService.formatFileSize(selectedFile.size)}
                            </p>
                        ) : (
                            <p className="text-sm text-muted">
                                Max size: {maxSizeLabel}. Recommended for profile use.
                            </p>
                        )}

                        <p className="text-xs text-muted">
                            Accepted types: {assetService.acceptedImageMimeTypes.join(", ")}
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <input
                        ref={inputRef}
                        type="file"
                        accept={assetService.acceptedImageMimeTypes.join(",")}
                        className="block w-full cursor-pointer rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-brand-accent file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-primary"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />

                    {message ? (
                        <p className="text-sm text-destructive">{message}</p>
                    ) : (
                        <p className="text-sm text-muted">
                            Uploading a new avatar will replace the active one on your profile.
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        className="rounded-full"
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                    >
                        {isUploading ? "Uploading avatar..." : "Upload avatar"}
                    </Button>

                    <Button
                        type="button"
                        className="rounded-full border border-border bg-surface text-foreground shadow-none hover:bg-background"
                        onClick={resetSelection}
                        disabled={isUploading || (!selectedFile && !preview)}
                    >
                        Clear selection
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};