import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dashboardPathFor } from "@/lib/roles";

export default async function RedirectPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  redirect(dashboardPathFor(session.user.role));
}
