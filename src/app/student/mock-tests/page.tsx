import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DeadlineBadge, StatusBadge } from "@/components/dashboard/deadline-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Clock } from "lucide-react";

export default async function StudentMockTestsPage() {
  const session = await getServerSession(authOptions);

  const examAssignments = await prisma.examAssignment.findMany({
    where: { studentId: session!.user.id },
    include: { mockExam: true, attempt: true },
    orderBy: { dueAt: "asc" },
  });

  return (
    <div>
      <PageHeader title="Mock Tests" description="Timed practice exams assigned by your prospector." />

      {examAssignments.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No mock tests yet"
          description="Your prospector hasn't assigned a mock test yet."
        />
      ) : (
        <div className="space-y-3">
          {examAssignments.map((e) => (
            <Card key={e.id}>
              <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{e.mockExam.title}</p>
                    <StatusBadge status={e.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <DeadlineBadge dueAt={e.dueAt} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> {e.mockExam.durationMinutes} min
                    </span>
                  </div>
                  {e.status === "GRADED" && e.attempt && (
                    <p className="text-sm mt-2">
                      Score: <span className="font-semibold">{e.attempt.score}/{e.attempt.totalMarks}</span>
                    </p>
                  )}
                </div>
                <Button asChild>
                  <Link href={e.status === "GRADED" ? `/student/mock-tests/${e.id}/result` : `/student/mock-tests/${e.id}`}>
                    {e.status === "NOT_STARTED" ? "Start" : e.status === "IN_PROGRESS" ? "Continue" : "View Result"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
