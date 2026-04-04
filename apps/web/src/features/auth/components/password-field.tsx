"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { FieldError } from "./field-error";

interface PasswordFieldProps {
    name: "password" | "confirmPassword";
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

                <button
                    type="button"
                    onClick={() => setIsVisible((prev) => !prev)}
                    className="text-sm font-medium text-muted transition hover:text-foreground"
                >
                    {isVisible ? "Hide" : "Show"}
                </button>
            </div>

            <Input
                id={name}
                type={isVisible ? "text" : "password"}
                placeholder={placeholder}
                autoComplete={autoComplete}
                aria-invalid={message ? "true" : "false"}
                {...register(name)}
            />

            <FieldError message={message} />
        </div>
    );
};
