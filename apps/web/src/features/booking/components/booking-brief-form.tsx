"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { VIETNAM_LOCATION_OPTIONS } from "../../../shared/data/vietnam-locations";
import
  {
    budgetOptions,
    contactOptions,
    sessionTypeOptions,
    styleOptions,
  } from "../data/booking-options";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";
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

  const selectedSessionType = useWatch({
    control,
    name: "sessionType",
  });

  const description = useWatch({
    control,
    name: "description",
  });

  const normalizedErrors = errors as Record<string, { message?: unknown }>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Step 01
          </p>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Choose your session type.
            </h2>

            <p className="text-sm leading-6 text-muted">
              Start with the type of shoot, similar to how clients
              choose a booking category before adding details.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {sessionTypeOptions.map((option) =>
            {
              const isSelected = selectedSessionType === option.value;

              return (
                <label
                  key={option.value}
                  className={[
                    "group cursor-pointer overflow-hidden rounded-[1.5rem] border bg-background transition",
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
                    {...register("sessionType")}
                  />

                  <div className="flex h-full flex-col">
                    <div className="flex h-32 items-center justify-center bg-gradient-to-br from-background via-surface to-accent/20 text-5xl">
                      {option.visual}
                    </div>

                    <div className="space-y-1 p-4 text-center">
                      <p
                        className={[
                          "font-semibold",
                          isSelected
                            ? "text-accent"
                            : "text-foreground",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {option.label}
                      </p>

                      <p className="text-sm text-muted">
                        {option.subtitle}
                      </p>

                      <p className="line-clamp-2 text-xs leading-5 text-muted">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <FieldError
            message={getErrorMessage(normalizedErrors, "sessionType")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Step 02
          </p>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Choose place and visual direction.
            </h2>

            <p className="text-sm leading-6 text-muted">
              Keep the main location simple first. More detailed
              address notes can be added in the brief below.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">
                Province / city <span className="text-red-500">*</span>
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

            <div className="space-y-2">
              <Label htmlFor="style">
                Visual style <span className="text-red-500">*</span>
              </Label>

              <Select id="style" {...register("style")}>
                <option value="" disabled>
                  Select a visual style
                </option>

                {styleOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </Select>

              <FieldError
                message={getErrorMessage(normalizedErrors, "style")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Step 03
          </p>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Pick the shoot date.
            </h2>

            <p className="text-sm leading-6 text-muted">
              The date is the most important scheduling signal. Time can
              stay flexible at this stage.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <BookingDateGrid />

          <div className="space-y-2">
            <Label htmlFor="preferredTime">
              Preferred time{" "}
              <span className="font-normal text-muted">(optional)</span>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Step 04
          </p>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Add shoot details.
            </h2>

            <p className="text-sm leading-6 text-muted">
              Tell photographers what you want to shoot, the mood, and
              any specific location or deliverable notes.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="description">
              Shoot brief <span className="text-red-500">*</span>
            </Label>

            <Textarea
              id="description"
              className="min-h-36 rounded-2xl px-4 py-3"
              placeholder="Example: I want a soft outdoor portrait concept with natural light, warm colors, and around 20 edited photos."
              maxLength={500}
              {...register("description")}
            />

            <div className="flex items-center justify-between gap-4">
              <FieldError
                message={getErrorMessage(
                  normalizedErrors,
                  "description",
                )}
              />

              <p className="ml-auto text-xs text-muted">
                {(description ?? "").length}/500
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget">
                Budget range <span className="text-red-500">*</span>
              </Label>

              <Select id="budget" {...register("budget")}>
                <option value="" disabled>
                  Select a budget range
                </option>

                {budgetOptions.map((option) => (
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
                  "budget",
                )}
              />
            </div>

            <div className="space-y-2">
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="notes">
                Extra notes{" "}
                <span className="font-normal text-muted">
                  (optional)
                </span>
              </Label>

              <Input
                id="notes"
                placeholder="Make-up, studio, outfit, deadline..."
                {...register("notes")}
              />

              <FieldError
                message={getErrorMessage(normalizedErrors, "notes")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};