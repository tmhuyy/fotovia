export const additionalServiceValues = [
    "makeup_hair",
    "studio_rental",
] as const;

export type AdditionalServiceValue = (typeof additionalServiceValues)[number];

export interface AdditionalServiceOption {
    value: AdditionalServiceValue;
    label: string;
    description: string;
}

export const additionalServiceOptions: AdditionalServiceOption[] = [
    {
        value: "makeup_hair",
        label: "Make-up + Hair Styling",
        description:
            "Help with make-up, hair styling, or basic look preparation.",
    },
    {
        value: "studio_rental",
        label: "Studio Rental",
        description: "Include a studio space in the estimated quote.",
    },
];

const additionalServiceValueSet = new Set<string>(additionalServiceValues);

const normalizeSearchText = (value: string): string =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

const serviceAliases: Record<AdditionalServiceValue, string[]> = {
    makeup_hair: [
        "makeup_hair",
        "make-up",
        "make up",
        "makeup",
        "hair",
        "hair styling",
        "lam toc",
        "toc",
        "trang diem",
        "Make-up + Hair Styling",
    ],
    studio_rental: [
        "studio_rental",
        "studio",
        "studio rental",
        "thue studio",
        "Studio Rental",
    ],
};

export const isAdditionalServiceValue = (
    value: unknown,
): value is AdditionalServiceValue =>
    typeof value === "string" && additionalServiceValueSet.has(value);

export const getAdditionalServiceLabelsFromValues = (
    values?: readonly string[],
): string[] => {
    if (!values || values.length === 0) {
        return [];
    }

    const selected = new Set(values.filter(isAdditionalServiceValue));

    return additionalServiceOptions
        .filter((option) => selected.has(option.value))
        .map((option) => option.label);
};

export const serializeAdditionalServices = (
    values?: readonly string[],
): string | undefined => {
    const labels = getAdditionalServiceLabelsFromValues(values);

    if (labels.length === 0) {
        return undefined;
    }

    return labels.join("\n");
};

export const parseAdditionalServiceValues = (
    notes?: string | null,
): AdditionalServiceValue[] => {
    if (!notes?.trim()) {
        return [];
    }

    const normalizedNotes = normalizeSearchText(notes);
    const matchedValues: AdditionalServiceValue[] = [];

    additionalServiceOptions.forEach((option) => {
        const aliases = serviceAliases[option.value];

        const hasMatch = aliases.some((alias) =>
            normalizedNotes.includes(normalizeSearchText(alias)),
        );

        if (hasMatch) {
            matchedValues.push(option.value);
        }
    });

    return matchedValues;
};

export const getAdditionalServiceLabels = (notes?: string | null): string[] => {
    const parsedValues = parseAdditionalServiceValues(notes);

    return getAdditionalServiceLabelsFromValues(parsedValues);
};
