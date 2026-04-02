import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: 'Pending' | 'Approved' | 'Rejected' | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'Approved':
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-700 px-2.5 py-1 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="font-medium">Approved</span>
        </Badge>
      );
    case 'Rejected':
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-200 dark:border-red-700 px-2.5 py-1 flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5" />
          <span className="font-medium">Rejected</span>
        </Badge>
      );
    case 'Pending':
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-700 px-2.5 py-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">Pending</span>
        </Badge>
      );
  }
}
