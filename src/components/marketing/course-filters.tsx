"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CourseFilters({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  function updateParams(next: { q?: string; category?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.category !== undefined) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const value = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
          updateParams({ q: value });
        }}
        className="flex gap-2 max-w-md"
      >
        <Input name="q" placeholder="Search courses..." defaultValue={q} />
        <Button type="submit" size="icon" variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={category === "" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => updateParams({ category: "" })}
          >
            All
          </Badge>
          {categories.map((c) => (
            <Badge
              key={c}
              variant={category === c ? "default" : "outline"}
              className={cn("cursor-pointer")}
              onClick={() => updateParams({ category: c })}
            >
              {c}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
