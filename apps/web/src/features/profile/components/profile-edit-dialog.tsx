"use client";

import
    {
        useEffect,
        useMemo,
        useState,
        type FormEvent,
    } from "react";
import { toast } from "sonner";

import { Button } from "../../../components/ui/button";
import { VIETNAM_LOCATION_OPTIONS } from "../../../shared/data/vietnam-locations";
import type { ProfileData, ProfileUpdatePayload } from "../types/profile.types";

interface ProfileEditDialogProps
{
    isOpen: boolean;
    profile: ProfileData;
    isSaving: boolean;
    onClose: () => void;
    onSave: (payload: ProfileUpdatePayload) => Promise<unknown>;
}

const RequiredMark = () => <span className="text-red-500">*</span>;

const EXPERIENCE_OPTIONS = [
    { label: "<1 year", value: "0" },
    { label: "1-3 years", value: "1" },
    { label: ">3 years", value: "4" },
    { label: ">5 years", value: "6" },
];

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

const normalizeSearchText = (value: string) =>
{
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

const resolveLocationValue = (value: string) =>
{
    const normalizedValue = normalizeSearchText(value);

    if (!normalizedValue) return "";

    const matchedLocation = VIETNAM_LOCATION_OPTIONS.find((option) =>
    {
        const searchableValues = [
            option.label,
            option.value,
            ...option.aliases,
        ];

        return searchableValues.some(
            (item) => normalizeSearchText(item) === normalizedValue,
        );
    });

    return matchedLocation?.value ?? value;
};

const resolveExperienceValue = (value: number | null) =>
{
    if (value === null) return "";
    if (value < 1) return "0";
    if (value <= 3) return "1";
    if (value <= 5) return "4";

    return "6";
};

export const ProfileEditDialog = ({
    isOpen,
    profile,
    isSaving,
    onClose,
    onSave,
}: ProfileEditDialogProps) =>
{
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const [pricePerHour, setPricePerHour] = useState("");
    const [experienceYears, setExperienceYears] = useState("");

    const isPhotographer = profile.role === "photographer";
    const isSubmitting = isSaving;

    const locationOptions = useMemo(() =>
    {
        if (
            location &&
            !VIETNAM_LOCATION_OPTIONS.some(
                (option) => option.value === location,
            )
        ) {
            return [
                {
                    label: location,
                    value: location,
                    aliases: [],
                },
                ...VIETNAM_LOCATION_OPTIONS,
            ];
        }

        return VIETNAM_LOCATION_OPTIONS;
    }, [location]);

    useEffect(() =>
    {
        if (!isOpen) return;

        setFullName(profile.fullName ?? "");
        setPhone(profile.phone ?? "");
        setLocation(resolveLocationValue(profile.location ?? ""));
        setBio(profile.bio ?? "");
        setPricePerHour(
            profile.pricePerHour !== null ? String(profile.pricePerHour) : "",
        );
        setExperienceYears(resolveExperienceValue(profile.experienceYears));
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
        bio.trim().length <= 500;

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
            specialties: profile.specialties,
            ...(isPhotographer && pricePerHour.trim()
                ? { pricePerHour: parseOptionalNumber(pricePerHour) }
                : {}),
            ...(isPhotographer && experienceYears.trim()
                ? { experienceYears: parseOptionalNumber(experienceYears) }
                : {}),
        };

        try {
            await onSave(payload);

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
                    className="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-2xl"
                >
                    <div className="shrink-0 border-b border-border px-5 py-4 sm:px-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                                    Update information
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-xl text-foreground transition hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
                        <section className="space-y-4">
                            

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

                                    <select
                                        value={location}
                                        onChange={(event) =>
                                            setLocation(event.target.value)
                                        }
                                        className="mt-2 w-full cursor-pointer rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                    >
                                        <option value="">
                                            Select a location in Vietnam
                                        </option>

                                        {locationOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
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

                        {isPhotographer ? (
                            <section className="space-y-4">
                               

                                <div className="grid gap-4 sm:grid-cols-2">
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

                                        <select
                                            value={experienceYears}
                                            onChange={(event) =>
                                                setExperienceYears(
                                                    event.target.value,
                                                )
                                            }
                                            className="mt-2 w-full cursor-pointer rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                                        >
                                            <option value="">
                                                Select experience
                                            </option>

                                            {EXPERIENCE_OPTIONS.map(
                                                (option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        <p className="mt-1 text-xs text-muted">
                                            Choose the closest experience range.
                                        </p>
                                    </label>
                                </div>
                            </section>
                        ) : null}
                    </div>

                    <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="cursor-pointer rounded-2xl border border-border bg-surface px-7 py-3 text-foreground shadow-none hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="cursor-pointer rounded-2xl bg-foreground px-7 py-3 text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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