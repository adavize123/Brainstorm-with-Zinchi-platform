import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { Users, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserFormDialog } from "@/components/dashboard/user-form-dialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { createStudent, updateStudent, deleteStudent } from "@/app/actions/students";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { _count: { select: { enrollments: true } }, createdBy: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Students"
        description="All students on the platform."
        action={<UserFormDialog mode="create" roleLabel="Student" onCreate={createStudent} />}
      />

      {students.length === 0 ? (
        <EmptyState icon={Users} title="No students yet" description="Add the first student account." />
      ) : (
        <div className="rounded-xl border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Added by</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {initials(s.name)}
                        </AvatarFallback>
                      </Avatar>
                      {s.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell>{s._count.enrollments}</TableCell>
                  <TableCell className="text-muted-foreground">{s.createdBy?.name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <UserFormDialog
                        mode="edit"
                        roleLabel="Student"
                        defaultValues={s}
                        onUpdate={updateStudent}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <ConfirmDeleteDialog
                        title="Delete student"
                        description={`This will permanently remove ${s.name} and all their data.`}
                        onConfirm={deleteStudent.bind(null, s.id)}
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
