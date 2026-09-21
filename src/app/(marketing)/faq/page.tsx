import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FadeIn } from "@/components/motion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Zinchi International's programs.",
};

const faqs = [
  {
    q: "Who can apply to Zinchi International's programs?",
    a: "Any student preparing for standardized tests (SAT and similar) or seeking scholarship and study-abroad guidance can apply through our Apply page. Our team reviews every application.",
  },
  {
    q: "How are students matched with a prospector?",
    a: "Once your application is reviewed, an admin or prospector creates your student account and assigns you to a course. Your prospector then tailors materials, assignments, and mock exams to your goals.",
  },
  {
    q: "How do mock exams work?",
    a: "Prospectors build mock exams with timed sections and questions, then assign them to students with a due date. You take the exam from your dashboard within the time limit, and results are graded automatically.",
  },
  {
    q: "What happens if I miss an assignment deadline?",
    a: "Assignments past their due date are marked as late on your dashboard. We encourage you to communicate with your prospector as early as possible if you need an extension.",
  },
  {
    q: "Is there a cost to join?",
    a: "Program fees vary by course. Submit an application or contact us for current pricing and any available support for qualifying students.",
  },
];

export default function FaqPage() {
  return (
    <div className="container py-14 max-w-3xl">
      <FadeIn>
        <h1 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h1>
      </FadeIn>
      <FadeIn delay={0.1}>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </FadeIn>
    </div>
  );
}
