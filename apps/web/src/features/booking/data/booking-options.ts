export const aiShootTypeLabels = [
    "aerial",
    "architecture",
    "event",
    "fashion",
    "food",
    "nature",
    "sports",
    "street",
    "wedding",
    "wildlife",
] as const;

export const shootTypeOptions = [
    {
        value: "aerial",
        label: "Aerial",
        subtitle: "Drone / overhead",
        visual: "🚁",
    },
    {
        value: "architecture",
        label: "Architecture",
        subtitle: "Buildings / spaces",
        visual: "🏛️",
    },
    {
        value: "event",
        label: "Event",
        subtitle: "Ceremony / gathering",
        visual: "🎉",
    },
    {
        value: "fashion",
        label: "Fashion",
        subtitle: "Editorial / outfit",
        visual: "✨",
    },
    {
        value: "food",
        label: "Food",
        subtitle: "Restaurant / product",
        visual: "🍽️",
    },
    {
        value: "nature",
        label: "Nature",
        subtitle: "Outdoor / landscape",
        visual: "🌿",
    },
    {
        value: "sports",
        label: "Sports",
        subtitle: "Action / movement",
        visual: "🏅",
    },
    {
        value: "street",
        label: "Street",
        subtitle: "Urban / candid",
        visual: "🏙️",
    },
    {
        value: "wedding",
        label: "Wedding",
        subtitle: "Couple / ceremony",
        visual: "💍",
    },
    {
        value: "wildlife",
        label: "Wildlife",
        subtitle: "Animal / nature",
        visual: "🦌",
    },
];

export const styleOptions = shootTypeOptions;

// Backward-compatible alias.
// Older direct booking components still import sessionTypeOptions,
// but the actual values should now be Fotovia AI shoot types.
export const sessionTypeOptions = shootTypeOptions;

export const budgetOptions = [
    { value: "flexible", label: "Flexible" },
    { value: "500000-1000000", label: "500.000 VND - 1.000.000 VND" },
    { value: "1000000-1500000", label: "1.000.000 VND - 1.500.000 VND" },
    { value: "1500000-2500000", label: "1.500.000 VND - 2.500.000 VND" },
    { value: "2500000-5000000", label: "2.500.000 VND - 5.000.000 VND" },
    { value: "over-5000000", label: "Over 5.000.000 VND" },
];

export const durationOptions = [
    { value: "60", label: "1 hour" },
    { value: "90", label: "90 minutes" },
    { value: "120", label: "2 hours" },
    { value: "180", label: "3 hours" },
    { value: "240", label: "Half day" },
    { value: "480", label: "Full day" },
];

export const contactOptions = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "either", label: "Either email or phone" },
];
