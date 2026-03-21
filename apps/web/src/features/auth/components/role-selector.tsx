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
      <p className="text-sm font-medium text-foreground">
        Choose your role
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {roleOptions.map((option) => {
          const isActive = selected === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer rounded-2xl border border-border bg-surface p-4 transition",
                isActive
                  ? "border-foreground bg-background"
                  : "hover:border-accent"
              )}
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register("role")}
              />
              <p className="text-sm font-medium text-foreground">
                {option.title}
              </p>
              <p className="mt-2 text-xs text-muted">
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
