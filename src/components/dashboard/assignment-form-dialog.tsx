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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createAssignment } from "@/app/actions/assignments";
import { Loader2, Plus } from "lucide-react";

export function AssignmentFormDialog({
  courses,
  students,
}: {
  courses: { id: string; title: string }[];
  students: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  function toggleStudent(id: string) {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      await createAssignment({
        title: String(formData.get("title")),
        description: String(formData.get("description")),
        courseId,
        studentIds,
        dueAt: String(formData.get("dueAt")),
      });
      toast({ title: "Assignment created and assigned", variant: "success" });
      setOpen(false);
      setStudentIds([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={courses.length === 0 || students.length === 0}>
          <Plus className="h-4 w-4" /> New Assignment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Assignment</DialogTitle>
          <DialogDescription>Create an assignment and assign it to students with a deadline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueAt">Due date</Label>
              <Input id="dueAt" name="dueAt" type="datetime-local" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Assign to students</Label>
            <div className="max-h-40 overflow-y-auto space-y-2 rounded-lg border p-3">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={studentIds.includes(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading || studentIds.length === 0}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create & Assign
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
