import { Mail, Phone, MapPin } from "lucide-react";
import { EnquiryForm } from "@/components/marketing/enquiry-form";
import { FadeIn } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { CONTACT_EMAIL, CONTACT_OFFICES } from "@/lib/contact";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Zinchi International or book a consultation.",
};

export default function ContactPage() {
  return (
    <div className="container py-14 grid gap-10 md:grid-cols-2">
      <FadeIn>
        <h1 className="text-3xl md:text-4xl font-bold">Contact Us</h1>
        <p className="text-muted-foreground mt-3 max-w-md">
          Have a question or want to book a consultation with a Zinchi prospector? Send us a
          message and we&apos;ll respond within one business day.
        </p>

        <div className="mt-8 space-y-4">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary">{CONTACT_EMAIL}</a>
            </CardContent>
          </Card>
          {CONTACT_OFFICES.map((office) => (
            <Card key={office.country}>
              <CardContent className="pt-6 space-y-2">
                <p className="font-medium text-sm">{office.country} Office</p>
                <p className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" /> {office.address}
                </p>
                <p className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-5 w-5 text-primary shrink-0" /> {office.phones.join(" / ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardContent className="pt-6">
            <EnquiryForm source="CONTACT" submitLabel="Send Message" />
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
