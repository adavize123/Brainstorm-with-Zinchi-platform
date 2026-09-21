"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEnquiryStatus } from "@/app/actions/enquiries";
import { useToast } from "@/components/ui/use-toast";

const statuses = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"];

export function EnquiryStatusSelect({ id, status }: { id: string; status: string }) {
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  function handleChange(next: string) {
    setValue(next);
    startTransition(async () => {
      try {
        await updateEnquiryStatus(id, next);
        router.refresh();
      } catch (err) {
        toast({
          title: "Update failed",
          description: err instanceof Error ? err.message : "Something went wrong.",
          variant: "destructive",
        });
        setValue(status);
      }
    });
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s} value={s}>{s}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
