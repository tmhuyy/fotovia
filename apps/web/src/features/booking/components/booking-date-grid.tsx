"use client";

import { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";

import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

const isSameDate = (firstDate: Date, secondDate: Date) =>
{
    return (
        firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate()
    );
};

const createMonthFromValue = (value?: string) =>
{
    if (value) {
        const parsedDate = new Date(`${value}T00:00:00`);

        if (!Number.isNaN(parsedDate.getTime())) {
            return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1);
        }
    }

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
        days: Array.from(
            { length: daysInMonth },
            (_, index) => new Date(year, month, index + 1),
        ),
    };
};

export const BookingDateGrid = () =>
{
    const {
        setValue,
        watch,
        formState: { errors },
    } = useFormContext<BookingBriefFormValues>();

    const selectedDateValue = watch("preferredDate");
    const [calendarMonth, setCalendarMonth] = useState<Date>(() =>
        createMonthFromValue(selectedDateValue),
    );

    const selectedDate = useMemo(() =>
    {
        if (!selectedDateValue) {
            return null;
        }

        const parsedDate = new Date(`${selectedDateValue}T00:00:00`);

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return parsedDate;
    }, [selectedDateValue]);

    const { blankDays, days } = useMemo(
        () => getCalendarDays(calendarMonth),
        [calendarMonth],
    );

    const today = startOfDay(new Date());

    const handlePreviousMonth = () =>
    {
        setCalendarMonth(
            new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() - 1,
                1,
            ),
        );
    };

    const handleNextMonth = () =>
    {
        setCalendarMonth(
            new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth() + 1,
                1,
            ),
        );
    };

    const handleSelectDate = (date: Date) =>
    {
        setValue("preferredDate", toDateValue(date), {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const errorMessage =
        typeof errors.preferredDate?.message === "string"
            ? errors.preferredDate.message
            : undefined;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
                <label className="text-base font-semibold text-foreground">
                    Expected shoot date <span className="text-red-500">*</span>
                </label>

                <p className="shrink-0 text-sm font-semibold text-foreground">
                    {selectedDateValue || "Not selected"}
                </p>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-surface p-4">
                <div className="mb-4 flex items-center justify-center gap-6">
                    <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-muted transition hover:bg-background hover:text-foreground"
                        onClick={handlePreviousMonth}
                        aria-label="Previous month"
                    >
                        ‹
                    </button>

                    <p className="min-w-44 text-center text-sm font-semibold text-foreground">
                        {MONTH_NAMES[calendarMonth.getMonth()]}{" "}
                        {calendarMonth.getFullYear()}
                    </p>

                    <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-muted transition hover:bg-background hover:text-foreground"
                        onClick={handleNextMonth}
                        aria-label="Next month"
                    >
                        ›
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center">
                    {WEEKDAY_LABELS.map((weekday) => (
                        <div
                            key={weekday}
                            className="text-xs font-semibold text-muted"
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
                        const isWeekend =
                            date.getDay() === 0 || date.getDay() === 6;

                        return (
                            <button
                                key={toDateValue(date)}
                                type="button"
                                disabled={isDisabled}
                                className={[
                                    "flex h-11 items-center justify-center rounded-2xl text-sm font-semibold transition",
                                    isSelected
                                        ? "bg-foreground text-background"
                                        : "bg-background text-foreground hover:bg-accent/20",
                                    isWeekend && !isSelected
                                        ? "bg-accent/10"
                                        : "",
                                    isDisabled
                                        ? "cursor-not-allowed bg-background text-muted/35 hover:bg-background"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() => handleSelectDate(date)}
                            >
                                {String(date.getDate()).padStart(2, "0")}
                            </button>
                        );
                    })}
                </div>
            </div>

            {errorMessage ? (
                <p className="text-xs font-medium text-red-600">
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
};