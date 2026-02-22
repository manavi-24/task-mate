import { redirect } from "next/navigation";

export default function LoginPage() {
  // Single auth entry point.
  redirect("/get-started");
}
