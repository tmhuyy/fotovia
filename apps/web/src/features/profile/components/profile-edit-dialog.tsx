"use client";

import
    {
        useEffect,
        useMemo,
        useRef,
        useState,
        type ChangeEvent,
        type FormEvent,
    } from "react";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import { assetService } from "../../../services/asset.service";
import type { AssetPreview } from "../../asset/types/asset.types";
import type { ProfileData, ProfileUpdatePayload } from "../types/profile.types";

interface ProfileEditDialogProps
{
    isOpen: boolean;
    profile: ProfileData;
    isSaving: boolean;
    isUploading: boolean;
    onClose: () => void;
    onSave: (payload: ProfileUpdatePayload) => Promise<unknown>;
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

const RequiredMark = () => <span className="text-red-500">*</span>;

const formatNumberInput = (value: string) =>
{
    if (!value.trim()) return "";

    return new Intl.NumberFormat("vi-VN").format(Number(value));
};

const normalizeDigits = (value: string) =>
{
    return value.replace(/[^\d]/g, "");
};

const parseOptionalNumber = (value: string) =>
{
    const normalizedValue = normalizeDigits(value);

    if (!normalizedValue) return undefined;

    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const splitSpecialties = (value: string) =>
{
    return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

export const ProfileEditDialog = ({
    isOpen,
    profile,
    isSaving,
    isUploading,
    onClose,
    onSave,
    onUpload,
}: ProfileEditDialogProps) =>
{
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const [specialtiesText, setSpecialtiesText] = useState("");
    const [pricePerHour, setPricePerHour] = useState("");
    const [experienceYears, setExperienceYears] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<AssetPreview | null>(null);
    const [fileMessage, setFileMessage] = useState<string | null>(null);

    const isPhotographer = profile.role === "photographer";
    const isSubmitting = isSaving || isUploading;

    const maxSizeLabel = useMemo(() =>
    {
        return assetService.formatFileSize(assetService.maxImageSizeBytes);
    }, []);

    const currentAvatarUrl = preview?.previewUrl ?? profile.avatarUrl;

    useEffect(() =>
    {
        if (!isOpen) return;

        setFullName(profile.fullName ?? "");
        setPhone(profile.phone ?? "");
        setLocation(profile.location ?? "");
        setBio(profile.bio ?? "");
        setSpecialtiesText(profile.specialties.join(", "));
        setPricePerHour(
            profile.pricePerHour !== null ? String(profile.pricePerHour) : "",
        );
        setExperienceYears(
            profile.experienceYears !== null
                ? String(profile.experienceYears)
                : "",
        );
        setSelectedFile(null);
        setPreview(null);
        setFileMessage(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }, [isOpen, profile]);

    useEffect(() =>
    {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscape = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape" && !isSubmitting) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, isSubmitting, onClose]);

    if (!isOpen) {
        return null;
    }

    const isValid =
        fullName.trim().length >= 2 &&
        fullName.trim().length <= 255 &&
        phone.trim().length <= 30 &&
        location.trim().length <= 255 &&
        bio.trim().length <= 500 &&
        specialtiesText.trim().length <= 500;

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) =>
    {
        const nextFile = event.target.files?.[0] ?? null;
        const validation = assetService.validateImageFile(nextFile);

        if (!validation.isValid || !nextFile) {
            setSelectedFile(null);
            setPreview(null);
            setFileMessage(validation.message);
            return;
        }

        try {
            const localPreview =
                await assetService.createLocalAssetPreview(nextFile);

            setSelectedFile(nextFile);
            setPreview(localPreview);
            setFileMessage(null);
        } catch {
            setSelectedFile(null);
            setPreview(null);
            setFileMessage("We couldn’t prepare a preview for this file.");
        }
    };

    const handleClearSelectedFile = () =>
    {
        setSelectedFile(null);
        setPreview(null);
        setFileMessage(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();

        if (!isValid || isSubmitting) {
            return;
        }

        const payload: ProfileUpdatePayload = {
            fullName: fullName.trim(),
            phone: phone.trim(),
            location: location.trim(),
            bio: bio.trim(),
            specialties: isPhotographer
                ? splitSpecialties(specialtiesText)
                : profile.specialties,
            ...(isPhotographer && pricePerHour.trim()
                ? { pricePerHour: parseOptionalNumber(pricePerHour) }
                : {}),
            ...(isPhotographer && experienceYears.trim()
                ? { experienceYears: parseOptionalNumber(experienceYears) }
                : {}),
        };

        try {
            await onSave(payload);

            if (selectedFile) {
                await onUpload(selectedFile);
            }

            toast.success("Profile updated", {
                description: "Your profile information is now up to date.",
            });

            onClose();
        } catch {
            toast.error("We couldn’t update your profile", {
                description: "Please check your information and try again.",
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-foreground/45 px-4 py-5 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close profile edit dialog"
                className="fixed inset-0"
                onClick={() =>
                {
                    if (!isSubmitting) {
                        onClose();
                    }
                }}
            />

            <div className="relative z-10 flex min-h-full items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-border bg-surface shadow-2xl"
                >
                    <div className="shrink-0 border-b border-border px-5 py-5 sm:px-7">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                                    Update information
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-muted">
                                    Update your profile details without changing
                                    the current Fotovia profile logic.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-xl text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-5 py-5 sm:px-7">
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-border pb-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/20 text-sm font-semibold text-accent">
                                    01
                                </span>

                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Personal information
                                    </p>
                                    <p className="text-xs text-muted">
                                        Basic details shown on your Fotovia
                                        account.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="text-sm font-medium text-foreground">
                                        Full name <RequiredMark />
                                    </span>

                                    <input
                                        value={fullName}
                                        onChange={(event) =>
                                            setFullName(event.target.value)
                                        }
                                        placeholder="Enter your full name"
                                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-sm font-medium text-foreground">
                                        Phone number
                                    </span>

                                    <input
                                        value={phone}
                                        onChange={(event) =>
                                            setPhone(event.target.value)
                                        }
                                        placeholder="Add your phone number"
                                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                    />
                                </label>

                                <label className="block sm:col-span-2">
                                    <span className="text-sm font-medium text-foreground">
                                        Location
                                    </span>

                                    <input
                                        value={location}
                                        onChange={(event) =>
                                            setLocation(event.target.value)
                                        }
                                        placeholder="City, region, or studio base"
                                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                    />
                                </label>

                                <label className="block sm:col-span-2">
                                    <span className="text-sm font-medium text-foreground">
                                        Bio
                                    </span>

                                    <textarea
                                        value={bio}
                                        onChange={(event) =>
                                            setBio(event.target.value)
                                        }
                                        rows={4}
                                        placeholder="Write a short introduction"
                                        className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent"
                                    />

                                    <div className="mt-1 flex justify-end">
                                        <span className="text-xs text-muted">
                                            {bio.length}/500
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-border pb-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/20 text-sm font-semibold text-accent">
                                    02
                                </span>

                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Profile photo
                                    </p>
                                    <p className="text-xs text-muted">
                                        Uploading a new image will replace your
                                        current avatar.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-xl font-semibold text-foreground">
                                    {currentAvatarUrl ? (
                                        <img
                                            src={currentAvatarUrl}
                                            alt={`${profile.fullName || "Fotovia user"} avatar`}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        getInitials(
                                            profile.fullName || "Fotovia User",
                                        )
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {selectedFile
                                                ? "New avatar selected"
                                                : profile.avatarUrl
                                                    ? "Current avatar"
                                                    : "No avatar uploaded yet"}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-muted">
                                            Max size: {maxSizeLabel}. Accepted
                                            types:{" "}
                                            {assetService.acceptedImageMimeTypes.join(
                                                ", ",
                                            )}
                                        </p>
                                    </div>

                                    <input
                                        ref={inputRef}
                                        type="file"
                                        accept={assetService.acceptedImageMimeTypes.join(
                                            ",",
                                        )}
                                        className="block w-full cursor-pointer rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-brand-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-primary"
                                        onChange={handleFileChange}
                                        disabled={isSubmitting}
                                    />

                                    {selectedFile ? (
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="break-all text-xs text-muted">
                                                {selectedFile.name} ·{" "}
                                                {assetService.formatFileSize(
                                                    selectedFile.size,
                                                )}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={handleClearSelectedFile}
                                                className="text-xs font-semibold text-foreground underline underline-offset-4"
                                            >
                                                Clear selection
                                            </button>
                                        </div>
                                    ) : null}

                                    {fileMessage ? (
                                        <p className="text-xs text-destructive">
                                            {fileMessage}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </section>

                        {isPhotographer ? (
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 border-b border-border pb-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/20 text-sm font-semibold text-accent">
                                        03
                                    </span>

                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Photographer details
                                        </p>
                                        <p className="text-xs text-muted">
                                            These fields help clients understand
                                            your photography profile.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <label className="block sm:col-span-2">
                                        <span className="text-sm font-medium text-foreground">
                                            Specialties
                                        </span>

                                        <textarea
                                            value={specialtiesText}
                                            onChange={(event) =>
                                                setSpecialtiesText(
                                                    event.target.value,
                                                )
                                            }
                                            rows={3}
                                            placeholder="Editorial, Wedding, Portrait"
                                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent"
                                        />

                                        <p className="mt-1 text-xs text-muted">
                                            Separate specialties with commas.
                                        </p>
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-medium text-foreground">
                                            Price per hour
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formatNumberInput(
                                                pricePerHour,
                                            )}
                                            onChange={(event) =>
                                                setPricePerHour(
                                                    normalizeDigits(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="e.g. 500.000"
                                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                        />

                                        <p className="mt-1 text-xs text-muted">
                                            Enter VND amount only.
                                        </p>
                                    </label>

                                    <label className="block">
                                        <span className="text-sm font-medium text-foreground">
                                            Experience years
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={experienceYears}
                                            onChange={(event) =>
                                                setExperienceYears(
                                                    normalizeDigits(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            placeholder="e.g. 4"
                                            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                        />

                                        <p className="mt-1 text-xs text-muted">
                                            Enter a whole number.
                                        </p>
                                    </label>
                                </div>
                            </section>
                        ) : null}
                    </div>

                    <div className="shrink-0 border-t border-border px-5 py-4 sm:px-7">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-2xl border border-border bg-surface px-7 py-3 text-foreground shadow-none hover:bg-background disabled:opacity-60"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="rounded-2xl bg-foreground px-7 py-3 text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? "Saving..." : "Confirm"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};