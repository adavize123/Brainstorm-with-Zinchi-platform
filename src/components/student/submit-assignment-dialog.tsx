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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { submitAssignment } from "@/app/actions/assignments";
import { Loader2 } from "lucide-react";

export function SubmitAssignmentDialog({
  targetId,
  assignmentTitle,
  defaultText,
  defaultUrl,
  triggerLabel = "Submit",
}: {
  targetId: string;
  assignmentTitle: string;
  defaultText?: string | null;
  defaultUrl?: string | null;
  triggerLabel?: string;
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
      await submitAssignment(targetId, {
        submissionText: formData.get("submissionText") || undefined,
        submissionUrl: formData.get("submissionUrl") || undefined,
      });
      toast({ title: "Submitted", description: "Your assignment has been submitted.", variant: "success" });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: "Submission failed",
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
        <Button size="sm">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{assignmentTitle}</DialogTitle>
          <DialogDescription>Submit your work as text and/or a link.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="submissionText">Your answer</Label>
            <Textarea id="submissionText" name="submissionText" rows={5} defaultValue={defaultText ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="submissionUrl">Link (optional)</Label>
            <Input id="submissionUrl" name="submissionUrl" type="url" placeholder="https://..." defaultValue={defaultUrl ?? ""} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
