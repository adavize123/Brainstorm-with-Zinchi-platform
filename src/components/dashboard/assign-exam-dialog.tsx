"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { assignMockExam } from "@/app/actions/mock-exams";
import { Loader2, Send } from "lucide-react";

export function AssignExamDialog({
  mockExamId,
  students,
}: {
  mockExamId: string;
  students: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  function toggle(id: string) {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await assignMockExam(mockExamId, { studentIds, dueAt: String(formData.get("dueAt")) });
      toast({ title: "Mock exam assigned", variant: "success" });
      setOpen(false);
      setStudentIds([]);
      router.refresh();
    } catch (err) {
      toast({
        title: "Failed to assign",
        description: err instanceof Error ? err.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Send className="h-3.5 w-3.5" /> Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Mock Exam</DialogTitle>
          <DialogDescription>Choose students and a due date.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dueAt">Due date</Label>
            <Input id="dueAt" name="dueAt" type="datetime-local" required />
          </div>
          <div className="space-y-1.5">
            <Label>Students</Label>
            <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border p-3">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={studentIds.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || studentIds.length === 0}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
