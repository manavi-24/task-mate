import { redirect } from "next/navigation";

// Legacy safety route.
// Some users may have bookmarked /task (singular).
export default function TaskLegacyRedirectPage() {
  redirect("/tasks");
}
