interface AuthFormAlertProps {
    title: string;
    description?: string;
}

export const AuthFormAlert = ({ title, description }: AuthFormAlertProps) => {
    return (
        <div
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
            role="alert"
            aria-live="polite"
        >
            <p className="text-sm font-medium text-red-700">{title}</p>

            {description ? (
                <p className="mt-1 text-sm text-red-600">{description}</p>
            ) : null}
        </div>
    );
};
