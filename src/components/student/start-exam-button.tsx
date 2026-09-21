"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { startExamAttempt } from "@/app/actions/mock-exams";
import { Loader2 } from "lucide-react";

export function StartExamButton({ examAssignmentId }: { examAssignmentId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleStart() {
    setLoading(true);
    try {
      await startExamAttempt(examAssignmentId);
      router.refresh();
    } catch (err) {
      toast({
        title: "Could not start exam",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <Button size="lg" onClick={handleStart} disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      Start Exam
    </Button>
  );
}
