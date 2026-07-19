import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Mail, X, Plus, Send } from "lucide-react";
import { adminApi } from "../../api";

interface SendInviteModalProps {
  open: boolean;
  onClose: () => void;
  prefilledEmails?: string[];
  onSend?: (emails: string[], message: string, skill: string) => void;
}

const messageTemplates = [
  {
    label: "Standard Invite",
    text: "You've been invited to join Finishi — an AI-powered micro-learning platform. Start your learning journey today!",
  },
  {
    label: "Early Access",
    text: "Congratulations! You've been selected for early access to Finishi. We're thrilled to have you as one of our first learners.",
  },
  {
    label: "Special Welcome",
    text: "Welcome to Finishi! We've reserved a spot just for you. Explore personalized learning paths designed for your skill goals.",
  },
];

export default function SendInviteModal({ open, onClose, prefilledEmails = [], onSend }: SendInviteModalProps) {
  const [emails, setEmails] = useState<string[]>(prefilledEmails);
  const [emailInput, setEmailInput] = useState("");
  const [skill, setSkill] = useState("");
  const [message, setMessage] = useState(messageTemplates[0].text);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Sync prefilledEmails when modal opens with new values
  useEffect(() => {
    if (open && prefilledEmails.length > 0) {
      setEmails(prefilledEmails);
    }
  }, [open, prefilledEmails]);

  // Fetch skills dynamically
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (open) {
      adminApi.getSkills()
        .then((data: any) => {
          const mapped = (Array.isArray(data) ? data : []).map((s: any) => ({ id: s.id, name: s.name }));
          setSkills(mapped);
        })
        .catch(() => setSkills([]));
    }
  }, [open]);

  const addEmail = () => {
    const e = emailInput.trim();
    if (e && e.includes("@") && !emails.includes(e)) {
      setEmails(prev => [...prev, e]);
      setEmailInput("");
    }
  };

  const removeEmail = (email: string) => setEmails(prev => prev.filter(e => e !== email));

  const handleSend = async () => {
    if (emails.length === 0) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    onSend?.(emails, message, skill);
    setSent(true);
    setSending(false);
    await new Promise(r => setTimeout(r, 1500));
    setSent(false);
    setEmails([]); setEmailInput(""); setSkill(""); setMessage(messageTemplates[0].text);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">Send Invites</DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Invite users from the waitlist to join the platform</p>
        </DialogHeader>

        {sent ? (
          <div className="py-8 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
              <Send className="w-7 h-7 text-[#22C55E]" />
            </div>
            <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Invites Sent!</h3>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{emails.length} invitation{emails.length !== 1 ? "s" : ""} sent successfully.</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Email Addresses <span className="text-[#EF4444]">*</span></Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="user@email.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addEmail()}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
                <Button onClick={addEmail} size="sm" className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {emails.map(email => (
                    <Badge key={email} className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] border border-[#7B2CBF]/20 flex items-center gap-1 pr-1">
                      <Mail className="w-3 h-3" />
                      {email}
                      <button onClick={() => removeEmail(email)} className="ml-1 hover:text-[#EF4444] transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{emails.length} recipient{emails.length !== 1 ? "s" : ""} added</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Skill Focus (optional)</Label>
              <select
                value={skill}
                onChange={e => setSkill(e.target.value)}
                className="w-full border border-[#ECECEC] dark:border-[#2D2040] rounded-md px-3 py-2 text-sm bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              >
                <option value="">No specific skill</option>
                {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Message Template</Label>
              <div className="flex gap-2 flex-wrap">
                {messageTemplates.map(t => (
                  <button
                    key={t.label}
                    onClick={() => setMessage(t.text)}
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      message === t.text
                        ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                        : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Invite Message</Label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none"
              />
            </div>
          </div>
        )}

        {!sent && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={emails.length === 0 || sending}
              className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
            >
              {sending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send {emails.length > 0 ? `${emails.length} Invite${emails.length !== 1 ? "s" : ""}` : "Invite"}
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
