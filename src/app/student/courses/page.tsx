import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export default async function StudentCoursesPage() {
  const session = await getServerSession(authOptions);
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: session!.user.id },
    include: { course: true },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div>
      <PageHeader title="My Courses" description="Courses assigned to you by your prospector." />

      {enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Once your prospector assigns you a course, it will appear here."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <Card key={e.id}>
              <CardHeader>
                <Badge variant="secondary" className="w-fit mb-2">{e.course.category}</Badge>
                <CardTitle className="text-base">{e.course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{e.course.description}</p>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{e.progressPercent}%</span>
                  </div>
                  <Progress value={e.progressPercent} />
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="w-full justify-between">
                  <Link href={`/student/courses/${e.course.id}`}>
                    Open course <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
