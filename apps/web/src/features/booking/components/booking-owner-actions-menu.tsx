"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { CancelBookingPayload } from "../types/booking.types";
import { CancelBookingDialog } from "./cancel-booking-dialog";

interface BookingOwnerActionsMenuProps
{
    bookingId: string;
    isCancelling: boolean;
    onCancel: (payload: CancelBookingPayload) => void;
    onEdit?: () => void;
    editHref?: string;
    canEdit?: boolean;
}

interface IconProps
{
    className?: string;
}

const MoreIcon = ({ className = "h-5 w-5" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <circle cx="6" cy="12" r="1.7" />
        <circle cx="12" cy="12" r="1.7" />
        <circle cx="18" cy="12" r="1.7" />
    </svg>
);

export const BookingOwnerActionsMenu = ({
    bookingId,
    isCancelling,
    onCancel,
    onEdit,
    editHref,
    canEdit = true,
}: BookingOwnerActionsMenuProps) =>
{
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    useEffect(() =>
    {
        const handlePointerDown = (event: MouseEvent) =>
        {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleCancelClick = () =>
    {
        setIsOpen(false);
        setIsCancelDialogOpen(true);
    };

    const handleConfirmCancel = (payload: CancelBookingPayload) =>
    {
        onCancel(payload);
        setIsCancelDialogOpen(false);
    };

    return (
        <>
            <div ref={rootRef} className="pointer-events-auto relative z-30">
                <button
                    type="button"
                    onClick={(event) =>
                    {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsOpen((current) => !current);
                    }}
                    className={[
                        "inline-flex h-9 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-transparent bg-transparent text-muted transition",
                        "hover:border-[#9BC8EE] hover:bg-surface hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9BC8EE]",
                        isOpen ? "border-[#9BC8EE] bg-surface text-foreground" : "",
                    ].join(" ")}
                    aria-label="Open booking actions"
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                >
                    <MoreIcon />
                </button>

                {isOpen ? (
                    <div
                        role="menu"
                        className="absolute right-0 top-[calc(100%+0.55rem)] z-40 w-56 rounded-[1.25rem] border border-border bg-surface p-2 shadow-2xl"
                        onClick={(event) =>
                        {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                    >
                        {canEdit ? (
                            onEdit ? (
                                <button
                                    type="button"
                                    className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-background hover:text-accent"
                                    role="menuitem"
                                    onClick={(event) =>
                                    {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setIsOpen(false);
                                        onEdit();
                                    }}
                                >
                                    Edit booking
                                </button>
                            ) : (
                                <Link
                                    href={
                                        editHref ??
                                        `/my-bookings?bookingId=${bookingId}`
                                    }
                                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-background hover:text-accent"
                                    role="menuitem"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Edit booking
                                </Link>
                            )
                        ) : null}

                        <button
                            type="button"
                            onClick={handleCancelClick}
                            disabled={isCancelling}
                            className="mt-1 block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                            role="menuitem"
                        >
                            {isCancelling ? "Cancelling..." : "Cancel booking"}
                        </button>
                    </div>
                ) : null}
            </div>

            <CancelBookingDialog
                isOpen={isCancelDialogOpen}
                isPending={isCancelling}
                onClose={() => setIsCancelDialogOpen(false)}
                onConfirm={handleConfirmCancel}
            />
        </>
    );
};