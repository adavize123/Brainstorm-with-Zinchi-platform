"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { submitEnquiry, type EnquiryFormState } from "@/app/actions/enquiry";

const initialState: EnquiryFormState = { success: false, message: "" };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Sending..." : label}
    </Button>
  );
}

export function EnquiryForm({
  source,
  submitLabel = "Send Message",
}: {
  source: "CONTACT" | "APPLY";
  submitLabel?: string;
}) {
  const [state, formAction] = useFormState(submitEnquiry, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.message) return;
    toast({
      title: state.success ? "Message sent" : "Something went wrong",
      description: state.message,
      variant: state.success ? "success" : "destructive",
    });
    if (state.success) formRef.current?.reset();
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="source" value={source} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required placeholder="Jane Doe" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" placeholder="+234 800 000 0000" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">
          {source === "APPLY" ? "Tell us about your goals" : "Message"}
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={
            source === "APPLY"
              ? "Which program are you interested in? What are you hoping to achieve?"
              : "How can we help?"
          }
        />
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
