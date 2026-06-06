export const BOOKING_ADDITIONAL_SERVICE_LABELS = {
    makeup_hair: 'Make-up + Hair Styling',
    studio_rental: 'Studio Rental',
} as const;

type BookingAdditionalServiceKey =
    keyof typeof BOOKING_ADDITIONAL_SERVICE_LABELS;

const serviceAliases: Record<BookingAdditionalServiceKey, string[]> = {
    makeup_hair: [
        'makeup_hair',
        'make-up',
        'make up',
        'makeup',
        'hair',
        'hair styling',
        'tóc',
        'làm tóc',
        'trang điểm',
        'make-up + hair styling',
    ],
    studio_rental: ['studio_rental', 'studio', 'studio rental', 'thuê studio'],
};

const normalizeSearchText = (value: string): string =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

export const normalizeBookingAdditionalServices = (
    value?: string | null,
): string | null => {
    if (!value?.trim()) {
        return null;
    }

    const normalizedValue = normalizeSearchText(value);
    const selectedKeys: BookingAdditionalServiceKey[] = [];

    Object.entries(serviceAliases).forEach(([key, aliases]) => {
        const hasMatch = aliases.some((alias) =>
            normalizedValue.includes(normalizeSearchText(alias)),
        );

        if (hasMatch) {
            selectedKeys.push(key as BookingAdditionalServiceKey);
        }
    });

    if (selectedKeys.length === 0) {
        return null;
    }

    return selectedKeys
        .map((key) => BOOKING_ADDITIONAL_SERVICE_LABELS[key])
        .join('\n');
};
