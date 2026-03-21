"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "../../../lib/utils";
import { FieldError } from "./field-error";

const roleOptions = [
  {
    value: "client",
    title: "I want to book a photographer",
    description: "Browse portfolios, book sessions, and track requests.",
  },
  {
    value: "photographer",
    title: "I am a photographer",
    description: "Showcase your work and receive booking requests.",
  },
];

export const RoleSelector = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const selected = watch("role");
  const fieldError = (errors as Record<string, { message?: string }>)["role"];

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-brand-primary">
        Choose your role
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {roleOptions.map((option) => {
          const isActive = selected === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-2xl border border-brand-border bg-brand-surface p-4 transition",
                isActive
                  ? "border-brand-primary bg-brand-background"
                  : "hover:border-brand-accent"
              )}
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register("role")}
              />
              <p className="text-sm font-medium text-brand-primary">
                {option.title}
              </p>
              <p className="mt-2 text-xs text-brand-muted">
                {option.description}
              </p>
            </label>
          );
        })}
      </div>
      <FieldError message={fieldError?.message} />
    </div>
  );
};
