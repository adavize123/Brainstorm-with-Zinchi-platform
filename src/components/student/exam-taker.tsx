"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { saveExamAnswer, submitExamAttempt } from "@/app/actions/mock-exams";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Loader2 } from "lucide-react";

interface Option {
  id: string;
  text: string;
}

interface QuestionData {
  id: string;
  prompt: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  options: Option[];
  marks: number;
}

interface SectionData {
  id: string;
  title: string;
  questions: QuestionData[];
}

export function ExamTaker({
  attemptId,
  examAssignmentId,
  sections,
  durationMinutes,
  startedAt,
  initialAnswers,
}: {
  attemptId: string;
  examAssignmentId: string;
  sections: SectionData[];
  durationMinutes: number;
  startedAt: string;
  initialAnswers: Record<string, string[]>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string[]>>(initialAnswers);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const allQuestions = useMemo(() => sections.flatMap((s) => s.questions), [sections]);

  const endTime = useMemo(
    () => new Date(startedAt).getTime() + durationMinutes * 60 * 1000,
    [startedAt, durationMinutes]
  );
  const [remainingMs, setRemainingMs] = useState(endTime - Date.now());

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      await submitExamAttempt(attemptId);
      router.push(`/student/mock-tests/${examAssignmentId}/result`);
    } catch (err) {
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [attemptId, examAssignmentId, router, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, handleSubmit]);

  const section = sections[sectionIndex];
  const question = section?.questions[questionIndex];

  const minutes = Math.max(0, Math.floor(remainingMs / 60000));
  const seconds = Math.max(0, Math.floor((remainingMs % 60000) / 1000));

  function goTo(sIdx: number, qIdx: number) {
    setSectionIndex(sIdx);
    setQuestionIndex(qIdx);
  }

  async function updateAnswer(questionId: string, optionId: string, type: QuestionData["type"]) {
    const current = answers[questionId] ?? [];
    let next: string[];
    if (type === "SINGLE_CHOICE") {
      next = [optionId];
    } else {
      next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
    }
    setAnswers((prev) => ({ ...prev, [questionId]: next }));
    try {
      await saveExamAnswer(attemptId, questionId, next);
    } catch {
      // Autosave failures are non-fatal; the answer stays in local state.
    }
  }

  if (!question) return null;

  const answeredCount = allQuestions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <Card className="h-fit lg:sticky lg:top-20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium">
            <Clock className="h-4 w-4" />
            <span className={cn(remainingMs < 60000 && "text-destructive")}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {answeredCount}/{allQuestions.length} answered
          </p>
          {sections.map((s, sIdx) => (
            <div key={s.id} className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">{s.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {s.questions.map((q, qIdx) => {
                  const answered = (answers[q.id]?.length ?? 0) > 0;
                  const isCurrent = sIdx === sectionIndex && qIdx === questionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => goTo(sIdx, qIdx)}
                      className={cn(
                        "h-8 w-8 rounded-md border text-xs font-medium transition-colors",
                        isCurrent && "border-primary ring-2 ring-primary/30",
                        answered ? "bg-primary text-primary-foreground" : "bg-background"
                      )}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <Button className="w-full mt-2" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Exam
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{section.title}</Badge>
            <Badge variant="outline">{question.marks} mark{question.marks > 1 ? "s" : ""}</Badge>
          </div>
          <p className="font-medium mb-6">{question.prompt}</p>

          {question.type === "SINGLE_CHOICE" ? (
            <RadioGroup
              value={answers[question.id]?.[0] ?? ""}
              onValueChange={(value) => updateAnswer(question.id, value, question.type)}
              className="space-y-3"
            >
              {question.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <RadioGroupItem value={opt.id} id={opt.id} />
                  <Label htmlFor={opt.id} className="cursor-pointer flex-1 font-normal">
                    {opt.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-3">
              {question.options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <Checkbox
                    id={opt.id}
                    checked={answers[question.id]?.includes(opt.id) ?? false}
                    onCheckedChange={() => updateAnswer(question.id, opt.id, question.type)}
                  />
                  <Label htmlFor={opt.id} className="cursor-pointer flex-1 font-normal">
                    {opt.text}
                  </Label>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              disabled={sectionIndex === 0 && questionIndex === 0}
              onClick={() => {
                if (questionIndex > 0) goTo(sectionIndex, questionIndex - 1);
                else if (sectionIndex > 0) goTo(sectionIndex - 1, sections[sectionIndex - 1].questions.length - 1);
              }}
            >
              Previous
            </Button>
            <Button
              disabled={
                sectionIndex === sections.length - 1 && questionIndex === section.questions.length - 1
              }
              onClick={() => {
                if (questionIndex < section.questions.length - 1) goTo(sectionIndex, questionIndex + 1);
                else if (sectionIndex < sections.length - 1) goTo(sectionIndex + 1, 0);
              }}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
