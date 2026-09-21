import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <DashboardShell
      navKey="admin"
      role={session.user.role}
      userName={session.user.name ?? "Admin"}
      userEmail={session.user.email ?? ""}
      profileHref="/admin/profile"
    >
      {children}
    </DashboardShell>
  );
}
