export interface VietnamLocationOption {
    label: string;
    value: string;
    aliases: string[];
    isMajor?: boolean;
}

export const VIETNAM_LOCATION_OPTIONS: VietnamLocationOption[] = [
    {
        label: "Hà Nội",
        value: "Hà Nội",
        aliases: ["Ha Noi", "Hanoi"],
        isMajor: true,
    },
    {
        label: "TP. Hồ Chí Minh",
        value: "TP. Hồ Chí Minh",
        aliases: ["Ho Chi Minh City", "HCMC", "TPHCM", "Sài Gòn", "Sai Gon"],
        isMajor: true,
    },
    {
        label: "Đà Nẵng",
        value: "Đà Nẵng",
        aliases: ["Da Nang"],
        isMajor: true,
    },
    {
        label: "Hải Phòng",
        value: "Hải Phòng",
        aliases: ["Hai Phong"],
        isMajor: true,
    },
    {
        label: "Cần Thơ",
        value: "Cần Thơ",
        aliases: ["Can Tho"],
        isMajor: true,
    },
    {
        label: "Huế",
        value: "Huế",
        aliases: ["Hue", "Thừa Thiên Huế", "Thua Thien Hue"],
        isMajor: true,
    },
    { label: "An Giang", value: "An Giang", aliases: [] },
    { label: "Bắc Ninh", value: "Bắc Ninh", aliases: ["Bac Ninh"] },
    { label: "Cà Mau", value: "Cà Mau", aliases: ["Ca Mau"] },
    { label: "Cao Bằng", value: "Cao Bằng", aliases: ["Cao Bang"] },
    { label: "Đắk Lắk", value: "Đắk Lắk", aliases: ["Dak Lak", "Đắc Lắc"] },
    { label: "Điện Biên", value: "Điện Biên", aliases: ["Dien Bien"] },
    { label: "Đồng Nai", value: "Đồng Nai", aliases: ["Dong Nai"] },
    { label: "Đồng Tháp", value: "Đồng Tháp", aliases: ["Dong Thap"] },
    { label: "Gia Lai", value: "Gia Lai", aliases: [] },
    { label: "Hà Tĩnh", value: "Hà Tĩnh", aliases: ["Ha Tinh"] },
    { label: "Hưng Yên", value: "Hưng Yên", aliases: ["Hung Yen"] },
    { label: "Khánh Hòa", value: "Khánh Hòa", aliases: ["Khanh Hoa"] },
    { label: "Lai Châu", value: "Lai Châu", aliases: ["Lai Chau"] },
    { label: "Lâm Đồng", value: "Lâm Đồng", aliases: ["Lam Dong"] },
    { label: "Lạng Sơn", value: "Lạng Sơn", aliases: ["Lang Son"] },
    { label: "Lào Cai", value: "Lào Cai", aliases: ["Lao Cai"] },
    { label: "Nghệ An", value: "Nghệ An", aliases: ["Nghe An"] },
    { label: "Ninh Bình", value: "Ninh Bình", aliases: ["Ninh Binh"] },
    { label: "Phú Thọ", value: "Phú Thọ", aliases: ["Phu Tho"] },
    { label: "Quảng Ngãi", value: "Quảng Ngãi", aliases: ["Quang Ngai"] },
    { label: "Quảng Ninh", value: "Quảng Ninh", aliases: ["Quang Ninh"] },
    { label: "Quảng Trị", value: "Quảng Trị", aliases: ["Quang Tri"] },
    { label: "Sơn La", value: "Sơn La", aliases: ["Son La"] },
    { label: "Tây Ninh", value: "Tây Ninh", aliases: ["Tay Ninh"] },
    { label: "Thái Nguyên", value: "Thái Nguyên", aliases: ["Thai Nguyen"] },
    { label: "Thanh Hóa", value: "Thanh Hóa", aliases: ["Thanh Hoa"] },
    { label: "Tuyên Quang", value: "Tuyên Quang", aliases: ["Tuyen Quang"] },
    { label: "Vĩnh Long", value: "Vĩnh Long", aliases: ["Vinh Long"] },
];

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
