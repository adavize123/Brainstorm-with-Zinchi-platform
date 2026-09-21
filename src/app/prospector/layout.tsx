import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function ProspectorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <DashboardShell
      navKey="prospector"
      role={session.user.role}
      userName={session.user.name ?? "Prospector"}
      userEmail={session.user.email ?? ""}
      profileHref="/prospector/profile"
    >
      {children}
    </DashboardShell>
  );
}
