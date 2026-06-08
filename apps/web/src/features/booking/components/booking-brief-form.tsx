"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { VIETNAM_LOCATION_OPTIONS } from "../../../shared/data/vietnam-locations";
import { contactOptions, shootTypeOptions } from "../data/booking-options";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";
import { BookingAdditionalServicesField } from "./booking-additional-services-field";
import { BookingBudgetRangeField } from "./booking-budget-range-field";
import { BookingDateGrid } from "./booking-date-grid";

const FieldError = ({ message }: { message?: string }) =>
{
  if (!message) {
    return null;
  }

  return <p className="text-xs font-medium text-red-600">{message}</p>;
};

const getErrorMessage = (
  errors: Record<string, { message?: unknown }>,
  name: keyof BookingBriefFormValues,
) =>
{
  const message = errors[name]?.message;

  return typeof message === "string" ? message : undefined;
};

export const BookingBriefForm = () =>
{
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<BookingBriefFormValues>();

  const selectedShootType = useWatch({
    control,
    name: "shootType",
  });

  const concept = useWatch({
    control,
    name: "concept",
  });

  const normalizedErrors = errors as Record<string, { message?: unknown }>;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1 px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Step 01
          </p>

          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Choose your shoot type.
          </h2>
        </CardHeader>

        <CardContent className="space-y-4 px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {shootTypeOptions.map((option) =>
            {
              const isSelected = selectedShootType === option.value;

              return (
                <label
                  key={option.value}
                  className={[
                    "group min-w-0 cursor-pointer overflow-hidden rounded-[1.25rem] border bg-background transition",
                    isSelected
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-border hover:border-accent/50",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register("shootType")}
                  />

                  <div className="flex h-full min-w-0 flex-col">
                    <div className="flex h-20 items-center justify-center bg-gradient-to-br from-background via-surface to-accent/20 text-3xl">
                      {option.visual}
                    </div>

                    <div className="min-w-0 space-y-1 p-3 text-center">
                      <p
                        className={[
                          "truncate text-sm font-semibold",
                          isSelected
                            ? "text-accent"
                            : "text-foreground",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {option.label}
                      </p>

                      <p className="break-words text-xs text-muted">
                        {option.subtitle}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <FieldError
            message={getErrorMessage(normalizedErrors, "shootType")}
          />
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1 px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Step 02
          </p>

          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Choose date and place.
          </h2>
        </CardHeader>

        <CardContent className="space-y-5 px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="location">
                Province / city{" "}
                <span className="text-red-500">*</span>
              </Label>

              <Select id="location" {...register("location")}>
                <option value="" disabled>
                  Select a location in Vietnam
                </option>

                {VIETNAM_LOCATION_OPTIONS.map((location) => (
                  <option
                    key={location.value}
                    value={location.value}
                  >
                    {location.label}
                  </option>
                ))}
              </Select>

              <FieldError
                message={getErrorMessage(
                  normalizedErrors,
                  "location",
                )}
              />
            </div>

            <div className="min-w-0 space-y-2">
              <Label htmlFor="preferredTime">
                Preferred time{" "}
                <span className="font-normal text-muted">
                  (optional)
                </span>
              </Label>

              <Input
                id="preferredTime"
                type="time"
                {...register("preferredTime")}
              />

              <FieldError
                message={getErrorMessage(
                  normalizedErrors,
                  "preferredTime",
                )}
              />
            </div>
          </div>

          <BookingDateGrid />
        </CardContent>
      </Card>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1 px-4 pb-4 pt-5 sm:px-6 sm:pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Step 03
          </p>

          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            Add shoot details.
          </h2>
        </CardHeader>

        <CardContent className="space-y-5 px-4 pb-5 sm:px-6 sm:pb-6">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="title">
              Shoot title <span className="text-red-500">*</span>
            </Label>

            <Input
              id="title"
              placeholder="Example: Graduation portrait in Thu Duc City"
              maxLength={120}
              {...register("title")}
            />

            <FieldError
              message={getErrorMessage(normalizedErrors, "title")}
            />
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="concept">
              Shoot brief <span className="text-red-500">*</span>
            </Label>

            <Textarea
              id="concept"
              className="min-h-36 rounded-2xl px-4 py-3"
              placeholder="Example: outdoor portrait concept, natural light, warm colors, around 20 edited photos."
              maxLength={500}
              {...register("concept")}
            />

            <div className="flex min-w-0 items-center justify-between gap-4">
              <FieldError
                message={getErrorMessage(
                  normalizedErrors,
                  "concept",
                )}
              />

              <p className="ml-auto shrink-0 text-xs text-muted">
                {(concept ?? "").length}/500
              </p>
            </div>
          </div>

          <BookingAdditionalServicesField />

          <BookingBudgetRangeField />

          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="contactPreference">
                Contact preference
              </Label>

              <Select
                id="contactPreference"
                {...register("contactPreference")}
              >
                {contactOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </Select>

              <FieldError
                message={getErrorMessage(
                  normalizedErrors,
                  "contactPreference",
                )}
              />
            </div>

            <div className="min-w-0 space-y-2">
              <Label htmlFor="inspiration">
                Inspiration link{" "}
                <span className="font-normal text-muted">
                  (optional)
                </span>
              </Label>

              <Input
                id="inspiration"
                type="url"
                placeholder="Moodboard, album, or reference URL"
                {...register("inspiration")}
              />

              <FieldError
                message={getErrorMessage(
                  normalizedErrors,
                  "inspiration",
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};