import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import GetStartedClient from "@/app/get-started/GetStartedClient";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function GetStartedPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);
  const rawSearchParams = (await props.searchParams) || {};
  const callback =
    typeof rawSearchParams.callback === "string"
      ? rawSearchParams.callback
      : "";

  const safeCallback =
    callback && callback.startsWith("/") && !callback.startsWith("//")
      ? callback
      : "/dashboard";

  if (session?.user?.email) {
    redirect(safeCallback);
  }

  const githubEnabled = Boolean(
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
  );

  return <GetStartedClient githubEnabled={githubEnabled} />;
}
