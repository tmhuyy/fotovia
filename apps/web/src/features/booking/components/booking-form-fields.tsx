"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select } from "../../../components/ui/select";
import type { BookingRequestFormValues } from "../schemas/booking-request.schema";

interface FieldErrorProps {
  message?: string;
}

const FieldError = ({ message }: FieldErrorProps) => {
  if (!message) return null;
  return <p className="text-xs text-accent">{message}</p>;
};

interface BookingTextFieldProps {
  name: keyof BookingRequestFormValues;
  label: string;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  helper?: string;
}

export const BookingTextField = ({
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  helper,
}: BookingTextFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingRequestFormValues>();

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

interface SelectOption {
  value: string;
  label: string;
}

interface BookingSelectFieldProps {
  name: keyof BookingRequestFormValues;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  helper?: string;
}

export const BookingSelectField = ({
  name,
  label,
  options,
  placeholder = "Select an option",
  helper,
}: BookingSelectFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingRequestFormValues>();

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

interface BookingTextareaFieldProps {
  name: keyof BookingRequestFormValues;
  label: string;
  placeholder?: string;
  helper?: string;
}

export const BookingTextareaField = ({
  name,
  label,
  placeholder,
  helper,
}: BookingTextareaFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<BookingRequestFormValues>();

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
