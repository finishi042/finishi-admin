import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { XCircle } from "lucide-react";

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function ErrorDialog({ open, onClose, title = "Error", message }: ErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="bg-white dark:bg-[#160D20] border-[#ECECEC] dark:border-[#2D2040]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEE2E2] dark:bg-red-950/40 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <AlertDialogTitle className="text-[#111827] dark:text-[#F9FAFB]">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-[#6B7280] dark:text-[#9CA3AF] ml-[52px]">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onClose}
            className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white border-none"
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
