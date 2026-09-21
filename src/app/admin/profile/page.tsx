import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm, PasswordForm, LogoutCard } from "@/components/dashboard/profile-forms";

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account details." />
      <div className="space-y-6 max-w-md">
        <ProfileForm name={user.name} phone={user.phone} />
        <PasswordForm />
        <LogoutCard />
      </div>
    </div>
  );
}
