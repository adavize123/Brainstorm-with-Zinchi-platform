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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";

interface UserFormDialogProps {
  mode: "create" | "edit";
  roleLabel: string;
  defaultValues?: { id: string; name: string; email: string; phone: string | null };
  onCreate?: (input: { name: string; email: string; password: string; phone?: string }) => Promise<unknown>;
  onUpdate?: (id: string, input: { name: string; phone?: string }) => Promise<void>;
  trigger?: React.ReactNode;
}

export function UserFormDialog({
  mode,
  roleLabel,
  defaultValues,
  onCreate,
  onUpdate,
  trigger,
}: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);

    try {
      if (mode === "create" && onCreate) {
        await onCreate({
          name: String(formData.get("name")),
          email: String(formData.get("email")),
          password: String(formData.get("password")),
          phone: (formData.get("phone") as string) || undefined,
        });
        toast({ title: `${roleLabel} added`, variant: "success" });
      } else if (mode === "edit" && onUpdate && defaultValues) {
        await onUpdate(defaultValues.id, {
          name: String(formData.get("name")),
          phone: (formData.get("phone") as string) || undefined,
        });
        toast({ title: `${roleLabel} updated`, variant: "success" });
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
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> Add {roleLabel}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? `Add ${roleLabel}` : `Edit ${roleLabel}`}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? `Create a new ${roleLabel.toLowerCase()} account and share the credentials with them.`
              : `Update ${defaultValues?.name}'s details.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required defaultValue={defaultValues?.name} />
          </div>
          {mode === "create" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Temporary password</Label>
                <Input id="password" name="password" type="password" required minLength={8} />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={defaultValues?.email} disabled />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create account" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
