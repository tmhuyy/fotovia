"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select } from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import type { BookingBriefFormValues } from "../schemas/booking-brief.schema";

interface FieldErrorProps {
  message?: string;
}

const FieldError = ({ message }: FieldErrorProps) => {
  if (!message) return null;
  return <p className="text-xs text-accent">{message}</p>;
};

interface SelectOption {
  value: string;
  label: string;
}

interface BookingBriefSelectFieldProps {
  name: keyof BookingBriefFormValues;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  helper?: string;
}

export const BookingBriefSelectField = ({
  name,
  label,
  options,
  placeholder = "Select an option",
  helper,
}: BookingBriefSelectFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingBriefFormValues>();

  const fieldError = (errors as Record<string, { message?: string }>)[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name.toString()}>{label}</Label>
      <Select id={name.toString()} {...register(name)}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      {fieldError?.message ? (
        <FieldError message={fieldError.message} />
      ) : helper ? (
        <p className="text-xs text-muted">{helper}</p>
      ) : null}
    </div>
  );
};

interface BookingBriefTextFieldProps {
  name: keyof BookingBriefFormValues;
  label: string;
  placeholder?: string;
  type?: string;
  helper?: string;
}

export const BookingBriefTextField = ({
  name,
  label,
  placeholder,
  type = "text",
  helper,
}: BookingBriefTextFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingBriefFormValues>();

  const fieldError = (errors as Record<string, { message?: string }>)[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name.toString()}>{label}</Label>
      <Input
        id={name.toString()}
        type={type}
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

interface BookingBriefTextareaFieldProps {
  name: keyof BookingBriefFormValues;
  label: string;
  placeholder?: string;
  helper?: string;
}

export const BookingBriefTextareaField = ({
  name,
  label,
  placeholder,
  helper,
}: BookingBriefTextareaFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingBriefFormValues>();

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
