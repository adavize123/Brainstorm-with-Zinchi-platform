import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <DashboardShell
      navKey="student"
      role={session.user.role}
      userName={session.user.name ?? "Student"}
      userEmail={session.user.email ?? ""}
      profileHref="/student/profile"
    >
      {children}
    </DashboardShell>
  );
}
