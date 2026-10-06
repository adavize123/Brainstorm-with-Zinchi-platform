"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { createMockExam } from "@/app/actions/mock-exams";
import { EXAM_TYPE_OPTIONS, type ExamType } from "@/lib/exam-standards";
import { Plus, Trash2, Loader2 } from "lucide-react";

let uid = 0;
function nextId() {
  uid += 1;
  return `tmp-${Date.now()}-${uid}`;
}

interface OptionDraft { id: string; text: string }
interface QuestionDraft {
  id: string;
  prompt: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  marks: number;
  options: OptionDraft[];
  correctOptionIds: string[];
}
interface SectionDraft {
  id: string;
  title: string;
  questions: QuestionDraft[];
}

function newQuestion(): QuestionDraft {
  const optA = { id: nextId(), text: "" };
  const optB = { id: nextId(), text: "" };
  return { id: nextId(), prompt: "", type: "SINGLE_CHOICE", marks: 1, options: [optA, optB], correctOptionIds: [] };
}

function newSection(): SectionDraft {
  return { id: nextId(), title: "", questions: [newQuestion()] };
}

export function MockExamBuilder({ courses }: { courses: { id: string; title: string }[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [examType, setExamType] = useState<ExamType>("GENERAL");
  const [courseId, setCourseId] = useState<string>("none");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [sections, setSections] = useState<SectionDraft[]>([newSection()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  function updateSection(id: string, patch: Partial<SectionDraft>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function updateQuestion(sectionId: string, qId: string, patch: Partial<QuestionDraft>) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : { ...s, questions: s.questions.map((q) => (q.id === qId ? { ...q, ...patch } : q)) }
      )
    );
  }
  function updateOption(sectionId: string, qId: string, optId: string, text: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== qId ? q : { ...q, options: q.options.map((o) => (o.id === optId ? { ...o, text } : o)) }
              ),
            }
      )
    );
  }
  function toggleCorrect(sectionId: string, qId: string, optId: string, type: QuestionDraft["type"]) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) => {
                if (q.id !== qId) return q;
                if (type === "SINGLE_CHOICE") return { ...q, correctOptionIds: [optId] };
                const has = q.correctOptionIds.includes(optId);
                return {
                  ...q,
                  correctOptionIds: has
                    ? q.correctOptionIds.filter((id) => id !== optId)
                    : [...q.correctOptionIds, optId],
                };
              }),
            }
      )
    );
  }

  function addSection() {
    setSections((prev) => [...prev, newSection()]);
  }
  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }
  function addQuestion(sectionId: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion()] } : s))
    );
  }
  function removeQuestion(sectionId: string, qId: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, questions: s.questions.filter((q) => q.id !== qId) } : s))
    );
  }
  function addOption(sectionId: string, qId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== qId ? q : { ...q, options: [...q.options, { id: nextId(), text: "" }] }
              ),
            }
      )
    );
  }
  function removeOption(sectionId: string, qId: string, optId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sectionId
          ? s
          : {
              ...s,
              questions: s.questions.map((q) =>
                q.id !== qId
                  ? q
                  : {
                      ...q,
                      options: q.options.filter((o) => o.id !== optId),
                      correctOptionIds: q.correctOptionIds.filter((id) => id !== optId),
                    }
              ),
            }
      )
    );
  }

  function resetBuilder() {
    setTitle("");
    setExamType("GENERAL");
    setCourseId("none");
    setDurationMinutes(60);
    setSections([newSection()]);
  }

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await createMockExam({
        title,
        examType,
        courseId: courseId === "none" ? undefined : courseId,
        durationMinutes,
        sections: sections.map((s) => ({
          title: s.title,
          questions: s.questions.map((q) => ({
            prompt: q.prompt,
            type: q.type,
            marks: q.marks,
            options: q.options.map((o) => ({ id: o.id, text: o.text })),
            correctOptionIds: q.correctOptionIds,
          })),
        })),
      });
      toast({ title: "Mock exam created", variant: "success" });
      setOpen(false);
      resetBuilder();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please check all fields are filled in correctly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Build Mock Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Build Mock Exam</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label>Exam title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SAT Mock Test 2" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Exam standard</Label>
              <Select value={examType} onValueChange={(v) => setExamType(v as ExamType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXAM_TYPE_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Results will be reported on the real {EXAM_TYPE_OPTIONS.find((s) => s.value === examType)?.label}{" "}
                scale ({EXAM_TYPE_OPTIONS.find((s) => s.value === examType)?.min}–
                {EXAM_TYPE_OPTIONS.find((s) => s.value === examType)?.max}), estimated from the
                percentage of questions answered correctly.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Course (optional)</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={5}
                max={300}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          {sections.map((section, sIdx) => (
            <Card key={section.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm">Section {sIdx + 1}</CardTitle>
                {sections.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Section title (e.g. Math)"
                  value={section.title}
                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                />

                {section.questions.map((q, qIdx) => (
                  <div key={q.id} className="rounded-lg border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">Question {qIdx + 1}</p>
                      {section.questions.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(section.id, q.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Question prompt"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(section.id, q.id, { prompt: e.target.value })}
                    />
                    <div className="flex gap-3">
                      <Select
                        value={q.type}
                        onValueChange={(v) =>
                          updateQuestion(section.id, q.id, {
                            type: v as QuestionDraft["type"],
                            correctOptionIds: [],
                          })
                        }
                      >
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE_CHOICE">Single choice</SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">Multiple choice</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        className="w-24"
                        value={q.marks}
                        onChange={(e) => updateQuestion(section.id, q.id, { marks: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Options (check the correct answer{q.type === "MULTIPLE_CHOICE" ? "s" : ""})</p>
                      {q.type === "SINGLE_CHOICE" ? (
                        <RadioGroup
                          value={q.correctOptionIds[0] ?? ""}
                          onValueChange={(v) => toggleCorrect(section.id, q.id, v, q.type)}
                        >
                          {q.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <RadioGroupItem value={opt.id} />
                              <Input
                                className="flex-1"
                                value={opt.text}
                                placeholder="Option text"
                                onChange={(e) => updateOption(section.id, q.id, opt.id, e.target.value)}
                              />
                              {q.options.length > 2 && (
                                <Button variant="ghost" size="icon" onClick={() => removeOption(section.id, q.id, opt.id)}>
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        q.options.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={q.correctOptionIds.includes(opt.id)}
                              onCheckedChange={() => toggleCorrect(section.id, q.id, opt.id, q.type)}
                            />
                            <Input
                              className="flex-1"
                              value={opt.text}
                              placeholder="Option text"
                              onChange={(e) => updateOption(section.id, q.id, opt.id, e.target.value)}
                            />
                            {q.options.length > 2 && (
                              <Button variant="ghost" size="icon" onClick={() => removeOption(section.id, q.id, opt.id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
                      <Button type="button" variant="outline" size="sm" onClick={() => addOption(section.id, q.id)}>
                        <Plus className="h-3.5 w-3.5" /> Add option
                      </Button>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={() => addQuestion(section.id)}>
                  <Plus className="h-3.5 w-3.5" /> Add question
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button type="button" variant="outline" onClick={addSection}>
            <Plus className="h-4 w-4" /> Add section
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSubmit} disabled={loading || !title} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Mock Exam
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
