import { FadeIn, StaggerGroup, StaggerItem } from "@/components/motion";
import { Target, Eye, ShieldCheck, Users, Award, Clock, GraduationCap, Plane, FileCheck2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Zinchi International is an education and immigration facilitation firm founded in 2010, guiding students and families through studying abroad, visas, and global opportunity.",
};

const stats = [
  { icon: Users, value: "300+", label: "Clients Served Worldwide" },
  { icon: ShieldCheck, value: "95%+", label: "Visa & Admission Success Rate" },
  { icon: Award, value: "10+", label: "Years of Industry Experience" },
];

const values = [
  {
    icon: Target,
    title: "Our Mission",
    body:
      "We deliver superior value through the efforts of our diverse people, resources, and affiliations with relevant organizations — devoted to our clients' success while contributing meaningfully to our community.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    body:
      "To become the global leader in delivering education and immigration interventions that solve our clients' most demanding challenges.",
  },
  {
    icon: ShieldCheck,
    title: "Our Values",
    body:
      "Integrity, transparency, and exceptional service are the principles our knowledgeable, dedicated team brings to every client relationship.",
  },
];

const services = [
  {
    icon: GraduationCap,
    title: "Study Abroad Advising",
    body: "Personalized guidance for students pursuing education opportunities across the globe.",
  },
  {
    icon: FileCheck2,
    title: "Visa & Immigration Support",
    body: "Assistance with study, work, and residency visas, as well as dual citizenship applications.",
  },
  {
    icon: Clock,
    title: "Standardized Test Preparation",
    body: "Structured support for TOEFL, IELTS, SAT, and GRE — the foundation of Brainstorm with Zinchi.",
  },
  {
    icon: Plane,
    title: "Program Placement",
    body: "Placement assistance for summer courses, voluntary work, and internships internationally.",
  },
];

export default function AboutPage() {
  return (
    <div className="container py-14 max-w-4xl">
      <FadeIn>
        <h1 className="text-3xl md:text-4xl font-bold">About Zinchi International</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Founded in August 2010, Zinchi International is an education and immigration
          facilitation firm based in Abuja, Nigeria and Newcastle Upon Tyne, United Kingdom. For
          over a decade we&apos;ve guided students, families, and professionals around the world
          through the complexities of studying abroad, obtaining visas, and facilitating
          international relocations. Brainstorm with Zinchi brings that same guidance online — a
          single platform where students, prospectors, and administrators collaborate toward one
          goal: student success.
        </p>
      </FadeIn>

      <StaggerGroup className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border p-5 text-center">
              <s.icon className="mx-auto h-6 w-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <StaggerGroup className="mt-6 grid gap-6 md:grid-cols-3">
        {values.map((v) => (
          <StaggerItem key={v.title}>
            <div className="rounded-xl border p-6 h-full">
              <v.icon className="h-6 w-6 text-primary mb-3" />
              <h3 className="font-semibold">{v.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{v.body}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <FadeIn delay={0.1}>
        <h2 className="text-xl font-bold mt-14 mb-6">What We Do</h2>
      </FadeIn>
      <StaggerGroup className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <StaggerItem key={s.title}>
            <div className="rounded-xl border p-5 flex items-start gap-3 h-full">
              <s.icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h3 className="font-medium text-sm">{s.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.body}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
