"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { FieldError } from "./field-error";

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
}

export const PasswordField = ({
  name,
  label,
  placeholder,
  autoComplete,
}: PasswordFieldProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const fieldError = (errors as Record<string, { message?: string }>)[name];
  const message = fieldError?.message;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          className="text-xs font-medium text-brand-muted hover:text-brand-primary"
        >
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      <Input
        id={name}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!message}
        {...register(name)}
      />
      <FieldError message={message} />
    </div>
  );
};
