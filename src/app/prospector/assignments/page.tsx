import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";
import { DeadlineBadge, StatusBadge } from "@/components/dashboard/deadline-badge";
import { AssignmentFormDialog } from "@/components/dashboard/assignment-form-dialog";
import { GradeAssignmentDialog } from "@/components/dashboard/grade-assignment-dialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { deleteAssignment } from "@/app/actions/assignments";

export default async function ProspectorAssignmentsPage() {
  const [assignments, courses, students] = await Promise.all([
    prisma.assignment.findMany({
      include: { course: true, targets: { include: { student: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({ orderBy: { title: "asc" } }),
    prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Create assignments and grade submissions."
        action={<AssignmentFormDialog courses={courses} students={students} />}
      />

      {assignments.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No assignments yet" description="Create your first assignment." />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <Badge variant="outline" className="mt-1">{a.course.title}</Badge>
                </div>
                <ConfirmDeleteDialog
                  title="Delete assignment"
                  description={`This will remove "${a.title}" for all assigned students.`}
                  onConfirm={deleteAssignment.bind(null, a.id)}
                />
              </CardHeader>
              <CardContent className="space-y-2">
                {a.targets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-3 gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-medium">{t.student.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={t.status} />
                        <DeadlineBadge dueAt={t.dueAt} />
                      </div>
                      {t.status === "GRADED" && (
                        <p className="text-xs mt-1">Grade: {t.grade}/100</p>
                      )}
                    </div>
                    {(t.status === "SUBMITTED" || t.status === "LATE") && (
                      <GradeAssignmentDialog
                        targetId={t.id}
                        studentName={t.student.name}
                        submissionText={t.submissionText}
                        submissionUrl={t.submissionUrl}
                      />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
