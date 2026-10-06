import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Clock } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/deadline-badge";
import { MockExamBuilder } from "@/components/dashboard/mock-exam-builder";
import { AssignExamDialog } from "@/components/dashboard/assign-exam-dialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { deleteMockExam } from "@/app/actions/mock-exams";
import { computeExamResult, EXAM_STANDARDS, isExamType } from "@/lib/exam-standards";

export default async function ProspectorMockTestsPage() {
  const [mockExams, courses, students] = await Promise.all([
    prisma.mockExam.findMany({
      include: {
        course: true,
        sections: { include: { questions: true } },
        assignments: { include: { student: true, attempt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({ orderBy: { title: "asc" } }),
    prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Mock Tests"
        description="Build timed mock exams and assign them to students."
        action={<MockExamBuilder courses={courses} />}
      />

      {mockExams.length === 0 ? (
        <EmptyState icon={FileQuestion} title="No mock exams yet" description="Build your first mock exam." />
      ) : (
        <div className="space-y-4">
          {mockExams.map((exam) => {
            const questionCount = exam.sections.reduce((sum, s) => sum + s.questions.length, 0);
            return (
              <Card key={exam.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base">{exam.title}</CardTitle>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <Badge variant="secondary">
                        {EXAM_STANDARDS[isExamType(exam.examType) ? exam.examType : "GENERAL"].label}
                      </Badge>
                      {exam.course && <Badge variant="outline">{exam.course.title}</Badge>}
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {exam.durationMinutes} min
                      </span>
                      <span className="text-xs text-muted-foreground">{questionCount} questions</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AssignExamDialog mockExamId={exam.id} students={students} />
                    <ConfirmDeleteDialog
                      title="Delete mock exam"
                      description={`This will remove "${exam.title}" and all student assignments.`}
                      onConfirm={deleteMockExam.bind(null, exam.id)}
                    />
                  </div>
                </CardHeader>
                {exam.assignments.length > 0 && (
                  <CardContent className="space-y-2">
                    {exam.assignments.map((a) => {
                      const result =
                        a.status === "GRADED" && a.attempt
                          ? computeExamResult(a.attempt.score ?? 0, a.attempt.totalMarks ?? 0, exam.examType)
                          : null;
                      return (
                        <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 gap-3 flex-wrap">
                          <span className="text-sm">{a.student.name}</span>
                          <div className="flex items-center gap-2">
                            {result && (
                              <span className="text-sm text-muted-foreground">
                                {result.scaledDisplay} / {result.maxScaledDisplay}
                              </span>
                            )}
                            {result && <Badge variant={result.grade.variant}>{result.grade.label}</Badge>}
                            <StatusBadge status={a.status} />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
