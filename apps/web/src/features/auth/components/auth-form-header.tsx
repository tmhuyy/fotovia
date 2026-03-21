interface AuthFormHeaderProps {
  title: string;
  description?: string;
}

export const AuthFormHeader = ({
  title,
  description,
}: AuthFormHeaderProps) => {
  return (
    <div className="space-y-2 text-center">
      <h1 className="font-display text-2xl text-foreground sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="text-sm text-muted">{description}</p>
      ) : null}
    </div>
  );
};
