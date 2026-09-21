import Link from "next/link";
import { GraduationCap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-primary p-4 text-center text-white">
      <GraduationCap className="h-10 w-10 mb-4" />
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-3 text-white/80 max-w-sm">
        We couldn&apos;t find the page you&apos;re looking for. It may have been moved or no
        longer exists.
      </p>
      <Button asChild size="lg" variant="secondary" className="mt-6">
        <Link href="/">
          <Home className="h-4 w-4" /> Back to home
        </Link>
      </Button>
    </div>
  );
}
