"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground max-w-sm">
        An unexpected error occurred. Please try again, or head back to the homepage.
      </p>
      <div className="flex gap-3 mt-6">
        <Button onClick={reset} variant="outline">
          <RotateCw className="h-4 w-4" /> Try again
        </Button>
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
