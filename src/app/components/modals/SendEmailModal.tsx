import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Mail, X, Plus, Send, CheckCircle } from "lucide-react";
import { adminApi } from "../../api";

type Template = "general" | "invite" | "welcome";

const TEMPLATES: { value: Template; label: string; description: string }[] = [
  { value: "general",  label: "General",  description: "Plain message with optional CTA button" },
  { value: "welcome",  label: "Welcome",  description: "Onboarding welcome with get-started CTA" },
  { value: "invite",   label: "Invite",   description: "Platform invite with sign-up link" },
];

const SUBJECT_PRESETS: Record<Template, string> = {
  general: "",
  welcome: "Welcome to Finishi! 🚀",
  invite:  "You're invited to Finishi 🎉",
};

const MESSAGE_PRESETS: Record<Template, string> = {
  general: "",
  welcome:
    "Welcome to Finishi! Your account is all set. Dive into personalized micro-lessons built around your goals.",
  invite:
    "You've been invited to join Finishi — an AI-powered micro-learning platform. Start your learning journey today!",
};

export interface SendEmailModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill recipient list (e.g. selected users from the table) */
  prefilledEmails?: string[];
  /** Label shown in the header, e.g. "Send Email to Users" */
  title?: string;
  /** Which API endpoint to call — "users" or "waitlist" */
  audience?: "users" | "waitlist";
}

export default function SendEmailModal({
  open,
  onClose,
  prefilledEmails = [],
  title = "Send Email",
  audience = "users",
}: SendEmailModalProps) {
  const [emails, setEmails] = useState<string[]>(prefilledEmails);
  const [emailInput, setEmailInput] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [template, setTemplate] = useState<Template>("general");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  // Sync prefilled emails when modal reopens
  useEffect(() => {
    if (open) {
      setEmails(prefilledEmails);
      setError(null);
      setSent(false);
      setResult(null);
    }
  }, [open, prefilledEmails.join(",")]);

  // Apply preset when template changes
  useEffect(() => {
    setSubject(SUBJECT_PRESETS[template]);
    setMessage(MESSAGE_PRESETS[template]);
    setCtaLabel("");
    setCtaUrl("");
  }, [template]);

  const addEmail = () => {
    const e = emailInput.trim();
    if (e && e.includes("@") && !emails.includes(e)) {
      setEmails(prev => [...prev, e]);
      setEmailInput("");
    }
  };
  const removeEmail = (email: string) => setEmails(prev => prev.filter(e => e !== email));

  const handleSend = async () => {
    if (emails.length === 0 || !subject.trim() || !message.trim()) return;
    setSending(true);
    setError(null);
    try {
      const payload = {
        emails,
        subject,
        message,
        template,
        cta_label: ctaLabel || undefined,
        cta_url: ctaUrl || undefined,
      };
      const res =
        audience === "waitlist"
          ? await adminApi.sendInvites(emails, { message, subject })
          : await adminApi.sendUsersEmail(payload);
      setResult({ sent: res?.sent ?? emails.length, failed: res?.failed ?? 0 });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setResult(null);
        setEmails([]);
        setEmailInput("");
        setSubject("");
        setMessage("");
        setCtaLabel("");
        setCtaUrl("");
        setTemplate("general");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const isValid = emails.length > 0 && subject.trim().length > 0 && message.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent
        className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">{title}</DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Compose and send an email to {audience === "waitlist" ? "waitlist members" : "platform users"}
          </p>
        </DialogHeader>

        {sent && result ? (
          <div className="py-10 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-[#22C55E]" />
            </div>
            <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Email Sent!</h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              {result.sent} email{result.sent !== 1 ? "s" : ""} delivered successfully
              {result.failed > 0 ? `, ${result.failed} failed` : ""}.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Template selector */}
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Template</Label>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTemplate(t.value)}
                    title={t.description}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      template === t.value
                        ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                        : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">
                Recipients <span className="text-[#EF4444]">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="user@email.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addEmail()}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
                <Button
                  onClick={addEmail}
                  size="sm"
                  className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
                  {emails.map(email => (
                    <Badge
                      key={email}
                      className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] border border-[#7B2CBF]/20 flex items-center gap-1 pr-1"
                    >
                      <Mail className="w-3 h-3" />
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        className="ml-1 hover:text-[#EF4444] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {emails.length} recipient{emails.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">
                Subject <span className="text-[#EF4444]">*</span>
              </Label>
              <Input
                placeholder="Email subject…"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">
                Message <span className="text-[#EF4444]">*</span>
              </Label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="Write your message…"
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none"
              />
            </div>

            {/* Optional CTA (only for general template) */}
            {template === "general" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    CTA Button Label (optional)
                  </Label>
                  <Input
                    placeholder="e.g. View Dashboard"
                    value={ctaLabel}
                    onChange={e => setCtaLabel(e.target.value)}
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                    CTA URL (optional)
                  </Label>
                  <Input
                    placeholder="https://…"
                    value={ctaUrl}
                    onChange={e => setCtaUrl(e.target.value)}
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] text-sm"
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-[#EF4444] bg-[#FEE2E2] dark:bg-[#450a0a] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
          </div>
        )}

        {!sent && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!isValid || sending}
              className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
            >
              {sending ? (
                "Sending…"
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send{emails.length > 0 ? ` to ${emails.length}` : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
