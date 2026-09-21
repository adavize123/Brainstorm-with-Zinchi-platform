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
import { useToast } from "@/components/ui/use-toast";
import { enrollStudents } from "@/app/actions/courses";
import { Loader2, Plus } from "lucide-react";

export function EnrollCourseDialog({
  studentId,
  availableCourses,
}: {
  studentId: string;
  availableCourses: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string>("");
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit() {
    if (!selected) return;
    setLoading(true);
    try {
      await enrollStudents(selected, [studentId]);
      toast({ title: "Enrolled", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: "Enrollment failed",
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
        <Button size="sm">
          <Plus className="h-4 w-4" /> Enroll in course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll in a course</DialogTitle>
          <DialogDescription>Select a course to assign to this student.</DialogDescription>
        </DialogHeader>
        {availableCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Already enrolled in all available courses.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableCourses.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  name="course"
                  value={c.id}
                  checked={selected === c.id}
                  onChange={() => setSelected(c.id)}
                />
                {c.title}
              </label>
            ))}
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading || !selected}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enroll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
