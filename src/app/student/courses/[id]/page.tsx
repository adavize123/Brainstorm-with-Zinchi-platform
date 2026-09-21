import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Video, Link as LinkIcon, StickyNote } from "lucide-react";

const materialIcon = { PDF: FileText, VIDEO: Video, LINK: LinkIcon, NOTE: StickyNote } as const;

export default async function StudentCourseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session!.user.id, courseId: params.id } },
    include: { course: true },
  });

  if (!enrollment) notFound();

  const materialAssignments = await prisma.materialAssignment.findMany({
    where: { studentId: session!.user.id, material: { courseId: params.id } },
    include: { material: true },
    orderBy: { assignedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title={enrollment.course.title}
        description={`${enrollment.course.level} · ${enrollment.course.durationWeeks} weeks`}
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Badge variant="secondary" className="mb-3">{enrollment.course.category}</Badge>
          <p className="text-sm text-muted-foreground">{enrollment.course.description}</p>
          <div className="mt-4 max-w-sm">
            <div className="flex justify-between text-xs mb-1">
              <span>Your progress</span>
              <span>{enrollment.progressPercent}%</span>
            </div>
            <Progress value={enrollment.progressPercent} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {materialAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials assigned to you yet.</p>
          ) : (
            <div className="space-y-2">
              {materialAssignments.map(({ material: m }) => {
                const Icon = materialIcon[m.type as keyof typeof materialIcon] ?? StickyNote;
                return (
                  <div key={m.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <Icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{m.title}</p>
                      {m.content && <p className="text-xs text-muted-foreground mt-1">{m.content}</p>}
                      {m.url && (
                        <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                          Open resource
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
