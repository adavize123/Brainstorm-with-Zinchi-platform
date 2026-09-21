import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, ClipboardCheck, FileQuestion } from "lucide-react";
import { DeadlineBadge } from "@/components/dashboard/deadline-badge";

export default async function ProspectorOverviewPage() {
  const session = await getServerSession(authOptions);
  const prospectorId = session!.user.id;

  const [studentCount, courseCount, pendingGrading, upcomingDeadlines] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count({ where: { createdById: prospectorId } }),
    prisma.assignmentTarget.count({
      where: { status: "SUBMITTED", assignment: { createdById: prospectorId } },
    }),
    prisma.assignmentTarget.findMany({
      where: { status: { in: ["PENDING", "LATE"] }, assignment: { createdById: prospectorId } },
      include: { assignment: true, student: true },
      orderBy: { dueAt: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${session!.user.name?.split(" ")[0]}`}
        description="Manage your students, courses, and assignments."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={Users} label="Total Students" value={studentCount} />
        <StatCard icon={BookOpen} label="Your Courses" value={courseCount} />
        <StatCard icon={ClipboardCheck} label="Awaiting Grading" value={pendingGrading} />
        <StatCard icon={FileQuestion} label="Upcoming Deadlines" value={upcomingDeadlines.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Assignment Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
          ) : (
            <div className="space-y-3">
              {upcomingDeadlines.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{t.assignment.title}</p>
                    <p className="text-xs text-muted-foreground">{t.student.name}</p>
                  </div>
                  <DeadlineBadge dueAt={t.dueAt} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
