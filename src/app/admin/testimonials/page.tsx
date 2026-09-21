import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { Quote } from "lucide-react";
import { TestimonialFormDialog } from "@/components/dashboard/testimonial-form-dialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/confirm-delete-dialog";
import { deleteTestimonial } from "@/app/actions/testimonials";

export default async function AdminTestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <PageHeader
        title="Testimonials"
        description="Manage the testimonials featured on the public site."
        action={<TestimonialFormDialog mode="create" />}
      />

      {testimonials.length === 0 ? (
        <EmptyState icon={Quote} title="No testimonials yet" description="Add your first testimonial." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((t) => (
            <Card key={t.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {initials(t.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <TestimonialFormDialog mode="edit" testimonial={t} />
                    <ConfirmDeleteDialog
                      title="Delete testimonial"
                      description={`Remove ${t.name}'s testimonial from the public site?`}
                      onConfirm={deleteTestimonial.bind(null, t.id)}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={t.isPublished ? "success" : "outline"}>
                    {t.isPublished ? "Published" : "Hidden"}
                  </Badge>
                  <Badge variant="outline">Order: {t.order}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
