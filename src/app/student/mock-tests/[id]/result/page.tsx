import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function MockTestResultPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const examAssignment = await prisma.examAssignment.findUnique({
    where: { id: params.id },
    include: {
      mockExam: { include: { sections: { orderBy: { order: "asc" }, include: { questions: { orderBy: { order: "asc" } } } } } },
      attempt: { include: { answers: true } },
    },
  });

  if (!examAssignment || examAssignment.studentId !== session!.user.id) notFound();
  if (!examAssignment.attempt || examAssignment.status !== "GRADED") {
    redirect(`/student/mock-tests/${examAssignment.id}`);
  }

  const attempt = examAssignment.attempt;
  const answerByQuestion = new Map(attempt.answers.map((a) => [a.questionId, a]));
  const percent = attempt.totalMarks ? Math.round(((attempt.score ?? 0) / attempt.totalMarks) * 100) : 0;

  return (
    <div>
      <PageHeader title={`${examAssignment.mockExam.title} — Result`} />

      <Card className="mb-6">
        <CardContent className="pt-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Your Score</p>
            <p className="text-3xl font-bold">
              {attempt.score}/{attempt.totalMarks}
            </p>
          </div>
          <Badge variant={percent >= 70 ? "success" : percent >= 40 ? "warning" : "destructive"} className="text-base px-4 py-1.5">
            {percent}%
          </Badge>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {examAssignment.mockExam.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.questions.map((q, i) => {
                const options: { id: string; text: string }[] = JSON.parse(q.options);
                const correctIds: string[] = JSON.parse(q.correctOptionIds);
                const answer = answerByQuestion.get(q.id);
                const selectedIds: string[] = answer ? JSON.parse(answer.selectedOptionIds) : [];

                return (
                  <div key={q.id} className="rounded-lg border p-4">
                    <div className="flex items-start gap-2">
                      {answer?.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                      )}
                      <p className="font-medium">
                        {i + 1}. {q.prompt}
                      </p>
                    </div>
                    <div className="mt-3 ml-7 space-y-1.5">
                      {options.map((opt) => (
                        <div
                          key={opt.id}
                          className={cn(
                            "text-sm rounded-md px-3 py-1.5",
                            correctIds.includes(opt.id) && "bg-success/10 text-success-foreground",
                            selectedIds.includes(opt.id) && !correctIds.includes(opt.id) && "bg-destructive/10"
                          )}
                        >
                          {opt.text}
                          {correctIds.includes(opt.id) && <span className="ml-2 text-xs font-medium">(Correct)</span>}
                          {selectedIds.includes(opt.id) && !correctIds.includes(opt.id) && (
                            <span className="ml-2 text-xs font-medium">(Your answer)</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
