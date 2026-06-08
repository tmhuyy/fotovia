export const APPLICATION_DELIVERABLE_OPTIONS = [
    {
        id: "all_original_photos",
        label: "All original photos provided.",
        description: "The client receives all original photos after the shoot.",
        tone: "text",
    },
    {
        id: "makeup_hair_styling",
        label: "Make-up + Hair Styling",
        description:
            "The photographer can support make-up or basic hair styling.",
        tone: "chip",
    },
    {
        id: "studio_rental",
        label: "Studio Rental",
        description: "The photographer can arrange or include studio space.",
        tone: "chip",
    },
] as const;

export type ApplicationDeliverableId =
    (typeof APPLICATION_DELIVERABLE_OPTIONS)[number]["id"];

export const serializeApplicationDeliverables = (
    selectedIds: ApplicationDeliverableId[],
): string => {
    return APPLICATION_DELIVERABLE_OPTIONS.filter((option) =>
        selectedIds.includes(option.id),
    )
        .map((option) => option.label)
        .join("\n");
};

export const parseApplicationDeliverableIds = (
    value?: string | null,
): ApplicationDeliverableId[] => {
    if (!value?.trim()) {
        return [];
    }

    const normalizedValue = value.toLowerCase();

    return APPLICATION_DELIVERABLE_OPTIONS.filter((option) =>
        normalizedValue.includes(option.label.toLowerCase()),
    ).map((option) => option.id);
};

export const getApplicationDeliverableLabels = (
    value?: string | null,
): string[] => {
    const selectedIds = parseApplicationDeliverableIds(value);

    if (selectedIds.length === 0 && value?.trim()) {
        return value
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return APPLICATION_DELIVERABLE_OPTIONS.filter((option) =>
        selectedIds.includes(option.id),
    ).map((option) => option.label);
};

export const getApplicationServiceLabels = (
    value?: string | null,
): string[] => {
    const selectedIds = parseApplicationDeliverableIds(value);

    return APPLICATION_DELIVERABLE_OPTIONS.filter(
        (option) => selectedIds.includes(option.id) && option.tone === "chip",
    ).map((option) => option.label);
};
