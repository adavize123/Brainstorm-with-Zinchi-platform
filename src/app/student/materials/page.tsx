import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Video, Link as LinkIcon, StickyNote, FolderOpen } from "lucide-react";

const materialIcon = { PDF: FileText, VIDEO: Video, LINK: LinkIcon, NOTE: StickyNote } as const;

export default async function StudentMaterialsPage() {
  const session = await getServerSession(authOptions);

  const materialAssignments = await prisma.materialAssignment.findMany({
    where: { studentId: session!.user.id },
    include: { material: { include: { course: true } } },
    orderBy: { assignedAt: "desc" },
  });

  const materials = materialAssignments.map(({ material: m }) => ({ ...m, courseTitle: m.course.title }));

  return (
    <div>
      <PageHeader title="Materials" description="Study materials assigned to you by your prospector." />

      {materials.length === 0 ? (
        <EmptyState icon={FolderOpen} title="No materials yet" description="Materials will appear here once your prospector assigns them to you." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {materials.map((m) => {
            const Icon = materialIcon[m.type as keyof typeof materialIcon] ?? StickyNote;
            return (
              <Card key={m.id}>
                <CardContent className="pt-6 flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{m.title}</p>
                    <Badge variant="outline" className="mt-1">{m.courseTitle}</Badge>
                    {m.content && <p className="text-xs text-muted-foreground mt-2">{m.content}</p>}
                    {m.url && (
                      <a href={m.url} target="_blank" rel="noreferrer" className="block mt-2 text-xs text-primary hover:underline">
                        Open resource
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
