import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useScholarships, useCreateScholarship, useDeleteScholarship } from "@/hooks/use-scholarships";
import { useApplications, useUpdateApplicationStatus } from "@/hooks/use-applications";
import { Layout } from "@/components/layout";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Plus, Trash2, FileText, Loader2, ShieldCheck, ClipboardCheck } from "lucide-react";

export function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: isUserLoading } = useAuth();
  const { data: scholarships, isLoading: isScholarshipsLoading } = useScholarships();
  const { data: applications, isLoading: isApplicationsLoading } = useApplications();

  const createScholarship = useCreateScholarship();
  const deleteScholarship = useDeleteScholarship();
  const updateStatus = useUpdateApplicationStatus();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [reviewApp, setReviewApp] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected' | 'Pending'>('Pending');
  const [reviewRemarks, setReviewRemarks] = useState("");

  useEffect(() => {
    if (!isUserLoading && (!user || !user.isAdmin)) {
      setLocation("/");
    }
  }, [user, isUserLoading, setLocation]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  const handleCreateScholarship = (e: React.FormEvent) => {
    e.preventDefault();
    createScholarship.mutate(
      { title: newTitle, description: newDesc, amount: Number(newAmount), deadline: newDeadline },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewTitle(""); setNewDesc(""); setNewAmount(""); setNewDeadline("");
        }
      }
    );
  };

  const handleReviewApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewApp) return;
    updateStatus.mutate(
      { id: reviewApp.id, status: reviewStatus, remarks: reviewRemarks },
      { onSuccess: () => setReviewApp(null) }
    );
  };

  const openReviewDialog = (app: any) => {
    setReviewApp(app);
    setReviewStatus(app.status);
    setReviewRemarks(app.remarks || "");
  };

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-muted-foreground mt-1">Manage scholarships and review student applications.</p>
          </div>
          <ShieldCheck className="h-12 w-12 text-primary opacity-20" />
        </div>

        <Tabs defaultValue="applications" className="w-full space-y-6">
          <TabsList className="bg-muted/50 p-1 w-full max-w-md grid grid-cols-2 rounded-xl">
            <TabsTrigger value="applications" className="rounded-lg font-medium">Applications</TabsTrigger>
            <TabsTrigger value="scholarships" className="rounded-lg font-medium">Scholarships</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="border-b bg-muted/10 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                  Application Queue
                </CardTitle>
                <CardDescription>Review and process incoming student applications.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isApplicationsLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : applications?.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">No applications found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm font-medium">
                          <th className="p-4 pl-6">Student</th>
                          <th className="p-4">Scholarship</th>
                          <th className="p-4">Applied</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {applications?.map((app: any) => (
                          <tr key={app.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-admin-application-${app.id}`}>
                            <td className="p-4 pl-6 font-medium text-foreground">{app.student?.username}</td>
                            <td className="p-4 text-muted-foreground max-w-[200px] truncate">{app.scholarship?.title}</td>
                            <td className="p-4 text-muted-foreground text-sm">
                              {format(new Date(app.createdAt), 'MMM d, yyyy')}
                            </td>
                            <td className="p-4"><StatusBadge status={app.status} /></td>
                            <td className="p-4 pr-6 text-right">
                              <Button variant="outline" size="sm" onClick={() => openReviewDialog(app)} data-testid={`button-review-${app.id}`}>
                                Review
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scholarships" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setIsCreateOpen(true)} className="shadow-md" data-testid="button-create-scholarship">
                <Plus className="w-4 h-4 mr-2" />
                Create Scholarship
              </Button>
            </div>

            <Card className="border-border shadow-sm">
              <CardHeader className="border-b bg-muted/10 pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Active Scholarships
                </CardTitle>
                <CardDescription>Manage your currently listed scholarship offerings.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isScholarshipsLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : scholarships?.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">No scholarships listed.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm font-medium">
                          <th className="p-4 pl-6">Title</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Deadline</th>
                          <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {scholarships?.map((scholarship: any) => (
                          <tr key={scholarship.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-scholarship-${scholarship.id}`}>
                            <td className="p-4 pl-6 font-medium text-foreground max-w-xs truncate">{scholarship.title}</td>
                            <td className="p-4 text-green-600 font-medium">${scholarship.amount.toLocaleString()}</td>
                            <td className="p-4 text-muted-foreground">
                              {format(new Date(scholarship.deadline), 'MMM d, yyyy')}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => {
                                  if (confirm("Delete this scholarship?")) {
                                    deleteScholarship.mutate(scholarship.id);
                                  }
                                }}
                                disabled={deleteScholarship.isPending}
                                data-testid={`button-delete-scholarship-${scholarship.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CREATE SCHOLARSHIP DIALOG */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">New Scholarship</DialogTitle>
              <DialogDescription>Create a new academic offering for students.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateScholarship} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required data-testid="input-scholarship-title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input id="amount" type="number" min="0" value={newAmount} onChange={e => setNewAmount(e.target.value)} required data-testid="input-scholarship-amount" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} required data-testid="input-scholarship-deadline" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={newDesc} onChange={e => setNewDesc(e.target.value)} required className="resize-none" data-testid="input-scholarship-description" />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createScholarship.isPending} data-testid="button-submit-scholarship">
                  {createScholarship.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* REVIEW APPLICATION DIALOG */}
        <Dialog open={!!reviewApp} onOpenChange={(open) => !open && setReviewApp(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Review Application</DialogTitle>
              <DialogDescription>Process application for {reviewApp?.student?.username}</DialogDescription>
            </DialogHeader>

            {reviewApp && (
              <form onSubmit={handleReviewApplication} className="space-y-6 pt-4">
                <div className="bg-muted/30 p-4 rounded-xl space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scholarship</span>
                    <span className="font-medium text-foreground">{reviewApp.scholarship?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applied On</span>
                    <span className="font-medium">{format(new Date(reviewApp.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">Document</span>
                    <a
                      href={reviewApp.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" /> View Submitted File
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <Select value={reviewStatus} onValueChange={(v: any) => setReviewStatus(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outcome" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Keep Pending</SelectItem>
                        <SelectItem value="Approved">Approve</SelectItem>
                        <SelectItem value="Rejected">Reject</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Remarks (Optional)</Label>
                    <Textarea
                      placeholder="Add feedback for the student..."
                      value={reviewRemarks}
                      onChange={e => setReviewRemarks(e.target.value)}
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setReviewApp(null)}>Cancel</Button>
                  <Button type="submit" disabled={updateStatus.isPending} data-testid="button-save-decision">
                    {updateStatus.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Save Decision
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
