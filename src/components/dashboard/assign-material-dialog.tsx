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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { assignMaterial } from "@/app/actions/materials";
import { Loader2, Send } from "lucide-react";

export function AssignMaterialDialog({
  materialId,
  courseTitle,
  availableStudents,
}: {
  materialId: string;
  courseTitle: string;
  availableStudents: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  function toggle(id: string) {
    setStudentIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await assignMaterial(materialId, { studentIds });
      toast({ title: "Material assigned", variant: "success" });
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
        <Button size="sm" variant="outline" disabled={availableStudents.length === 0}>
          <Send className="h-3.5 w-3.5" /> Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Material</DialogTitle>
          <DialogDescription>
            Only students enrolled in &ldquo;{courseTitle}&rdquo; can receive this material.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {availableStudents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Every student enrolled in this course already has this material.
            </p>
          ) : (
            <div className="max-h-56 overflow-y-auto space-y-2 rounded-lg border p-3">
              {availableStudents.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={studentIds.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
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
