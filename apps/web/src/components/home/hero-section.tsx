"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../../store/auth.store";
import { Container } from "../layout/container";
import { Badge } from "../ui/badge";
import { buttonVariants } from "../ui/button";
import { getHomeDemoImage } from "./home-demo-images";
import { VIETNAM_LOCATION_OPTIONS } from "../../shared/data/vietnam-locations";

type BookingMenuKey = "type" | "date" | "location" | null;

interface BookingOption
{
    label: string;
    value: string;
}

interface IconProps
{
    className?: string;
}

const SHOOT_STYLE_LABELS = [
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
];

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const shootTypeOptions: BookingOption[] = SHOOT_STYLE_LABELS.map((label) => ({
    label,
    value: label,
}));

const quickStyleLinks = [
    { label: "Wedding", href: "/photographers?style=wedding" },
    { label: "Fashion", href: "/photographers?style=fashion" },
    { label: "Street", href: "/photographers?style=street" },
    { label: "Food", href: "/photographers?style=food" },
];

const photographerQuickActions = [
    { label: "Portfolio", href: "/photographer/portfolio" },
    { label: "Add work", href: "/photographer/portfolio/new" },
    { label: "Booking requests", href: "/photographer/bookings" },
];

const photographerPanelItems = [
    {
        label: "01",
        title: "Show your best work",
        description:
            "Keep your public portfolio focused on the photography jobs you want clients to request.",
    },
    {
        label: "02",
        title: "Let AI read the style",
        description:
            "Fotovia uses uploaded cover and gallery images to prepare style signals for discovery.",
    },
    {
        label: "03",
        title: "Respond to clients",
        description:
            "Review booking requests after clients find your portfolio and decide the visual fit is right.",
    },
];

const toTitleCase = (value: string) =>
{
    return value
        .split(/[\s-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
};

const startOfDay = (date: Date) =>
{
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const toDateValue = (date: Date) =>
{
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const toDateLabel = (date: Date) =>
{
    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const isSameDate = (firstDate: Date, secondDate: Date) =>
{
    return (
        firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate()
    );
};

const createInitialCalendarMonth = () =>
{
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
};

const getCalendarDays = (monthDate: Date) =>
{
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const mondayBasedBlankCount = (firstDay.getDay() + 6) % 7;

    return {
        blankDays: Array.from({ length: mondayBasedBlankCount }),
        days: Array.from({ length: daysInMonth }, (_, index) =>
            new Date(year, month, index + 1),
        ),
    };
};

const CameraIcon = ({ className = "h-5 w-5" }: IconProps) =>
{
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.8l1.4-2h4.6l1.4 2h1.8A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
            <path d="M12 15.5a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
        </svg>
    );
};

const CalendarIcon = ({ className = "h-5 w-5" }: IconProps) =>
{
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M7 3v4" />
            <path d="M17 3v4" />
            <path d="M4 8h16" />
            <path d="M6.5 5h11A2.5 2.5 0 0 1 20 7.5v10A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-10A2.5 2.5 0 0 1 6.5 5Z" />
        </svg>
    );
};

const LocationIcon = ({ className = "h-5 w-5" }: IconProps) =>
{
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M12 21s7-5.1 7-11.2A7 7 0 0 0 5 9.8C5 15.9 12 21 12 21Z" />
            <path d="M12 12.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" />
        </svg>
    );
};

const ArrowRightIcon = ({ className = "h-5 w-5" }: IconProps) =>
{
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    );
};

const PhotographerHeroPanel = () =>
{
    return (
        <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-border" />
                </div>

                <p className="text-xs uppercase tracking-[0.32em] text-muted">
                    Photographer home
                </p>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
                <div className="rounded-[1.5rem] border border-border bg-background p-6">
                    <Badge variant="ai">AI style analysis</Badge>

                    <div className="mt-8 space-y-3">
                        <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                            Your portfolio is the storefront.
                        </h2>

                        <p className="text-sm leading-7 text-muted">
                            Upload real work, keep your public info ready, and let
                            Fotovia turn your images into style signals clients can
                            browse.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3">
                    {photographerPanelItems.map((item) => (
                        <div
                            key={item.label}
                            className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-background px-4 py-4"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-muted">
                                {item.label}
                            </span>

                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                    {item.title}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ClientHeroBanner = () =>
{
    const mainImage = getHomeDemoImage(0);

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
            <div className="relative h-[28rem] overflow-hidden bg-background sm:h-[34rem] lg:h-[38rem]">
                <img
                    src={mainImage.src}
                    alt={mainImage.alt}
                    className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,23,23,0.68),rgba(23,23,23,0.28),rgba(23,23,23,0.08))]" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground/82 via-foreground/40 to-transparent" />

                <div className="absolute left-5 top-5 rounded-full bg-surface/90 px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
                    AI style ready
                </div>

                <div className="absolute bottom-24 left-6 right-6 max-w-3xl text-background sm:bottom-28 sm:left-10 lg:left-14">
                    <p className="hidden text-xs uppercase tracking-[0.3em] text-background/70 sm:block">
                        Fotovia booking
                    </p>

                    <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                        Book the right photographer faster.
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-8 text-background/78 sm:text-lg">
                        Choose your shoot style, date, and location. Fotovia helps
                        you compare real portfolio work before sending a clear
                        booking request.
                    </p>
                </div>
            </div>
        </div>
    );
};

const OptionDropdown = ({
    options,
    onSelect,
    formatLabel = (value) => value,
    className = "absolute left-0 top-[calc(100%+0.75rem)] w-72",
}: {
    options: BookingOption[];
    onSelect: (option: BookingOption) => void;
    formatLabel?: (value: string) => string;
    className?: string;
}) =>
{
    return (
        <div
            className={`${className} z-50 rounded-[1.5rem] border border-border bg-surface p-2 shadow-2xl`}
        >
            <div className="max-h-72 overflow-y-auto">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className="flex w-full items-center rounded-2xl px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-background"
                        onClick={() => onSelect(option)}
                    >
                        {formatLabel(option.label)}
                    </button>
                ))}
            </div>
        </div>
    );
};

const DateCalendarDropdown = ({
    calendarMonth,
    selectedDate,
    onChangeMonth,
    onSelectDate,
    className = "absolute left-1/2 top-[calc(100%+0.75rem)] w-[22rem] -translate-x-1/2",
}: {
    calendarMonth: Date;
    selectedDate: Date | null;
    onChangeMonth: (nextMonth: Date) => void;
    onSelectDate: (date: Date) => void;
    className?: string;
}) =>
{
    const { blankDays, days } = getCalendarDays(calendarMonth);
    const today = startOfDay(new Date());

    const handlePreviousMonth = () =>
    {
        onChangeMonth(
            new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() - 1,
                1,
            ),
        );
    };

    const handleNextMonth = () =>
    {
        onChangeMonth(
            new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() + 1,
                1,
            ),
        );
    };

    return (
        <div
            className={`${className} z-50 rounded-[1.5rem] border border-border bg-surface p-4 shadow-2xl`}
        >
            <div className="flex items-center justify-between gap-3">
                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
                    onClick={handlePreviousMonth}
                    aria-label="Previous month"
                >
                    ‹
                </button>

                <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                        {MONTH_NAMES[calendarMonth.getMonth()]}{" "}
                        {calendarMonth.getFullYear()}
                    </p>
                </div>

                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                >
                    ›
                </button>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                {WEEKDAY_LABELS.map((weekday) => (
                    <div
                        key={weekday}
                        className="py-2 text-xs font-medium text-muted"
                    >
                        {weekday}
                    </div>
                ))}

                {blankDays.map((_, index) => (
                    <div key={`blank-${index}`} />
                ))}

                {days.map((date) =>
                {
                    const isDisabled = startOfDay(date) < today;
                    const isSelected =
                        selectedDate !== null && isSameDate(date, selectedDate);
                    const isToday = isSameDate(date, today);

                    return (
                        <button
                            key={toDateValue(date)}
                            type="button"
                            disabled={isDisabled}
                            className={[
                                "flex h-10 items-center justify-center rounded-xl text-sm font-medium transition",
                                isSelected
                                    ? "bg-foreground text-background"
                                    : "text-foreground hover:bg-background",
                                isToday && !isSelected
                                    ? "border border-border"
                                    : "",
                                isDisabled
                                    ? "cursor-not-allowed text-muted/40 hover:bg-transparent"
                                    : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            onClick={() => onSelectDate(date)}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
const HeroBookingBar = () =>
{
    const router = useRouter();
    const bookingBarRef = useRef<HTMLDivElement | null>(null);

    const [activeMenu, setActiveMenu] = useState<BookingMenuKey>(null);
    const [selectedShootType, setSelectedShootType] =
        useState<BookingOption | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedLocation, setSelectedLocation] =
        useState<BookingOption | null>(null);
    const [calendarMonth, setCalendarMonth] = useState<Date>(
        createInitialCalendarMonth,
    );

    useEffect(() =>
    {
        const handlePointerDown = (event: MouseEvent) =>
        {
            if (!bookingBarRef.current?.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };

        const handleEscape = (event: KeyboardEvent) =>
        {
            if (event.key === "Escape") {
                setActiveMenu(null);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);

        return () =>
        {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleBookNow = () =>
    {
        const params = new URLSearchParams();

        if (selectedShootType) {
            params.set("style", selectedShootType.value);
        }

        if (selectedDate) {
            params.set("date", toDateValue(selectedDate));
        }

        if (selectedLocation) {
            params.set("location", selectedLocation.value);
        }

        const queryString = params.toString();

        router.push(queryString ? `/bookings/new?${queryString}` : "/bookings/new");
    };

    const handleSelectShootType = (option: BookingOption) =>
    {
        setSelectedShootType(option);
        setActiveMenu(null);
    };

    const handleSelectDate = (date: Date) =>
    {
        setSelectedDate(date);
        setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        setActiveMenu(null);
    };

    const handleSelectLocation = (option: BookingOption) =>
    {
        setSelectedLocation(option);
        setActiveMenu(null);
    };

    const fieldClassName = (menuKey: BookingMenuKey) =>
    {
        return [
            "flex h-14 w-full items-center justify-start gap-3 rounded-2xl px-4 text-left transition hover:bg-background md:h-16 md:rounded-[1.25rem] md:bg-transparent md:px-5",
            activeMenu === menuKey
                ? "ring-1 ring-foreground/10 md:bg-background md:ring-2"
                : "",
        ]
            .filter(Boolean)
            .join(" ");
    };

    return (
        <div
            ref={bookingBarRef}
            className="relative z-20 mx-auto -mt-14 max-w-[980px] px-5 sm:px-6 md:-mt-12"
        >
            <div className="rounded-[1.5rem] border border-border/70 bg-[#f6f8fb] p-3 shadow-[0_24px_70px_rgba(23,23,23,0.18)] md:rounded-[1.75rem] md:bg-surface md:p-2">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-[1fr_1fr_1fr_220px] md:items-center md:gap-2">
                    <div className="relative">
                        <button
                            type="button"
                            className={fieldClassName("type")}
                            onClick={() =>
                                setActiveMenu((current) =>
                                    current === "type" ? null : "type",
                                )
                            }
                        >
                            <CameraIcon className="h-5 w-5 shrink-0 text-foreground" />

                            <span className="min-w-0 truncate text-base font-semibold text-foreground">
                                {selectedShootType
                                    ? toTitleCase(selectedShootType.label)
                                    : "Shoot Type"}
                            </span>
                        </button>

                        {activeMenu === "type" ? (
                            <div className="hidden md:block">
                                <OptionDropdown
                                    options={shootTypeOptions}
                                    formatLabel={toTitleCase}
                                    onSelect={handleSelectShootType}
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            className={fieldClassName("date")}
                            onClick={() =>
                                setActiveMenu((current) =>
                                    current === "date" ? null : "date",
                                )
                            }
                        >
                            <CalendarIcon className="h-5 w-5 shrink-0 text-foreground" />

                            <span className="min-w-0 truncate text-base font-semibold text-foreground">
                                {selectedDate ? toDateLabel(selectedDate) : "Date"}
                            </span>
                        </button>

                        {activeMenu === "date" ? (
                            <div className="hidden md:block">
                                <DateCalendarDropdown
                                    calendarMonth={calendarMonth}
                                    selectedDate={selectedDate}
                                    onChangeMonth={setCalendarMonth}
                                    onSelectDate={handleSelectDate}
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            className={fieldClassName("location")}
                            onClick={() =>
                                setActiveMenu((current) =>
                                    current === "location" ? null : "location",
                                )
                            }
                        >
                            <LocationIcon className="h-5 w-5 shrink-0 text-foreground" />

                            <span className="min-w-0 truncate text-base font-semibold text-foreground">
                                {selectedLocation?.label ?? "Location"}
                            </span>
                        </button>

                        {activeMenu === "location" ? (
                            <div className="hidden md:block">
                                <OptionDropdown
                                    options={VIETNAM_LOCATION_OPTIONS}
                                    onSelect={handleSelectLocation}
                                />
                            </div>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#ff5a1f] px-4 text-base font-semibold text-white transition hover:bg-[#e94f17] md:h-16 md:rounded-[1.25rem] md:bg-foreground md:px-6 md:text-background md:hover:bg-foreground/85"
                        onClick={handleBookNow}
                    >
                        <ArrowRightIcon className="h-5 w-5" />
                        <span>Book now</span>
                    </button>
                </div>

                {activeMenu === "type" ? (
                    <div className="md:hidden">
                        <OptionDropdown
                            className="relative mt-3 w-full"
                            options={shootTypeOptions}
                            formatLabel={toTitleCase}
                            onSelect={handleSelectShootType}
                        />
                    </div>
                ) : null}

                {activeMenu === "date" ? (
                    <div className="md:hidden">
                        <DateCalendarDropdown
                            className="relative mt-3 w-full"
                            calendarMonth={calendarMonth}
                            selectedDate={selectedDate}
                            onChangeMonth={setCalendarMonth}
                            onSelectDate={handleSelectDate}
                        />
                    </div>
                ) : null}

                {activeMenu === "location" ? (
                    <div className="md:hidden">
                        <OptionDropdown
                            className="relative mt-3 w-full"
                            options={VIETNAM_LOCATION_OPTIONS}
                            onSelect={handleSelectLocation}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
};

const ClientHeroExperience = () =>
{
    return (
        <div>
            <ClientHeroBanner />
            <HeroBookingBar />

            {/* <div className="mt-8 flex flex-wrap justify-center gap-2">
                {quickStyleLinks.map((entry) => (
                    <Link
                        key={entry.label}
                        href={entry.href}
                        className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
                    >
                        {entry.label}
                    </Link>
                ))}
            </div> */}
        </div>
    );
};

export const HeroSection = () =>
{
    const { user, isAuthenticated, hasHydrated, isHydrating } = useAuthStore();

    const isPhotographerHome =
        hasHydrated &&
        !isHydrating &&
        isAuthenticated &&
        user?.role === "photographer";

    return (
        <section className="overflow-visible pb-12 pt-8 sm:pb-16 sm:pt-12">
            <Container>
                {isPhotographerHome ? (
                    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:items-center lg:gap-16">
                        <div className="space-y-8">
                            <div className="space-y-5">
                                <Badge variant="neutral">
                                    Photographer tools
                                </Badge>

                                <div className="space-y-5">
                                    <h1 className="max-w-4xl font-serif text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                                        Manage your photography portfolio.
                                    </h1>

                                    <p className="max-w-2xl text-base leading-8 text-muted sm:text-lg">
                                        Upload your best work, let Fotovia analyze
                                        your visual style, and keep your public
                                        profile ready for real booking requests.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/photographer/portfolio"
                                    className={buttonVariants({
                                        size: "lg",
                                        className: "rounded-full",
                                    })}
                                >
                                    Open my portfolio
                                </Link>

                                <Link
                                    href="/photographer/portfolio/new"
                                    className={buttonVariants({
                                        size: "lg",
                                        variant: "secondary",
                                        className: "rounded-full",
                                    })}
                                >
                                    Add work
                                </Link>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                                    Quick photographer actions
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {photographerQuickActions.map((entry) => (
                                        <Link
                                            key={entry.label}
                                            href={entry.href}
                                            className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent"
                                        >
                                            {entry.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <PhotographerHeroPanel />
                    </div>
                ) : (
                    <ClientHeroExperience />
                )}
            </Container>
        </section>
    );
};