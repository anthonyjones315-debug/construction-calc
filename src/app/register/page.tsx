import { redirect } from "next/navigation";
import { routes } from "@routes";

/** Legacy marketing URL — registration is handled by Clerk at `/sign-up`. */
export default function RegisterPage() {
  redirect(routes.auth.signUp);
}
