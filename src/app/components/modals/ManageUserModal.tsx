import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Mail, BookOpen, Calendar, Shield, Ban, CheckCircle,
  CreditCard, Zap, Star, Building2, ChevronRight, ArrowUpCircle,
  Clock, BarChart2,
} from "lucide-react";
import type { PlanType, User } from "../UsersView";

interface PlanConfig {
  name: PlanType;
  price: string;
  period: string;
  color: string;
  ring: string;
  icon: React.ElementType;
  badge: string;
  features: string[];
  limit: { lessons: number | null; skills: number | null };
}

const PLANS: PlanConfig[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    color: "text-[#6B7280]",
    ring: "ring-[#E5E7EB] dark:ring-[#374151]",
    icon: Zap,
    badge: "bg-[#F3F4F6] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF]",
    features: ["5 lessons / month", "1 skill category", "Community support", "Basic analytics"],
    limit: { lessons: 5, skills: 1 },
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    color: "text-[#7B2CBF]",
    ring: "ring-[#7B2CBF]",
    icon: Star,
    badge: "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]",
    features: ["Unlimited lessons", "All skill categories", "Certificates", "Priority support", "Advanced analytics"],
    limit: { lessons: null, skills: null },
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    color: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-400",
    icon: Building2,
    badge: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
    features: ["Everything in Pro", "Team management", "API access", "Custom branding", "SSO / SAML", "Dedicated CSM"],
    limit: { lessons: null, skills: null },
  },
];

const BILLING_DATES: Record<PlanType, string> = {
  Free: "—",
  Pro: "Jul 3, 2026",
  Enterprise: "Jul 1, 2026",
};

const BILLING_SINCE: Record<PlanType, string> = {
  Free: "—",
  Pro: "Jun 3, 2026",
  Enterprise: "May 1, 2026",
};

interface ManageUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate?: (user: User) => void;
}

export default function ManageUserModal({ open, onClose, user, onUpdate }: ManageUserModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "plan" | "actions">("overview");
  const [currentStatus, setCurrentStatus] = useState(user?.status ?? "Active");
  const [currentPlan, setCurrentPlan] = useState<PlanType>(user?.plan ?? "Free");
  const [loading, setLoading] = useState<string | null>(null);
  const [planChanged, setPlanChanged] = useState(false);

  if (!user) return null;

  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const activePlanConfig = PLANS.find(p => p.name === currentPlan)!;
  const PlanIcon = activePlanConfig.icon;

  const handleAction = async (action: string) => {
    setLoading(action);
    await new Promise(r => setTimeout(r, 700));
    if (action === "activate") setCurrentStatus("Active");
    if (action === "deactivate") setCurrentStatus("Inactive");
    setLoading(null);
    if (action === "delete") onClose();
  };

  const handlePlanChange = (plan: PlanType) => {
    setCurrentPlan(plan);
    setPlanChanged(plan !== user.plan);
  };

  const handleSavePlan = async () => {
    setLoading("plan");
    await new Promise(r => setTimeout(r, 800));
    onUpdate?.({ ...user, plan: currentPlan, status: currentStatus });
    setPlanChanged(false);
    setLoading(null);
  };

  const usagePct = activePlanConfig.limit.lessons
    ? Math.min(Math.round((user.lessonsCompleted / activePlanConfig.limit.lessons) * 100), 100)
    : Math.min(Math.round((user.lessonsCompleted / 100) * 100), 100);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-hidden flex flex-col p-0" aria-describedby={undefined}>

        {/* Purple header */}
        <div className="bg-gradient-to-r from-[#7B2CBF] to-[#C77DFF] p-6 rounded-t-xl shrink-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Manage User</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0 ring-2 ring-white/40">
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-lg leading-tight">{user.name}</p>
              <p className="text-white/70 text-sm">{user.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${activePlanConfig.badge}`}>
                {currentPlan}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                currentStatus === "Active"
                  ? "bg-[#DCFCE7] text-[#166534]"
                  : "bg-white/20 text-white"
              }`}>
                {currentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#ECECEC] dark:border-[#2D2040] shrink-0 px-6 bg-white dark:bg-[#160D20]">
          {(["overview", "plan", "actions"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#7B2CBF] text-[#7B2CBF] dark:text-[#C77DFF]"
                  : "border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
              }`}
            >
              {tab === "plan" ? "Pricing & Plan" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 bg-white dark:bg-[#160D20] space-y-5">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: BookOpen,  label: "Lessons Done",  value: user.lessonsCompleted },
                  { icon: Calendar,  label: "Joined",        value: user.joined.split(",")[0] },
                  { icon: Shield,    label: "Role",          value: "Learner" },
                ].map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="p-3 rounded-xl border border-[#ECECEC] dark:border-[#2D2040] text-center bg-[#FAFAFC] dark:bg-[#1A1228]">
                    <Icon className="w-4 h-4 text-[#7B2CBF] mx-auto mb-1" />
                    <p className="font-semibold text-[#111827] dark:text-[#F9FAFB] text-sm">{value}</p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB] text-sm font-medium">Enrolled Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, i) => (
                    <Badge key={i} className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] border border-[#7B2CBF]/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Current plan summary */}
              <div
                className={`p-4 rounded-xl border-2 ${activePlanConfig.ring} bg-[#FAFAFC] dark:bg-[#1A1228] cursor-pointer`}
                onClick={() => setActiveTab("plan")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentPlan === "Enterprise" ? "bg-amber-100 dark:bg-amber-950/30" : "bg-[#F6EEFF] dark:bg-[#1E1030]"}`}>
                      <PlanIcon className={`w-4 h-4 ${activePlanConfig.color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#111827] dark:text-[#F9FAFB] text-sm">{currentPlan} Plan</p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {activePlanConfig.price}{activePlanConfig.period}
                        {BILLING_SINCE[currentPlan] !== "—" && ` · since ${BILLING_SINCE[currentPlan]}`}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                </div>
              </div>
            </>
          )}

          {/* ── PLAN TAB ── */}
          {activeTab === "plan" && (
            <>
              {/* Current billing info */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: CreditCard, label: "Current Plan", value: `${currentPlan} · ${activePlanConfig.price}${activePlanConfig.period}` },
                  { icon: Clock,      label: "Next Billing",  value: BILLING_DATES[currentPlan] },
                  { icon: Calendar,   label: "Active Since",  value: BILLING_SINCE[currentPlan] },
                  { icon: BarChart2,  label: "Usage",         value: `${user.lessonsCompleted} lessons` },
                ].map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="p-3 rounded-xl border border-[#ECECEC] dark:border-[#2D2040] bg-[#FAFAFC] dark:bg-[#1A1228]">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5 text-[#7B2CBF]" />
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{label}</span>
                    </div>
                    <p className="font-semibold text-[#111827] dark:text-[#F9FAFB] text-sm">{value}</p>
                  </div>
                ))}
              </div>

              {/* Usage bar */}
              <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Lesson Usage</span>
                  <span className="text-sm font-semibold text-[#7B2CBF]">
                    {user.lessonsCompleted} / {activePlanConfig.limit.lessons ?? "∞"}
                  </span>
                </div>
                <div className="h-2.5 bg-[#E5E7EB] dark:bg-[#374151] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${usagePct >= 90 ? "bg-[#EF4444]" : usagePct >= 70 ? "bg-[#F97316]" : "bg-[#7B2CBF]"}`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                {activePlanConfig.limit.lessons && usagePct >= 80 && (
                  <p className="text-xs text-[#F97316] mt-1.5">Approaching plan limit — consider upgrading</p>
                )}
              </div>

              {/* Plan selector */}
              <div>
                <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-3 block">
                  Change Plan
                </Label>
                <div className="space-y-2">
                  {PLANS.map(plan => {
                    const Icon = plan.icon;
                    const isActive = currentPlan === plan.name;
                    return (
                      <button
                        key={plan.name}
                        onClick={() => handlePlanChange(plan.name)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isActive
                            ? `${plan.ring} bg-[#FAFAFC] dark:bg-[#1A1228]`
                            : "border-[#ECECEC] dark:border-[#2D2040] hover:border-[#C77DFF]"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${plan.name === "Enterprise" ? "bg-amber-100 dark:bg-amber-950/30" : "bg-[#F6EEFF] dark:bg-[#1E1030]"}`}>
                              <Icon className={`w-4 h-4 ${plan.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#111827] dark:text-[#F9FAFB] text-sm">{plan.name}</span>
                                {isActive && <span className="text-xs bg-[#7B2CBF] text-white px-1.5 py-0.5 rounded-full">Current</span>}
                              </div>
                              <p className={`font-bold text-base ${plan.color}`}>
                                {plan.price}<span className="text-xs font-normal text-[#6B7280]">{plan.period}</span>
                              </p>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center ${
                            isActive ? "border-[#7B2CBF] bg-[#7B2CBF]" : "border-[#D1D5DB] dark:border-[#4B5563]"
                          }`}>
                            {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                        <ul className="mt-3 space-y-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                              <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${plan.color}`} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>
              </div>

              {planChanged && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#7B2CBF]/20">
                  <ArrowUpCircle className="w-5 h-5 text-[#7B2CBF] shrink-0" />
                  <p className="text-sm text-[#7B2CBF]">
                    Plan will change from <strong>{user.plan}</strong> to <strong>{currentPlan}</strong>
                  </p>
                </div>
              )}
            </>
          )}

          {/* ── ACTIONS TAB ── */}
          {activeTab === "actions" && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Account Actions</Label>

                <button
                  onClick={() => handleAction("email")}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030]">
                      <Mail className="w-4 h-4 text-[#7B2CBF]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Send Email</p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Send a message to this user</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                </button>

                {currentStatus === "Active" ? (
                  <button
                    onClick={() => handleAction("deactivate")}
                    disabled={loading !== null}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-[#F97316]/30 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/30">
                        <Ban className="w-4 h-4 text-[#F97316]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#F97316]">Deactivate Account</p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Suspend this user from the platform</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#F97316]">{loading === "deactivate" ? "..." : ""}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction("activate")}
                    disabled={loading !== null}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-[#22C55E]/30 hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/30">
                        <CheckCircle className="w-4 h-4 text-[#22C55E]" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-[#22C55E]">Activate Account</p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Restore access to this user</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#22C55E]">{loading === "activate" ? "..." : ""}</span>
                  </button>
                )}

                <button
                  onClick={() => handleAction("delete")}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-[#EF4444]/30 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/30">
                      <Ban className="w-4 h-4 text-[#EF4444]" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#EF4444]">Delete User</p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Permanently remove this account</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#EF4444]">{loading === "delete" ? "Deleting..." : ""}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-5 border-t border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] rounded-b-xl shrink-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Close
          </Button>
          {activeTab === "plan" && planChanged && (
            <Button
              onClick={handleSavePlan}
              disabled={loading === "plan"}
              className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
            >
              {loading === "plan" ? "Saving..." : "Save Plan Change"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
