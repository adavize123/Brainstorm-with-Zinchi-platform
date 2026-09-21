import { EnquiryForm } from "@/components/marketing/enquiry-form";
import { FadeIn } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to a Zinchi International program.",
};

const steps = [
  "Submit your application below",
  "Our team reviews it within 2 business days",
  "You're matched with a prospector who sets up your account",
  "Start learning on your student dashboard",
];

export default function ApplyPage() {
  return (
    <div className="container py-14 grid gap-10 md:grid-cols-2">
      <FadeIn>
        <h1 className="text-3xl md:text-4xl font-bold">Apply to Zinchi</h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          Tell us about yourself and your goals. A member of our team will follow up to set up
          your student account.
        </p>
        <ol className="mt-8 space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardContent className="pt-6">
            <EnquiryForm source="APPLY" submitLabel="Submit Application" />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
