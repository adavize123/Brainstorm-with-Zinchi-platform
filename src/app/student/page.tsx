import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { DeadlineBadge } from "@/components/dashboard/deadline-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { BookOpen, ClipboardList, FileQuestion, TrendingUp } from "lucide-react";

export default async function StudentOverviewPage() {
  const session = await getServerSession(authOptions);
  const studentId = session!.user.id;

  const [enrollments, pendingAssignments, upcomingExams, gradedAttempts] = await Promise.all([
    prisma.enrollment.findMany({ where: { studentId }, include: { course: true } }),
    prisma.assignmentTarget.findMany({
      where: { studentId, status: { in: ["PENDING", "LATE"] } },
      include: { assignment: true },
      orderBy: { dueAt: "asc" },
      take: 5,
    }),
    prisma.examAssignment.findMany({
      where: { studentId, status: { in: ["NOT_STARTED", "IN_PROGRESS"] } },
      include: { mockExam: true },
      orderBy: { dueAt: "asc" },
      take: 5,
    }),
    prisma.examAttempt.findMany({
      where: { examAssignment: { studentId }, status: "GRADED" },
      include: { examAssignment: { include: { mockExam: true } } },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  const chartData = gradedAttempts.map((a) => ({
    name: a.examAssignment.mockExam.title.replace("Mock Test", "MT"),
    percent: a.totalMarks ? Math.round(((a.score ?? 0) / a.totalMarks) * 100) : 0,
  }));

  return (
    <div>
      <PageHeader
        title={`Hey ${session!.user.name?.split(" ")[0]}, welcome back!`}
        description="Week after week, witness compounded growth."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={enrollments.length} />
        <StatCard icon={ClipboardList} label="Pending Assignments" value={pendingAssignments.length} />
        <StatCard icon={FileQuestion} label="Upcoming Mock Tests" value={upcomingExams.length} />
        <StatCard
          icon={TrendingUp}
          label="Mock Tests Taken"
          value={gradedAttempts.length}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Where You Stand</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length >= 1 ? (
              <ProgressChart data={chartData} />
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">
                After 3 mock tests, you will start seeing your Progress Graph. Take a test.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollments.length === 0 && (
              <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
            )}
            {enrollments.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{e.course.title}</span>
                  <span className="text-muted-foreground">{e.progressPercent}%</span>
                </div>
                <Progress value={e.progressPercent} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>What Next: Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingAssignments.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="You're all caught up"
                description="No pending assignments right now."
              />
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{t.assignment.title}</p>
                      <DeadlineBadge dueAt={t.dueAt} />
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/student/assignments">View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Next: Mock Tests</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingExams.length === 0 ? (
              <EmptyState
                icon={FileQuestion}
                title="No mock tests due"
                description="Your prospector hasn't assigned a new mock test yet."
              />
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{e.mockExam.title}</p>
                      <DeadlineBadge dueAt={e.dueAt} />
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/student/mock-tests">View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
