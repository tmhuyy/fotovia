export type VietnamLocationRegion =
    | "north"
    | "north-central"
    | "central"
    | "south-central"
    | "southeast"
    | "southwest";

export interface VietnamLocationOption {
    label: string;
    value: string;
    region: VietnamLocationRegion;
    aliases: string[];
    isMajor?: boolean;
}

export const VIETNAM_LOCATION_OPTIONS: VietnamLocationOption[] = [
    {
        label: "Hà Nội",
        value: "Hà Nội",
        region: "north",
        aliases: ["Ha Noi", "Hanoi"],
        isMajor: true,
    },
    {
        label: "TP. Hồ Chí Minh",
        value: "TP. Hồ Chí Minh",
        region: "southeast",
        aliases: ["Ho Chi Minh City", "HCMC", "TPHCM", "Sai Gon", "Sài Gòn"],
        isMajor: true,
    },
    {
        label: "Đà Nẵng",
        value: "Đà Nẵng",
        region: "central",
        aliases: ["Da Nang"],
        isMajor: true,
    },
    {
        label: "Hải Phòng",
        value: "Hải Phòng",
        region: "north",
        aliases: ["Hai Phong"],
        isMajor: true,
    },
    {
        label: "Cần Thơ",
        value: "Cần Thơ",
        region: "southwest",
        aliases: ["Can Tho"],
        isMajor: true,
    },
    {
        label: "Huế",
        value: "Huế",
        region: "central",
        aliases: ["Hue", "Thua Thien Hue", "Thừa Thiên Huế"],
        isMajor: true,
    },
    {
        label: "An Giang",
        value: "An Giang",
        region: "southwest",
        aliases: [],
    },
    {
        label: "Bắc Ninh",
        value: "Bắc Ninh",
        region: "north",
        aliases: ["Bac Ninh"],
    },
    {
        label: "Cà Mau",
        value: "Cà Mau",
        region: "southwest",
        aliases: ["Ca Mau"],
    },
    {
        label: "Cao Bằng",
        value: "Cao Bằng",
        region: "north",
        aliases: ["Cao Bang"],
    },
    {
        label: "Đắk Lắk",
        value: "Đắk Lắk",
        region: "central",
        aliases: ["Dak Lak", "Đắc Lắc"],
    },
    {
        label: "Điện Biên",
        value: "Điện Biên",
        region: "north",
        aliases: ["Dien Bien"],
    },
    {
        label: "Đồng Nai",
        value: "Đồng Nai",
        region: "southeast",
        aliases: ["Dong Nai"],
    },
    {
        label: "Đồng Tháp",
        value: "Đồng Tháp",
        region: "southwest",
        aliases: ["Dong Thap"],
    },
    {
        label: "Gia Lai",
        value: "Gia Lai",
        region: "central",
        aliases: [],
    },
    {
        label: "Hà Tĩnh",
        value: "Hà Tĩnh",
        region: "north-central",
        aliases: ["Ha Tinh"],
    },
    {
        label: "Hưng Yên",
        value: "Hưng Yên",
        region: "north",
        aliases: ["Hung Yen"],
    },
    {
        label: "Khánh Hòa",
        value: "Khánh Hòa",
        region: "south-central",
        aliases: ["Khanh Hoa"],
    },
    {
        label: "Lai Châu",
        value: "Lai Châu",
        region: "north",
        aliases: ["Lai Chau"],
    },
    {
        label: "Lâm Đồng",
        value: "Lâm Đồng",
        region: "central",
        aliases: ["Lam Dong"],
    },
    {
        label: "Lạng Sơn",
        value: "Lạng Sơn",
        region: "north",
        aliases: ["Lang Son"],
    },
    {
        label: "Lào Cai",
        value: "Lào Cai",
        region: "north",
        aliases: ["Lao Cai"],
    },
    {
        label: "Nghệ An",
        value: "Nghệ An",
        region: "north-central",
        aliases: ["Nghe An"],
    },
    {
        label: "Ninh Bình",
        value: "Ninh Bình",
        region: "north",
        aliases: ["Ninh Binh"],
    },
    {
        label: "Phú Thọ",
        value: "Phú Thọ",
        region: "north",
        aliases: ["Phu Tho"],
    },
    {
        label: "Quảng Ngãi",
        value: "Quảng Ngãi",
        region: "south-central",
        aliases: ["Quang Ngai"],
    },
    {
        label: "Quảng Ninh",
        value: "Quảng Ninh",
        region: "north",
        aliases: ["Quang Ninh"],
    },
    {
        label: "Quảng Trị",
        value: "Quảng Trị",
        region: "north-central",
        aliases: ["Quang Tri"],
    },
    {
        label: "Sơn La",
        value: "Sơn La",
        region: "north",
        aliases: ["Son La"],
    },
    {
        label: "Tây Ninh",
        value: "Tây Ninh",
        region: "southeast",
        aliases: ["Tay Ninh"],
    },
    {
        label: "Thái Nguyên",
        value: "Thái Nguyên",
        region: "north",
        aliases: ["Thai Nguyen"],
    },
    {
        label: "Thanh Hóa",
        value: "Thanh Hóa",
        region: "north-central",
        aliases: ["Thanh Hoa"],
    },
    {
        label: "Tuyên Quang",
        value: "Tuyên Quang",
        region: "north",
        aliases: ["Tuyen Quang"],
    },
    {
        label: "Vĩnh Long",
        value: "Vĩnh Long",
        region: "southwest",
        aliases: ["Vinh Long"],
    },
];

export const DEFAULT_VIETNAM_LOCATION = VIETNAM_LOCATION_OPTIONS[0];

export const VIETNAM_MAJOR_LOCATION_OPTIONS = VIETNAM_LOCATION_OPTIONS.filter(
    (location) => location.isMajor,
);

const normalizeSearchText = (value: string) => {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
};

export const searchVietnamLocations = (query: string) => {
    const normalizedQuery = normalizeSearchText(query);

    if (!normalizedQuery) {
        return VIETNAM_LOCATION_OPTIONS;
    }

    return VIETNAM_LOCATION_OPTIONS.filter((location) => {
        const searchableValues = [
            location.label,
            location.value,
            ...location.aliases,
        ];

        return searchableValues.some((value) =>
            normalizeSearchText(value).includes(normalizedQuery),
        );
    });
};

export const findVietnamLocationByValue = (value: string) => {
    const normalizedValue = normalizeSearchText(value);

    return VIETNAM_LOCATION_OPTIONS.find((location) => {
        const searchableValues = [
            location.label,
            location.value,
            ...location.aliases,
        ];

        return searchableValues.some(
            (searchableValue) =>
                normalizeSearchText(searchableValue) === normalizedValue,
        );
    });
};
