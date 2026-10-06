import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { StartExamButton } from "@/components/student/start-exam-button";
import { ExamTaker } from "@/components/student/exam-taker";
import { Clock, FileQuestion } from "lucide-react";
import { EXAM_STANDARDS, isExamType } from "@/lib/exam-standards";

export default async function TakeMockTestPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const examAssignment = await prisma.examAssignment.findUnique({
    where: { id: params.id },
    include: {
      mockExam: { include: { sections: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } } } },
      attempt: { include: { answers: true } },
    },
  });

  if (!examAssignment || examAssignment.studentId !== session!.user.id) notFound();
  if (examAssignment.status === "GRADED") redirect(`/student/mock-tests/${examAssignment.id}/result`);

  if (examAssignment.status === "NOT_STARTED" || !examAssignment.attempt) {
    return (
      <div>
        <PageHeader title={examAssignment.mockExam.title} />
        <Card>
          <CardContent className="pt-10 pb-10 flex flex-col items-center text-center">
            <FileQuestion className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-lg font-semibold">Ready to begin?</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md flex items-center gap-1 justify-center">
              <Clock className="h-4 w-4" /> You&apos;ll have {examAssignment.mockExam.durationMinutes} minutes once you start.
              The timer cannot be paused.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Your result will be reported on the{" "}
              {EXAM_STANDARDS[isExamType(examAssignment.mockExam.examType) ? examAssignment.mockExam.examType : "GENERAL"].label}{" "}
              scale.
            </p>
            <div className="mt-6">
              <StartExamButton examAssignmentId={examAssignment.id} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = examAssignment.mockExam.sections.map((s) => ({
    id: s.id,
    title: s.title,
    questions: s.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type as "SINGLE_CHOICE" | "MULTIPLE_CHOICE",
      marks: q.marks,
      options: JSON.parse(q.options) as { id: string; text: string }[],
    })),
  }));

  const initialAnswers = Object.fromEntries(
    examAssignment.attempt.answers.map((a) => [a.questionId, JSON.parse(a.selectedOptionIds) as string[]])
  );

  return (
    <div>
      <PageHeader title={examAssignment.mockExam.title} />
      <ExamTaker
        attemptId={examAssignment.attempt.id}
        examAssignmentId={examAssignment.id}
        sections={sections}
        durationMinutes={examAssignment.mockExam.durationMinutes}
        startedAt={examAssignment.attempt.startedAt.toISOString()}
        initialAnswers={initialAnswers}
      />
    </div>
  );
}
