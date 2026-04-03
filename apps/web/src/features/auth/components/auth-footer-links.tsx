import Link from "next/link";

interface AuthFooterLinksProps {
  text: string;
  linkLabel: string;
  href: string;
}

export const AuthFooterLinks = ({
  text,
  linkLabel,
  href,
}: AuthFooterLinksProps) => {
  return (
    <p className="text-center text-sm text-muted">
      {text} {" "}
      <Link href={href} className="font-medium text-foreground">
        {linkLabel}
      </Link>
    </p>
  );
};
