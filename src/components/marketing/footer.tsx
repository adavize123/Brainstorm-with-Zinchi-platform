import Link from "next/link";
import { GraduationCap, Mail, MapPin, Phone, Facebook, Instagram, Twitter, Music2 } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_OFFICES, SOCIAL_LINKS, BRAND_TAGLINE } from "@/lib/contact";

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "X (Twitter)": Twitter,
  Facebook: Facebook,
  Instagram: Instagram,
  TikTok: Music2,
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <GraduationCap className="h-6 w-6" />
            <span>Brainstorm with Zinchi</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            Zinchi International&apos;s learning platform, guiding students toward test-prep success
            and global opportunities.
          </p>
          <p className="mt-3 text-sm italic text-muted-foreground max-w-xs">&ldquo;{BRAND_TAGLINE}&rdquo;</p>
          <div className="flex items-center gap-3 mt-4">
            {SOCIAL_LINKS.map((s) => {
              const Icon = socialIcons[s.label] ?? Twitter;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/courses" className="hover:text-primary">Courses</Link></li>
            <li><Link href="/about" className="hover:text-primary">About Zinchi</Link></li>
            <li><Link href="/testimonials" className="hover:text-primary">Testimonials</Link></li>
            <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Get Started</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/apply" className="hover:text-primary">Apply Now</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Book a Consultation</Link></li>
            <li><Link href="/login" className="hover:text-primary">Student / Staff Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary">{CONTACT_EMAIL}</a>
            </li>
            {CONTACT_OFFICES.map((office) => (
              <li key={office.country}>
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium text-foreground">{office.country}:</span> {office.address}
                  </span>
                </p>
                <p className="flex items-center gap-2 mt-1 pl-6">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  {office.phones.join(" / ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Zinchi International. All rights reserved.
      </div>
    </footer>
  );
}
