export type { AuthRole } from "../../types/auth.types";

export type AuthPageKind =
  | "sign-in"
  | "sign-up"
  | "register-email"
  | "check-email";

export interface AuthFooterLink {
  text: string;
  linkLabel: string;
  href: string;
}
