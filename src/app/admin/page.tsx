import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, BookOpen, Inbox, FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminOverviewPage() {
  const [studentCount, prospectorCount, courseCount, examAttemptCount, newEnquiries, recentEnquiries] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "PROSPECTOR" } }),
      prisma.course.count(),
      prisma.examAttempt.count({ where: { status: "GRADED" } }),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.enquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  return (
    <div>
      <PageHeader title="Platform Overview" description="A snapshot of Brainstorm with Zinchi." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <StatCard icon={Users} label="Students" value={studentCount} />
        <StatCard icon={UserCog} label="Prospectors" value={prospectorCount} />
        <StatCard icon={BookOpen} label="Courses" value={courseCount} />
        <StatCard icon={FileQuestion} label="Mock Tests Taken" value={examAttemptCount} />
        <StatCard icon={Inbox} label="New Enquiries" value={newEnquiries} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Enquiries</CardTitle>
          <Button asChild variant="link">
            <Link href="/admin/enquiries">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentEnquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEnquiries.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.email}</p>
                  </div>
                  <Badge variant="outline">{e.source}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
