import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { CourseFormDialog } from "@/components/dashboard/course-form-dialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { deleteCourse } from "@/app/actions/courses";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    include: { createdBy: true, _count: { select: { enrollments: true, materials: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Oversight of every course on the platform."
        action={<CourseFormDialog mode="create" />}
      />

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create the first course." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <Badge variant="secondary" className="mb-2">{c.category}</Badge>
                  <CardTitle className="text-base">{c.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <CourseFormDialog mode="edit" course={c} />
                  <ConfirmDeleteDialog
                    title="Delete course"
                    description={`This will remove "${c.title}" and all its materials and assignments.`}
                    onConfirm={deleteCourse.bind(null, c.id)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="flex gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
                  <span>{c._count.enrollments} students</span>
                  <span>{c._count.materials} materials</span>
                  <span>By {c.createdBy.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
