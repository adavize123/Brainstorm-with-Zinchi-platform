import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { EnquiryStatusSelect } from "@/components/dashboard/enquiry-status-select";
import { ConvertEnquiryDialog } from "@/components/dashboard/convert-enquiry-dialog";

export default async function AdminEnquiriesPage() {
  const [enquiries, users] = await Promise.all([
    prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ select: { email: true } }),
  ]);
  const existingEmails = new Set(users.map((u) => u.email.toLowerCase()));

  return (
    <div>
      <PageHeader title="Enquiries" description="Contact and application form submissions." />

      {enquiries.length === 0 ? (
        <EmptyState icon={Inbox} title="No enquiries yet" description="Submissions from the Contact and Apply pages will appear here." />
      ) : (
        <div className="rounded-xl border bg-background overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enquiries.map((e) => {
                const hasAccount = existingEmails.has(e.email.toLowerCase());
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div>{e.email}</div>
                      {e.phone && <div>{e.phone}</div>}
                    </TableCell>
                    <TableCell><Badge variant="outline">{e.source}</Badge></TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{e.message}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(e.createdAt)}</TableCell>
                    <TableCell>
                      <EnquiryStatusSelect id={e.id} status={e.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {hasAccount ? (
                        <span className="text-xs text-muted-foreground">Has account</span>
                      ) : (
                        <ConvertEnquiryDialog enquiryId={e.id} name={e.name} email={e.email} phone={e.phone} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
