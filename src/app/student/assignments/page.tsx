import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DeadlineBadge, StatusBadge } from "@/components/dashboard/deadline-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { SubmitAssignmentDialog } from "@/components/student/submit-assignment-dialog";

export default async function StudentAssignmentsPage() {
  const session = await getServerSession(authOptions);

  const targets = await prisma.assignmentTarget.findMany({
    where: { studentId: session!.user.id },
    include: { assignment: { include: { course: true } } },
    orderBy: { dueAt: "asc" },
  });

  return (
    <div>
      <PageHeader title="Assignments" description="Track and submit your assigned work." />

      {targets.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          description="Your prospector hasn't assigned any work yet."
        />
      ) : (
        <div className="space-y-3">
          {targets.map((t) => (
            <Card key={t.id}>
              <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{t.assignment.title}</p>
                    <Badge variant="outline">{t.assignment.course.title}</Badge>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{t.assignment.description}</p>
                  <div className="mt-2">
                    <DeadlineBadge dueAt={t.dueAt} />
                  </div>
                  {t.status === "GRADED" && (
                    <p className="text-sm mt-2">
                      Grade: <span className="font-semibold">{t.grade}/100</span>
                      {t.feedback && <span className="text-muted-foreground"> — {t.feedback}</span>}
                    </p>
                  )}
                </div>
                {t.status === "PENDING" || t.status === "LATE" ? (
                  <SubmitAssignmentDialog
                    targetId={t.id}
                    assignmentTitle={t.assignment.title}
                    defaultText={t.submissionText}
                    defaultUrl={t.submissionUrl}
                  />
                ) : t.status === "SUBMITTED" ? (
                  <SubmitAssignmentDialog
                    targetId={t.id}
                    assignmentTitle={t.assignment.title}
                    defaultText={t.submissionText}
                    defaultUrl={t.submissionUrl}
                    triggerLabel="Edit submission"
                  />
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
