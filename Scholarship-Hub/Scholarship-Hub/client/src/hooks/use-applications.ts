import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useApplications() {
  return useQuery({
    queryKey: [api.applications.list.path],
    queryFn: async () => {
      const res = await fetch(api.applications.list.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized");
        throw new Error("Failed to fetch applications");
      }
      return res.json();
    },
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.applications.create.path, {
        method: "POST",
        body: formData,
        credentials: "include",
        // Do NOT set Content-Type header; browser sets it with boundary for FormData
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit application");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({
        title: "Application Submitted",
        description: "Your scholarship application is now pending review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, remarks }: { id: number; status: 'Pending' | 'Approved' | 'Rejected'; remarks?: string }) => {
      const url = buildUrl(api.applications.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks }),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.applications.list.path] });
      toast({
        title: "Status Updated",
        description: "The application status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
