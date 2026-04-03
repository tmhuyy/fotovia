interface FieldErrorProps {
    message?: string;
}

export const FieldError = ({ message }: FieldErrorProps) => {
    if (!message) return null;

    return (
        <p className="text-sm text-red-600" role="alert" aria-live="polite">
            {message}
        </p>
    );
};
