import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary p-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mb-8">
        <GraduationCap className="h-7 w-7" />
        <span>
          Brainstorm with <span className="text-secondary">Zinchi</span>
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
