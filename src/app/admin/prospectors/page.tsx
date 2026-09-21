import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { UserCog, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "@/components/dashboard/user-form-dialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { createProspector, updateProspector, deleteProspector } from "@/app/actions/prospectors";

export default async function AdminProspectorsPage() {
  const prospectors = await prisma.user.findMany({
    where: { role: "PROSPECTOR" },
    include: { _count: { select: { coursesCreated: true, createdUsers: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Prospectors"
        description="Staff who manage students, courses, and assessments."
        action={<UserFormDialog mode="create" roleLabel="Prospector" onCreate={createProspector} />}
      />

      {prospectors.length === 0 ? (
        <EmptyState icon={UserCog} title="No prospectors yet" description="Add your first prospector account." />
      ) : (
        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prospector</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Courses Created</TableHead>
                <TableHead>Students Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospectors.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {initials(p.name)}
                        </AvatarFallback>
                      </Avatar>
                      {p.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.email}</TableCell>
                  <TableCell>{p._count.coursesCreated}</TableCell>
                  <TableCell>{p._count.createdUsers}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <UserFormDialog
                        mode="edit"
                        roleLabel="Prospector"
                        defaultValues={p}
                        onUpdate={updateProspector}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title="Delete prospector"
                        description={`This will permanently remove ${p.name}.`}
                        onConfirm={deleteProspector.bind(null, p.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
