"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { FieldError } from "./field-error";

interface AuthTextFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  helperText?: string;
}

export const AuthTextField = ({
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  helperText,
}: AuthTextFieldProps) => {
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
        {helperText ? (
          <span className="text-xs text-brand-muted">{helperText}</span>
        ) : null}
      </div>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!message}
        {...register(name)}
      />
      <FieldError message={message} />
    </div>
  );
};
