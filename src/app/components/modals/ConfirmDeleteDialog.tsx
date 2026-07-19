import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
}

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
  error = null,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="bg-white dark:bg-[#160D20] border-[#ECECEC] dark:border-[#2D2040]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEE2E2] dark:bg-red-950/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <AlertDialogTitle className="text-[#111827] dark:text-[#F9FAFB]">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-[#6B7280] dark:text-[#9CA3AF] ml-[52px]">
            {description ?? "This action cannot be undone. This will permanently delete this item and all associated data."}
          </AlertDialogDescription>
          {error && (
            <div className="ml-[52px] mt-2 p-3 rounded-lg bg-[#FEF2F2] dark:bg-red-950/20 border border-[#FECACA] dark:border-red-800">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={loading}
            className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F9FAFB] dark:hover:bg-[#1A1228]"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={loading}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white border-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
