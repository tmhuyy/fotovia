"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { photographerService } from "../../../services/photographer.service";
import { BookingBriefPage } from "./booking-brief-page";

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
            shootType: readParam(params, "shootType"),
            style: readParam(params, "style"),
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

    return (
        <BookingBriefPage
            selectedPhotographer={
                photographerSlug ? photographerQuery.data ?? null : null
            }
            isSelectedPhotographerLoading={
                Boolean(photographerSlug) && photographerQuery.isLoading
            }
            selectedPhotographerError={
                Boolean(photographerSlug) && photographerQuery.isError
            }
            prefill={{
                sessionType: resolvedParams.sessionType,
                shootType: resolvedParams.shootType,
                style: resolvedParams.style,
                location: resolvedParams.location,
                date: resolvedParams.date,
                budget: resolvedParams.budget,
            }}
        />
    );
};