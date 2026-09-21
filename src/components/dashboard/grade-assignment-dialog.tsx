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
import { useToast } from "@/components/ui/use-toast";
import { gradeAssignment } from "@/app/actions/assignments";
import { Loader2 } from "lucide-react";

export function GradeAssignmentDialog({
  targetId,
  studentName,
  submissionText,
  submissionUrl,
}: {
  targetId: string;
  studentName: string;
  submissionText?: string | null;
  submissionUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await gradeAssignment(targetId, {
        grade: Number(formData.get("grade")),
        feedback: (formData.get("feedback") as string) || undefined,
      });
      toast({ title: "Grade submitted", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: "Failed to grade",
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
        <Button size="sm">Grade</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grade submission — {studentName}</DialogTitle>
          <DialogDescription>Review the submission and assign a grade.</DialogDescription>
        </DialogHeader>
        {(submissionText || submissionUrl) && (
          <div className="rounded-lg bg-muted p-3 text-sm space-y-2">
            {submissionText && <p>{submissionText}</p>}
            {submissionUrl && (
              <a href={submissionUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline block">
                {submissionUrl}
              </a>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="grade">Grade (0-100)</Label>
            <Input id="grade" name="grade" type="number" min={0} max={100} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea id="feedback" name="feedback" rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit grade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
