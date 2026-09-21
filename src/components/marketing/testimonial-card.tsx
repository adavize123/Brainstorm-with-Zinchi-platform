import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";

export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  quote: string;
}

export function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6 flex flex-col h-full">
        <Quote className="h-6 w-6 text-secondary mb-3" />
        <p className="text-sm text-muted-foreground flex-1">&ldquo;{testimonial.quote}&rdquo;</p>
        <div className="mt-6 flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials(testimonial.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
