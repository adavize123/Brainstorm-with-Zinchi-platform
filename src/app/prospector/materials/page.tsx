import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, X } from "lucide-react";
import { MaterialFormDialog } from "@/components/dashboard/material-form-dialog";
import { AssignMaterialDialog } from "@/components/dashboard/assign-material-dialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { deleteMaterial, unassignMaterial } from "@/app/actions/materials";

export default async function ProspectorMaterialsPage() {
  const [materials, courses, enrollments] = await Promise.all([
    prisma.material.findMany({
      include: { course: true, assignments: { include: { student: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({ orderBy: { title: "asc" } }),
    prisma.enrollment.findMany({ include: { student: true } }),
  ]);

  const enrolledByCourse = new Map<string, { id: string; name: string }[]>();
  for (const e of enrollments) {
    const list = enrolledByCourse.get(e.courseId) ?? [];
    list.push({ id: e.student.id, name: e.student.name });
    enrolledByCourse.set(e.courseId, list);
  }

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Upload materials per course, then assign them to students enrolled in that course."
        action={<MaterialFormDialog courses={courses} />}
      />

      {materials.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No materials yet" description="Add your first study material." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {materials.map((m) => {
            const enrolledStudents = enrolledByCourse.get(m.courseId) ?? [];
            const assignedIds = new Set(m.assignments.map((a) => a.studentId));
            const availableStudents = enrolledStudents.filter((s) => !assignedIds.has(s.id));

            return (
              <Card key={m.id}>
                <CardContent className="pt-6 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.title}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline">{m.type}</Badge>
                      <Badge variant="secondary">{m.course.title}</Badge>
                    </div>
                    {m.content && <p className="text-xs text-muted-foreground mt-2">{m.content}</p>}

                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Assigned to {m.assignments.length} student{m.assignments.length === 1 ? "" : "s"}
                      </p>
                      {m.assignments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {m.assignments.map((a) => (
                            <Badge key={a.id} variant="outline" className="gap-1 pr-1">
                              {a.student.name}
                              <form action={unassignMaterial.bind(null, m.id, a.studentId)}>
                                <button type="submit" className="ml-1 rounded-full hover:bg-muted p-0.5" title="Unassign">
                                  <X className="h-3 w-3" />
                                </button>
                              </form>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <AssignMaterialDialog
                        materialId={m.id}
                        courseTitle={m.course.title}
                        availableStudents={availableStudents}
                      />
                    </div>
                  </div>
                  <ConfirmDeleteDialog
                    title="Delete material"
                    description={`Remove "${m.title}" from ${m.course.title}?`}
                    onConfirm={deleteMaterial.bind(null, m.id)}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
