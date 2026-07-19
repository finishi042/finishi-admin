import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Send, Loader2, CheckCircle2, Users, Clock, Megaphone } from "lucide-react";
import { adminNotificationsApi } from "../../api";
import ErrorDialog from "./ErrorDialog";

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onSent?: () => void;
}

const AUDIENCES = [
  { value: "all_users", label: "All Users", description: "All onboarded platform users", icon: Users },
  { value: "active_users", label: "Active Users", description: "Users with active status only", icon: Users },
  { value: "waitlist", label: "Waitlist", description: "All waitlist entries", icon: Clock },
  { value: "waitlist_pending", label: "Waitlist (Pending)", description: "Only pending waitlist entries", icon: Clock },
  { value: "everyone", label: "Everyone", description: "All users + all waitlist entries", icon: Megaphone },
];

const NOTIFICATION_TYPES = [
  { value: "system", label: "System" },
  { value: "event", label: "Event" },
  { value: "lesson", label: "Lesson" },
  { value: "plan", label: "Plan" },
  { value: "warning", label: "Warning" },
];

export default function BroadcastModal({ open, onClose, onSent }: BroadcastModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all_users");
  const [type, setType] = useState("system");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ total: number; user_count: number; waitlist_count: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      const res = await adminNotificationsApi.broadcast({ title, body, type, audience });
      setResult(res);
      onSent?.();
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setTitle(""); setBody(""); setAudience("all_users"); setType("system");
    setResult(null); setErrorMsg(null);
    onClose();
  };

  return (
    <>
    <ErrorDialog open={!!errorMsg} onClose={() => setErrorMsg(null)} message={errorMsg ?? ""} />
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB] flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#7B2CBF]" />
            Send Notification
          </DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Broadcast a notification to users or waitlist entries
          </p>
        </DialogHeader>

        {result ? (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-[#22C55E]" />
            </div>
            <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Notification Sent</h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Delivered to {result.total} recipient{result.total !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-4 text-xs text-[#6B7280] mt-2">
              {result.user_count > 0 && <span>{result.user_count} user{result.user_count !== 1 ? "s" : ""}</span>}
              {result.waitlist_count > 0 && <span>{result.waitlist_count} waitlist</span>}
            </div>
            <Button onClick={handleClose} className="mt-4 bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              {/* Title */}
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Title <span className="text-[#EF4444]">*</span></Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. New feature available!"
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Message <span className="text-[#EF4444]">*</span></Label>
                <Textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Write your notification message..."
                  rows={3}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none"
                />
              </div>

              {/* Audience */}
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Audience <span className="text-[#EF4444]">*</span></Label>
                <div className="space-y-2">
                  {AUDIENCES.map(a => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => setAudience(a.value)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                          audience === a.value
                            ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030]"
                            : "border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          audience === a.value ? "bg-[#7B2CBF] text-white" : "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF]"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${audience === a.value ? "text-[#7B2CBF]" : "text-[#111827] dark:text-[#F9FAFB]"}`}>
                            {a.label}
                          </p>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{a.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          audience === a.value ? "border-[#7B2CBF] bg-[#7B2CBF]" : "border-[#D1D5DB] dark:border-[#4B5563]"
                        }`}>
                          {audience === a.value && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Notification Type</Label>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setType(t.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        type === t.value
                          ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                          : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]">
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!title.trim() || !body.trim() || sending}
                className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
