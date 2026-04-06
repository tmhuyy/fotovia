"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "../../../components/ui/button";
import type { PhotographerPortfolioShowcaseItem } from "../types/photographer-detail.types";

interface PhotographerPortfolioViewerDialogProps
{
    item: PhotographerPortfolioShowcaseItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export const PhotographerPortfolioViewerDialog = ({
    item,
    isOpen,
    onClose,
}: PhotographerPortfolioViewerDialogProps) =>
{
    const [activeIndex, setActiveIndex] = useState(0);

    const images = useMemo(() =>
    {
        if (!item) return [];
        return [item.coverImageUrl, ...item.galleryImages].filter(Boolean);
    }, [item]);

    useEffect(() =>
    {
        if (isOpen) {
            setActiveIndex(0);
        }
    }, [isOpen, item?.id]);

    useEffect(() =>
    {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            if (!images.length) {
                return;
            }

            if (event.key === "ArrowRight") {
                setActiveIndex((current) => (current + 1) % images.length);
            }

            if (event.key === "ArrowLeft") {
                setActiveIndex((current) =>
                    current === 0 ? images.length - 1 : current - 1,
                );
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [images.length, isOpen, onClose]);

    if (!isOpen || !item) {
        return null;
    }

    const currentImageUrl = images[activeIndex] ?? item.coverImageUrl;
    const canNavigate = images.length > 1;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111111] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={item.title}
            >
                <button
                    type="button"
                    className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-xl text-white transition hover:bg-black/70"
                    onClick={onClose}
                    aria-label="Close portfolio viewer"
                >
                    ×
                </button>

                <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="flex min-h-[420px] items-center justify-center bg-black px-4 py-4">
                        <div className="relative flex h-full w-full items-center justify-center">
                            {canNavigate ? (
                                <button
                                    type="button"
                                    className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white transition hover:bg-black/70"
                                    onClick={() =>
                                        setActiveIndex((current) =>
                                            current === 0 ? images.length - 1 : current - 1,
                                        )
                                    }
                                    aria-label="Previous image"
                                >
                                    ‹
                                </button>
                            ) : null}

                            <img
                                src={currentImageUrl}
                                alt={`${item.title} image ${activeIndex + 1}`}
                                className="max-h-[74vh] max-w-full object-contain"
                            />

                            {canNavigate ? (
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-2xl text-white transition hover:bg-black/70"
                                    onClick={() =>
                                        setActiveIndex((current) => (current + 1) % images.length)
                                    }
                                    aria-label="Next image"
                                >
                                    ›
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-col gap-5 overflow-y-auto bg-[#171717] p-6 text-white">
                        <div className="space-y-3">
                            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                                {item.category}
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-serif text-3xl">{item.title}</h3>

                                {item.isFeatured ? (
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
                                        Featured
                                    </span>
                                ) : null}
                            </div>

                            <p className="text-sm leading-7 text-white/70">
                                {item.description || "Saved portfolio work from this photographer."}
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                                Viewer
                            </p>

                            <p className="mt-2 text-sm leading-6 text-white/75">
                                {images.length} image{images.length === 1 ? "" : "s"} in this
                                portfolio item. Use the arrows or your keyboard left/right keys
                                to browse.
                            </p>
                        </div>

                        {images.length ? (
                            <div className="space-y-3">
                                <p className="text-xs uppercase tracking-[0.22em] text-white/55">
                                    Thumbnails
                                </p>

                                <div className="grid grid-cols-3 gap-3">
                                    {images.map((imageUrl, index) =>
                                    {
                                        const isActive = index === activeIndex;

                                        return (
                                            <button
                                                key={`${item.id}-thumb-${index}`}
                                                type="button"
                                                className={`overflow-hidden rounded-xl border transition ${isActive
                                                        ? "border-white shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
                                                        : "border-white/10 opacity-80 hover:opacity-100"
                                                    }`}
                                                onClick={() => setActiveIndex(index)}
                                                aria-label={`View image ${index + 1}`}
                                            >
                                                <div className="aspect-[4/3] overflow-hidden bg-black">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`${item.title} thumbnail ${index + 1}`}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}

                        <Button
                            type="button"
                            variant="secondary"
                            className="mt-auto rounded-full border border-white/10 bg-white/10 text-white hover:bg-white/15"
                            onClick={onClose}
                        >
                            Close viewer
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};