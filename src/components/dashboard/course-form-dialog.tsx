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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createCourse, updateCourse } from "@/app/actions/courses";
import { Loader2, Plus, Pencil } from "lucide-react";

interface CourseFormDialogProps {
  mode: "create" | "edit";
  course?: {
    id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    durationWeeks: number;
  };
}

export function CourseFormDialog({ mode, course }: CourseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [level, setLevel] = useState(course?.level ?? "Beginner");
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    const payload = {
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      category: String(formData.get("category")),
      level,
      durationWeeks: Number(formData.get("durationWeeks")),
      imageUrl: "",
      isPublished: true,
    };

    try {
      if (mode === "create") {
        await createCourse(payload);
        toast({ title: "Course created", variant: "success" });
      } else if (course) {
        await updateCourse(course.id, payload);
        toast({ title: "Course updated", variant: "success" });
      }
      setOpen(false);
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
        {mode === "create" ? (
          <Button>
            <Plus className="h-4 w-4" /> New Course
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Course" : "Edit Course"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Create a new course for students." : "Update course details."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required defaultValue={course?.title} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required rows={4} defaultValue={course?.description} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required defaultValue={course?.category ?? "Test Prep"} />
            </div>
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="durationWeeks">Duration (weeks)</Label>
            <Input
              id="durationWeeks"
              name="durationWeeks"
              type="number"
              min={1}
              max={104}
              required
              defaultValue={course?.durationWeeks ?? 4}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create course" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
