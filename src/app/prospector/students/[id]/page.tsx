import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/dashboard/deadline-badge";
import { initials } from "@/lib/utils";
import { EnrollCourseDialog } from "@/components/dashboard/enroll-course-dialog";
import { computeExamResult } from "@/lib/exam-standards";

export default async function ProspectorStudentDetailPage({ params }: { params: { id: string } }) {
  const student = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      enrollments: { include: { course: true } },
      assignmentTargets: { include: { assignment: true } },
      examAssignments: { include: { mockExam: true, attempt: true } },
    },
  });

  if (!student || student.role !== "STUDENT") notFound();

  const enrolledCourseIds = new Set(student.enrollments.map((e) => e.courseId));
  const allCourses = await prisma.course.findMany({ where: { isPublished: true } });
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.has(c.id));

  return (
    <div>
      <PageHeader title={student.name} description={student.email} />

      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
            {initials(student.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{student.name}</p>
          <p className="text-sm text-muted-foreground">{student.phone ?? "No phone on file"}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Enrolled Courses</CardTitle>
            <EnrollCourseDialog studentId={student.id} availableCourses={availableCourses} />
          </CardHeader>
          <CardContent className="space-y-4">
            {student.enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not enrolled in any course yet.</p>
            ) : (
              student.enrollments.map((e) => (
                <div key={e.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{e.course.title}</span>
                    <span className="text-muted-foreground">{e.progressPercent}%</span>
                  </div>
                  <Progress value={e.progressPercent} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {student.assignmentTargets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments yet.</p>
            ) : (
              student.assignmentTargets.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm">{t.assignment.title}</span>
                  <StatusBadge status={t.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mock Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {student.examAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No mock tests assigned yet.</p>
            ) : (
              student.examAssignments.map((e) => {
                const result =
                  e.status === "GRADED" && e.attempt
                    ? computeExamResult(e.attempt.score ?? 0, e.attempt.totalMarks ?? 0, e.mockExam.examType)
                    : null;
                return (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border p-3 gap-3 flex-wrap">
                    <span className="text-sm">{e.mockExam.title}</span>
                    <div className="flex items-center gap-2">
                      {result && (
                        <span className="text-sm text-muted-foreground">
                          {result.scaledDisplay} / {result.maxScaledDisplay}
                        </span>
                      )}
                      {result && <Badge variant={result.grade.variant}>{result.grade.label}</Badge>}
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
