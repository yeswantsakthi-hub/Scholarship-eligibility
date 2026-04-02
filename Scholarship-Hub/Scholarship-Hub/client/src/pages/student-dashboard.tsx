import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useScholarships } from "@/hooks/use-scholarships";
import { useApplications, useCreateApplication } from "@/hooks/use-applications";
import { Layout } from "@/components/layout";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import {
  Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileText, DollarSign, Calendar, Upload, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useAuth();
  const { data: scholarships, isLoading: isScholarshipsLoading } = useScholarships();
  const { data: applications, isLoading: isApplicationsLoading } = useApplications();
  const createApplication = useCreateApplication();

  const [selectedScholarship, setSelectedScholarship] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && (!user || user.isAdmin)) {
      setLocation(user?.isAdmin ? "/admin" : "/");
    }
  }, [user, isUserLoading, setLocation]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.isAdmin) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScholarship || !file) return;

    const formData = new FormData();
    formData.append("scholarshipId", selectedScholarship.id.toString());
    formData.append("document", file);

    createApplication.mutate(formData, {
      onSuccess: () => {
        setIsApplyOpen(false);
        setFile(null);
        setSelectedScholarship(null);
      }
    });
  };

  const openApplyDialog = (scholarship: any) => {
    setSelectedScholarship(scholarship);
    setFile(null);
    setIsApplyOpen(true);
  };

  const myApplicationIds = applications?.map((app: any) => app.scholarshipId) || [];

  return (
    <Layout>
      <div className="space-y-12 pb-12">
        <section className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Welcome back, {user?.username}
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl">
              Explore available scholarships, track your pending applications, and manage your academic future all in one place.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
            <span className="bg-primary/10 text-primary p-2 rounded-lg"><ArrowRight className="w-5 h-5" /></span>
            Available Scholarships
          </h2>

          {isScholarshipsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : scholarships?.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground">No scholarships available</h3>
                <p className="text-muted-foreground mt-2">Check back later for new opportunities.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scholarships?.map((scholarship: any) => {
                const hasApplied = myApplicationIds.includes(scholarship.id);
                return (
                  <Card key={scholarship.id} data-testid={`card-scholarship-${scholarship.id}`} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-xl line-clamp-2">{scholarship.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2 font-medium text-foreground/70">
                        <span className="flex items-center gap-1 text-primary">
                          <DollarSign className="w-4 h-4" />
                          {scholarship.amount.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(scholarship.deadline), 'MMM d, yyyy')}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-muted-foreground line-clamp-3">{scholarship.description}</p>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-border/50">
                      {hasApplied ? (
                        <Button variant="secondary" className="w-full" disabled>
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                          Already Applied
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => openApplyDialog(scholarship)}
                          data-testid={`button-apply-${scholarship.id}`}
                        >
                          Apply Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
            <span className="bg-primary/10 text-primary p-2 rounded-lg"><FileText className="w-5 h-5" /></span>
            My Applications
          </h2>

          {isApplicationsLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : applications?.length === 0 ? (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground">No applications yet</h3>
                <p className="text-muted-foreground mt-2">Find a scholarship above and submit your first application.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border text-muted-foreground text-sm font-medium">
                      <th className="p-4 pl-6">Scholarship</th>
                      <th className="p-4">Applied On</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Remarks</th>
                      <th className="p-4 pr-6 text-right">Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {applications?.map((app: any) => (
                      <tr key={app.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-application-${app.id}`}>
                        <td className="p-4 pl-6 font-medium text-foreground">
                          {app.scholarship?.title || "Unknown Scholarship"}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {format(new Date(app.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="p-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                          {app.remarks || "-"}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <a
                            href={app.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center text-primary hover:underline font-medium text-sm gap-1"
                          >
                            <FileText className="w-4 h-4" />
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Apply for Scholarship</DialogTitle>
            <DialogDescription>{selectedScholarship?.title}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApply} className="space-y-6 pt-4">
            <div className="space-y-3">
              <Label htmlFor="document" className="text-base">Upload Requirement Document</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  id="document"
                  accept=".pdf,.jpg,.jpeg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                <Upload className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">
                  {file ? file.name : "Click or drag file to upload"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG up to 5MB</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!file || createApplication.isPending} data-testid="button-submit-application">
                {createApplication.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
