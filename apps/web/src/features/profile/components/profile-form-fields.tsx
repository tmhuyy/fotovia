"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import type { ProfileFormValues } from "../schemas/profile.schema";

interface FieldErrorProps {
  message?: string;
}

const FieldError = ({ message }: FieldErrorProps) => {
  if (!message) return null;
  return <p className="text-xs text-accent">{message}</p>;
};

interface ProfileTextFieldProps {
  name: keyof ProfileFormValues;
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  helper?: string;
}

export const ProfileTextField = ({
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  helper,
}: ProfileTextFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileFormValues>();

  const fieldError = (errors as Record<string, { message?: string }>)[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name.toString()}>{label}</Label>
      <Input
        id={name.toString()}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        {...register(name)}
      />
      {fieldError?.message ? (
        <FieldError message={fieldError.message} />
      ) : helper ? (
        <p className="text-xs text-muted">{helper}</p>
      ) : null}
    </div>
  );
};

interface ProfileTextareaFieldProps {
  name: keyof ProfileFormValues;
  label: string;
  placeholder?: string;
  helper?: string;
}

export const ProfileTextareaField = ({
  name,
  label,
  placeholder,
  helper,
}: ProfileTextareaFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileFormValues>();

  const fieldError = (errors as Record<string, { message?: string }>)[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name.toString()}>{label}</Label>
      <Textarea
        id={name.toString()}
        placeholder={placeholder}
        {...register(name)}
      />
      {fieldError?.message ? (
        <FieldError message={fieldError.message} />
      ) : helper ? (
        <p className="text-xs text-muted">{helper}</p>
      ) : null}
    </div>
  );
};
