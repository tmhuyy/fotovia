"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { FieldError } from "./field-error";

interface AuthTextFieldProps {
    name: "email";
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

    const message =
        typeof errors[name]?.message === "string"
            ? errors[name]?.message
            : undefined;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <Label
                    htmlFor={name}
                    className="text-sm font-medium text-foreground"
                >
                    {label}
                </Label>

                {helperText ? (
                    <p className="text-xs text-muted">{helperText}</p>
                ) : null}
            </div>

            <Input
                id={name}
                type={type}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={message ? "true" : "false"}
                {...register(name)}
            />

            <FieldError message={message} />
        </div>
    );
};
