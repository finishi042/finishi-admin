import { useState, useEffect } from "react";
import { Users, Mail, Download, CheckCircle, XCircle, Clock, Search, Eye, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import SendInviteModal from "./modals/SendInviteModal";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

/* ─── Avatar pool ─── */
const AVATAR_POOL: string[] = [];

function WaitlistAvatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (failed) {
    return (
      <div className="w-9 h-9 rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-semibold">{initials}</span>
      </div>
    );
  }
  return (
    <img src={src} alt={name} onError={() => setFailed(true)}
      className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-[#160D20] shrink-0" />
  );
}

const STATUS_CONFIG = {
  pending:  { label: "Pending",  badge: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400",  dot: "bg-amber-500"  },
  approved: { label: "Approved", badge: "bg-[#DCFCE7] dark:bg-[#052e16] text-[#16A34A] dark:text-[#4ade80]",    dot: "bg-[#22C55E]"  },
  rejected: { label: "Rejected", badge: "bg-[#FEE2E2] dark:bg-[#450a0a] text-[#DC2626] dark:text-[#f87171]",    dot: "bg-[#EF4444]"  },
};

export default function WaitlistView() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const { data: apiData, refetch } = useApi(() => adminApi.getWaitlist());
  const { data: impressionsData } = useApi(() => adminApi.getImpressionsStats());

  const fallback: any[] = [];

  const apiUsers = (apiData as any[] | null)?.map((u: any, i: number) => ({
    name: u.full_name ?? u.name ?? "Unknown",
    email: u.email,
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    interest: u.learning_goal ?? u.interest ?? "—",
    status: u.status ?? "pending",
    avatar: AVATAR_POOL[i % AVATAR_POOL.length],
    id: u.id,
  }));

  const [waitlistUsers, setWaitlistUsers] = useState(fallback);

  // Sync API data
  useEffect(() => { if (apiUsers) setWaitlistUsers(apiUsers as any); }, [apiData]);

  const stats = [
    { label: "Total Signups", value: waitlistUsers.length,                                    icon: Users,       bg: "bg-[#F6EEFF] dark:bg-[#1E1030]", color: "text-[#7B2CBF] dark:text-[#C77DFF]" },
    { label: "Page Views",    value: impressionsData?.impressions?.total ?? 0,                 icon: Eye,         bg: "bg-blue-50 dark:bg-blue-950/30",  color: "text-blue-600 dark:text-blue-400" },
    { label: "Conversion",    value: `${impressionsData?.conversion_rate ?? 0}%`,             icon: TrendingUp,  bg: "bg-[#DCFCE7] dark:bg-[#052e16]",  color: "text-[#16A34A] dark:text-[#4ade80]" },
    { label: "Approved",      value: waitlistUsers.filter(u => u.status === "approved").length, icon: CheckCircle, bg: "bg-[#DCFCE7] dark:bg-[#052e16]",  color: "text-[#16A34A] dark:text-[#4ade80]" },
    { label: "Pending",       value: waitlistUsers.filter(u => u.status === "pending").length,  icon: Clock,       bg: "bg-amber-50 dark:bg-amber-950/30", color: "text-amber-600 dark:text-amber-400" },
    { label: "Rejected",      value: waitlistUsers.filter(u => u.status === "rejected").length, icon: XCircle,     bg: "bg-[#FEE2E2] dark:bg-[#450a0a]",  color: "text-[#DC2626] dark:text-[#f87171]" },
  ];

  const handleApprove = async (index: number) => {
    const id = (waitlistUsers[index] as any).id;
    if (id) { try { await adminApi.updateWaitlistStatus(id, "approved"); refetch(); return; } catch {} }
    setWaitlistUsers(prev => prev.map((u, i) => i === index ? { ...u, status: "approved" } : u));
  };

  const handleReject = async (index: number) => {
    const id = (waitlistUsers[index] as any).id;
    if (id) { try { await adminApi.updateWaitlistStatus(id, "rejected"); refetch(); return; } catch {} }
    setWaitlistUsers(prev => prev.map((u, i) => i === index ? { ...u, status: "rejected" } : u));
  };

  const handleOpenInvite = (emails?: string[]) => { setInviteEmails(emails || []); setInviteOpen(true); };

  const handleBulkInvite = async () => {
    const emails = waitlistUsers.filter(u => u.status === "pending").map(u => u.email);
    try { await adminApi.sendInvites(emails); refetch(); } catch {}
    handleOpenInvite(emails);
  };

  const filtered = waitlistUsers.filter(u => {
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5 md:space-y-6">
      <SendInviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} prefilledEmails={inviteEmails} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-4 md:p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{s.label}</p>
                  <p className={`text-2xl md:text-3xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Actions + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={() => handleOpenInvite()} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            <Mail className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Send Invites</span>
            <span className="sm:hidden">Invite</span>
          </Button>
          <Button variant="outline" onClick={handleBulkInvite} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Invite All Pending</span>
            <span className="sm:hidden">Bulk Invite</span>
          </Button>
          <Button variant="outline" className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input type="text" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] placeholder:text-[#6B7280]" />
          </div>
          <div className="flex gap-1 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg p-1 bg-white dark:bg-[#160D20]">
            {(["all","pending","approved","rejected"] as const).map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs capitalize font-medium transition-all ${
                  statusFilter === f ? "bg-[#7B2CBF] text-white" : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030]"
                }`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist Cards (mobile) + Table (desktop) */}

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.map((user, index) => {
          const cfg = STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG];
          return (
            <Card key={index} className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
              <div className="flex items-start gap-3 mb-3">
                <WaitlistAvatar src={user.avatar} name={user.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB]">{user.name}</p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{user.email}</p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 truncate max-w-[180px]" title={user.interest}>{user.interest} · {user.joined}</p>
                </div>
              </div>
              {user.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(index)} className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white">Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(index)} className="flex-1 border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">Reject</Button>
                </div>
              )}
              {user.status === "approved" && (
                <Button size="sm" variant="outline" onClick={() => handleOpenInvite([user.email])} className="w-full border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
                  <Mail className="w-3.5 h-3.5 mr-1.5" /> Send Invite
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Waitlist Users</h3>
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{filtered.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-[#ECECEC] dark:border-[#2D2040] bg-[#FAFAFC] dark:bg-[#110C1A]">
                {["Name", "Email", "Joined", "Learning Goal", "Status", "Actions"].map((h, i) => (
                  <th key={i} className="text-left py-3 px-4 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, index) => {
                const cfg = STATUS_CONFIG[user.status as keyof typeof STATUS_CONFIG];
                return (
                  <tr key={index} className="border-b border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <WaitlistAvatar src={user.avatar} name={user.name} />
                        <span className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{user.email}</td>
                    <td className="py-3.5 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap">{user.joined}</td>
                    <td className="py-3.5 px-4">
                      <Badge className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] border-0 text-xs max-w-[120px] truncate cursor-default" title={user.interest}>{user.interest}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {user.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(index)} className="bg-[#22C55E] hover:bg-[#16A34A] text-white h-7 text-xs px-3">Approve</Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(index)} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] h-7 text-xs px-3">Reject</Button>
                          </>
                        )}
                        {user.status === "approved" && (
                          <Button size="sm" variant="outline" onClick={() => handleOpenInvite([user.email])} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] h-7 text-xs px-3">
                            <Mail className="w-3 h-3 mr-1.5" /> Send Invite
                          </Button>
                        )}
                        {user.status === "rejected" && (
                          <span className="text-xs text-[#9CA3AF]">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-[#C77DFF] mx-auto mb-3" />
            <p className="text-[#111827] dark:text-[#F9FAFB] font-medium">No waitlist entries found</p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Adjust your filters.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
