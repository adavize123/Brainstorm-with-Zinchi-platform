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
import { useToast } from "@/components/ui/use-toast";
import { createTestimonial, updateTestimonial } from "@/app/actions/testimonials";
import { Loader2, Plus, Pencil } from "lucide-react";

interface TestimonialFormDialogProps {
  mode: "create" | "edit";
  testimonial?: {
    id: string;
    name: string;
    role: string;
    quote: string;
    avatarUrl: string | null;
    isPublished: boolean;
    order: number;
  };
}

export function TestimonialFormDialog({ mode, testimonial }: TestimonialFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPublished, setIsPublished] = useState(testimonial?.isPublished ?? true);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    const payload = {
      name: String(formData.get("name")),
      role: String(formData.get("role")),
      quote: String(formData.get("quote")),
      avatarUrl: (formData.get("avatarUrl") as string) || "",
      isPublished,
      order: Number(formData.get("order") || 0),
    };

    try {
      if (mode === "create") {
        await createTestimonial(payload);
        toast({ title: "Testimonial added", variant: "success" });
      } else if (testimonial) {
        await updateTestimonial(testimonial.id, payload);
        toast({ title: "Testimonial updated", variant: "success" });
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
            <Plus className="h-4 w-4" /> Add Testimonial
          </Button>
        ) : (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Testimonial" : "Edit Testimonial"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new testimonial to feature on the public site."
              : "Update this testimonial."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required defaultValue={testimonial?.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role / description</Label>
              <Input id="role" name="role" required placeholder="e.g. SAT Student, 2025" defaultValue={testimonial?.role} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quote">Quote</Label>
            <Textarea id="quote" name="quote" required rows={4} defaultValue={testimonial?.quote} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">Avatar URL (optional)</Label>
              <Input id="avatarUrl" name="avatarUrl" type="url" placeholder="https://..." defaultValue={testimonial?.avatarUrl ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order">Display order</Label>
              <Input id="order" name="order" type="number" min={0} defaultValue={testimonial?.order ?? 0} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={isPublished} onCheckedChange={(v) => setIsPublished(Boolean(v))} />
            Published (visible on the public site)
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Add testimonial" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
