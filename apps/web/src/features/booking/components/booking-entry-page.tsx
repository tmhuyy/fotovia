"use client";

import { useQuery } from "@tanstack/react-query";

import { photographerService } from "../../../services/photographer.service";
import type { BookingEntrySearchParams } from "../types/booking.types";
import { BookingBriefPage } from "./booking-brief-page";
import { BookingRequestPage } from "./booking-request-page";

interface BookingEntryPageProps
{
    searchParams: BookingEntrySearchParams;
}

export const BookingEntryPage = ({
    searchParams,
}: BookingEntryPageProps) =>
{
    const photographerSlug = searchParams.photographerSlug?.trim() ?? "";

    const photographerQuery = useQuery({
        queryKey: ["public-photographer-detail", photographerSlug],
        queryFn: () =>
            photographerService.getPublicPhotographerDetailBySlug(photographerSlug),
        enabled: Boolean(photographerSlug),
        retry: false,
    });

    if (!photographerSlug) {
        return (
            <BookingBriefPage
                prefill={{
                    sessionType: searchParams.sessionType,
                    location: searchParams.location,
                    date: searchParams.date,
                    budget: searchParams.budget,
                }}
            />
        );
    }

    return (
        <BookingRequestPage
            photographer={photographerQuery.data ?? null}
            isLoading={photographerQuery.isLoading}
            prefill={{
                sessionType: searchParams.sessionType,
                sessionDate: searchParams.date,
                location: searchParams.location,
                budget: searchParams.budget,
            }}
        />
    );
};