"use client";

import { isAxiosError } from "axios";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import
{
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import
{
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { Footer } from "../../../components/home/footer";
import { Navbar } from "../../../components/home/navbar";
import { Container } from "../../../components/layout/container";
import { Button } from "../../../components/ui/button";
import { bookingService } from "../../../services/booking.service";
import { useAuthStore } from "../../../store/auth.store";
import type { OpenBookingRequestRecord } from "../types/booking.types";
import { BookingOwnerActionsMenu } from "./booking-owner-actions-menu";
import
{
    formatBookingDate,
    formatBookingTime,
    formatBudgetLabel,
    formatShootTypeLabel,
} from "../utils/booking-display";

import { ApplyToPhotoshootModal } from "./apply-to-photoshoot-modal";
import type { CreateBookingApplicationPayload } from "../types/booking.types";
import { OpenBookingApplicationsSection } from "./open-booking-applications-section";

interface IconProps
{
    className?: string;
}

const UserIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M20 21a8 8 0 0 0-16 0" />
        <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    </svg>
);

const CameraIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
        <path d="M12 15.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
    </svg>
);

const CalendarIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M7 3v4" />
        <path d="M17 3v4" />
        <path d="M4 8h16" />
        <path d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />
    </svg>
);

const LocationIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M12 21s7-5.1 7-11.2A7 7 0 0 0 5 9.8C5 15.9 12 21 12 21Z" />
        <path d="M12 12.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" />
    </svg>
);

const DocumentIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
    </svg>
);

const TagIcon = ({ className = "h-4 w-4" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className={className}
        aria-hidden="true"
    >
        <path d="M20 13 13 20 4 11V4h7l9 9Z" />
        <path d="M7.5 7.5h.01" />
    </svg>
);

const getBookingTitle = (booking: OpenBookingRequestRecord): string =>
{
    if (booking.title?.trim()) {
        return booking.title.trim();
    }

    return `${formatShootTypeLabel(booking.shootType || booking.sessionType)} photoshoot`;
};

const getClientName = (booking: OpenBookingRequestRecord): string =>
{
    return (
        booking.clientName ||
        booking.clientFullName ||
        booking.clientProfileName ||
        booking.fullName ||
        "Client"
    );
};

const parseDate = (value?: string | null): Date | null =>
{
    if (!value?.trim()) {
        return null;
    }

    const parsedDate = new Date(value.includes("T") ? value : `${value}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate;
};

const formatDetailedDate = (value?: string | null): string =>
{
    const parsedDate = parseDate(value);

    if (!parsedDate) {
        return formatBookingDate(value);
    }

    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric",
    }).format(parsedDate);
};

const getApplicationCount = (booking: OpenBookingRequestRecord): number =>
{
    return (
        booking.photographerApplicationsCount ??
        booking.applicationsCount ??
        booking.applicationCount ??
        0
    );
};

const getServiceChips = (booking: OpenBookingRequestRecord): string[] =>
{
    const source = `${booking.notes ?? ""} ${booking.inspiration ?? ""}`.toLowerCase();
    const chips: string[] = [];

    if (
        source.includes("make") ||
        source.includes("hair") ||
        source.includes("tóc") ||
        source.includes("trang điểm")
    ) {
        chips.push("Make-up + hair styling");
    }

    if (source.includes("studio")) {
        chips.push("Studio rental");
    }

    return chips;
};

const getErrorMessage = (error: unknown, fallback: string): string =>
{
    if (isAxiosError(error)) {
        const payload = error.response?.data as
            | { message?: string | string[] }
            | undefined;

        if (typeof payload?.message === "string" && payload.message.trim()) {
            return payload.message;
        }

        if (Array.isArray(payload?.message) && payload.message.length > 0) {
            return payload.message[0] ?? fallback;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
};

const InfoBlock = ({
    icon,
    label,
    value,
}: {
    icon: ReactNode;
    label: string;
    value: ReactNode;
}) => (
    <div className="grid gap-1.5">
        <div className="flex items-center gap-2 text-sm text-muted">
            <span className="text-accent">{icon}</span>
            <span>{label}</span>
        </div>

        <div className="text-base font-semibold leading-6 text-foreground">
            {value}
        </div>
    </div>
);

const DetailSkeleton = () =>
{
    return (
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-surface p-6 shadow-[0_18px_50px_rgba(23,23,23,0.06)]">
            <div className="h-4 w-32 animate-pulse rounded-full bg-border" />
            <div className="mt-5 h-10 w-3/4 animate-pulse rounded-full bg-border" />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-20 animate-pulse rounded-2xl bg-background"
                    />
                ))}
            </div>
            <div className="mt-8 h-32 animate-pulse rounded-2xl bg-background" />
        </div>
    );
};


export const OpenBookingDetailPage = () =>
{
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    const {
        isAuthenticated,
        user,
        hasHydrated,
        isHydrating,
    } = useAuthStore();

    const bookingId = useMemo(() =>
    {
        const rawValue = params.bookingId;

        if (Array.isArray(rawValue)) {
            return rawValue[0] ?? "";
        }

        return rawValue ?? "";
    }, [params.bookingId]);

    const shouldUseViewerContext =
        hasHydrated && !isHydrating && isAuthenticated;

    const bookingQuery = useQuery({
        queryKey: [
            "open-booking-detail",
            bookingId,
            shouldUseViewerContext ? user?.id ?? user?.email ?? "viewer" : "guest",
        ],
        queryFn: () =>
            bookingService.getOpenBookingDetail(
                bookingId,
                shouldUseViewerContext,
            ),
        enabled: bookingId.length > 0 && hasHydrated && !isHydrating,
        retry: false,
    });

    const booking = bookingQuery.data;
    const signInHref = `/sign-in?next=${encodeURIComponent(pathname)}`;

    const cancelBookingMutation = useMutation({
        mutationFn: () => bookingService.cancelMyClientBooking(bookingId),
        onSuccess: async () =>
        {
            toast.success("Booking cancelled", {
                description:
                    "Your open booking request was removed from the public booking list.",
            });

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-feed"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["client-bookings"],
                }),
            ]);

            router.push("/my-bookings");
        },
        onError: (error) =>
        {
            toast.error("We couldn’t cancel this booking", {
                description: getErrorMessage(
                    error,
                    "Please try again in a moment.",
                ),
            });
        },
    });

    const applyMutation = useMutation({
        mutationFn: (payload: CreateBookingApplicationPayload) =>
            bookingService.applyToOpenBooking(bookingId, payload),
        onSuccess: async () =>
        {
            toast.success("Application submitted", {
                description:
                    "The client can now review your proposal for this photoshoot.",
            });

            setIsApplyModalOpen(false);

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["open-booking-detail", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["my-open-booking-application", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["client-booking-applications", bookingId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["opening-booking-requests"],
                }),
            ]);
        },
        onError: (error) =>
        {
            toast.error("We couldn’t submit your application", {
                description: getErrorMessage(
                    error,
                    "Please check your proposal and try again.",
                ),
            });
        },
    });

    const primaryCta = useMemo(() =>
    {
        if (!isAuthenticated) {
            return {
                label: "Sign in to apply",
                href: signInHref,
                disabled: false,
            };
        }

        if (booking?.isOwner) {
            return {
                label: "Manage in My bookings",
                href: `/my-bookings?bookingId=${booking.id}`,
                disabled: false,
            };
        }

        if (user?.role === "photographer") {
            if (booking?.hasApplied) {
                return {
                    label: "Application submitted",
                    href: "#",
                    disabled: true,
                };
            }

            if (booking?.canApply) {
                return {
                    label: "Apply to photoshoot",
                    href: "#",
                    disabled: false,
                    action: "apply" as const,
                };
            }

            return {
                label: "Cannot apply to this booking",
                href: "#",
                disabled: true,
            };
        }

        return {
            label: "Start a similar booking",
            href: booking
                ? `/bookings/new?style=${encodeURIComponent(
                    booking.shootType || booking.sessionType,
                )}&date=${encodeURIComponent(
                    booking.sessionDate,
                )}&location=${encodeURIComponent(booking.location)}`
                : "/bookings/new",
            disabled: false,
        };
    }, [booking, isAuthenticated, signInHref, user?.role]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="py-10 sm:py-14">
                <Container size="wide">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-8 inline-flex items-center text-sm font-medium text-muted transition hover:text-foreground"
                    >
                        ← Back
                    </button>

                    {!hasHydrated || isHydrating || bookingQuery.isLoading ? (
                        <DetailSkeleton />
                    ) : bookingQuery.isError || !booking ? (
                        <div className="mx-auto max-w-3xl rounded-[2rem] border border-border bg-surface p-8 text-center shadow-[0_18px_50px_rgba(23,23,23,0.06)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
                                Opening request
                            </p>

                            <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-foreground">
                                This photoshoot is no longer available.
                            </h1>

                            <p className="mt-4 text-base leading-7 text-muted">
                                The client may have already chosen a photographer,
                                cancelled the request, or removed it from the open
                                booking list.
                            </p>

                            <div className="mt-7">
                                <Button onClick={() => router.push("/")}>
                                    Go back home
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <section className="mx-auto max-w-4xl">
                            <div className="rounded-[2rem] border border-border bg-surface p-5 shadow-[0_18px_50px_rgba(23,23,23,0.06)] sm:p-8">
                                <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
                                    <div>

                                        <h1 className="mt-3 max-w-xl font-display text-2xl leading-tight tracking-[-0.03em] text-foreground sm:text-3xl">
                                            {getBookingTitle(booking)}
                                        </h1>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* <span className="w-fit rounded-full border border-accent/30 bg-accent/15 px-4 py-2 text-sm font-semibold text-foreground">
                                            Looking for photographer
                                        </span> */}

                                        {booking.canManage ? (
                                            <BookingOwnerActionsMenu
                                                bookingId={booking.id}
                                                isCancelling={cancelBookingMutation.isPending}
                                                onCancel={() => cancelBookingMutation.mutate()}
                                            />
                                        ) : (
                                            <span className="h-9 w-12 shrink-0" aria-hidden="true" />
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-6 py-7 md:grid-cols-2">
                                    <InfoBlock
                                        icon={<UserIcon />}
                                        label="Customer"
                                        value={getClientName(booking)}
                                    />

                                    <InfoBlock
                                        icon={<CalendarIcon />}
                                        label="Shooting date"
                                        value={formatDetailedDate(
                                            booking.sessionDate,
                                        )}
                                    />

                                    <InfoBlock
                                        icon={<LocationIcon />}
                                        label="Location"
                                        value={booking.location}
                                    />

                                    <InfoBlock
                                        icon={<CameraIcon />}
                                        label="Shooting type"
                                        value={`${formatShootTypeLabel(
                                            booking.shootType ||
                                            booking.sessionType,
                                        )} · ${formatBookingTime(
                                            booking.sessionTime,
                                        )}`}
                                    />
                                </div>

                                <div className="space-y-6 border-t border-border pt-7">
                                    <section>
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <DocumentIcon className="h-4 w-4 text-accent" />
                                            <span>Photoshoot description</span>
                                        </div>

                                        <p className="mt-2 whitespace-pre-line rounded-2xl bg-background px-4 py-4 text-base leading-7 text-foreground">
                                            {booking.concept ||
                                                "No description was added."}
                                        </p>
                                    </section>

                                    <section>
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            <TagIcon className="h-4 w-4 text-accent" />
                                            <span>Request</span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {getServiceChips(booking).length > 0 ? (
                                                getServiceChips(booking).map(
                                                    (chip) => (
                                                        <span
                                                            key={chip}
                                                            className="rounded-full border border-accent/30 bg-accent/15 px-3 py-1.5 text-sm font-medium text-foreground"
                                                        >
                                                            {chip}
                                                        </span>
                                                    ),
                                                )
                                            ) : (
                                                <span className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-muted">
                                                    No extra service requested
                                                </span>
                                            )}
                                        </div>
                                    </section>

                                    <div className="rounded-2xl bg-background px-4 py-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <span className="text-sm font-medium text-muted">
                                                Expected cost
                                            </span>

                                            <span className="text-lg font-semibold tracking-[0.02em] text-accent">
                                                {formatBudgetLabel(booking.budget)}
                                            </span>
                                        </div>
                                    </div>

                                    <OpenBookingApplicationsSection
                                        booking={booking}
                                        bookingId={booking.id}
                                    />

                                    <div className="flex justify-center pt-1">
                                        {primaryCta.disabled ? (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex min-w-[15rem] cursor-not-allowed items-center justify-center rounded-2xl bg-foreground/40 px-8 py-4 text-base font-semibold text-background"
                                            >
                                                {primaryCta.label}
                                            </button>
                                        ) : (
                                            "action" in primaryCta &&
                                                primaryCta.action === "apply" ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsApplyModalOpen(true)
                                                    }
                                                    className="inline-flex min-w-[15rem] items-center justify-center rounded-2xl bg-foreground px-8 py-4 text-base font-semibold text-background transition hover:opacity-90"
                                                >
                                                    {primaryCta.label}
                                                </button>
                                            ) : (
                                                <Link
                                                    href={primaryCta.href}
                                                    className="inline-flex min-w-[15rem] items-center justify-center rounded-2xl bg-foreground px-8 py-4 text-base font-semibold text-background transition hover:opacity-90"
                                                >
                                                    {primaryCta.label}
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </Container>
            </main>
            <ApplyToPhotoshootModal
                isOpen={isApplyModalOpen}
                isSubmitting={applyMutation.isPending}
                onClose={() => setIsApplyModalOpen(false)}
                onSubmit={(payload) => applyMutation.mutate(payload)}
            />
            <Footer />
        </div>
    );
};