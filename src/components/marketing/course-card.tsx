import Link from "next/link";
import { Clock, BarChart3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface CourseCardData {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  durationWeeks: number;
}

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="h-32 gradient-primary flex items-end p-4">
        <Badge variant="secondary">{course.category}</Badge>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.durationWeeks} weeks
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> {course.level}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" className="w-full justify-between">
          <Link href={`/courses/${course.slug}`}>
            View course <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
