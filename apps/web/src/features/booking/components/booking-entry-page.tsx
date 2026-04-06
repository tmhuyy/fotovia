"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { photographerService } from "../../../services/photographer.service";
import { BookingBriefPage } from "./booking-brief-page";
import { BookingRequestPage } from "./booking-request-page";

const readParam = (
    params: URLSearchParams,
    key: string,
): string | undefined =>
{
    const value = params.get(key);

    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

export const BookingEntryPage = () =>
{
    const searchParams = useSearchParams();
    const searchKey = searchParams.toString();

    const resolvedParams = useMemo(() =>
    {
        const params = new URLSearchParams(searchKey);

        return {
            photographerSlug: readParam(params, "photographerSlug"),
            sessionType: readParam(params, "sessionType"),
            location: readParam(params, "location"),
            date: readParam(params, "date"),
            budget: readParam(params, "budget"),
        };
    }, [searchKey]);

    const photographerSlug = resolvedParams.photographerSlug ?? "";

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
                    sessionType: resolvedParams.sessionType,
                    location: resolvedParams.location,
                    date: resolvedParams.date,
                    budget: resolvedParams.budget,
                }}
            />
        );
    }

    return (
        <BookingRequestPage
            photographer={photographerQuery.data ?? null}
            isLoading={photographerQuery.isLoading}
            prefill={{
                sessionType: resolvedParams.sessionType,
                sessionDate: resolvedParams.date,
                location: resolvedParams.location,
                budget: resolvedParams.budget,
            }}
        />
    );
};