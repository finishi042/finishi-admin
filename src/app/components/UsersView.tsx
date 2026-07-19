import { useState, useEffect } from "react";
import { Users, UserPlus, Download, Settings, Search, TrendingUp, BookOpen } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import AddUserModal from "./modals/AddUserModal";
import ManageUserModal from "./modals/ManageUserModal";
import { UsersSkeleton } from "./LoadingSkeleton";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

const AVATAR_POOL: string[] = [];

export type PlanType = "Free" | "Pro" | "Enterprise";

export interface User {
  name: string;
  email: string;
  joined: string;
  skills: string[];
  status: string;
  lessonsCompleted: number;
  avatar: string;
  plan: PlanType;
}

const PLAN_BADGE: Record<PlanType, string> = {
  Free:       "bg-[#F3F4F6] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF]",
  Pro:        "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]",
  Enterprise: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400",
};

interface UsersViewProps {
  autoOpenModal?: boolean;
  onModalOpened?: () => void;
}

function UserAvatar({ src, name, size = "md" }: { src: string; name: string; size?: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : size === "lg" ? "w-12 h-12" : "w-10 h-10 text-sm";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (failed) {
    return (
      <div className={`${sizeClass} rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0`}>
        <span className="text-white font-semibold">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-[#160D20] shrink-0`}
    />
  );
}

export default function UsersView({ autoOpenModal, onModalOpened }: UsersViewProps) {
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [manageUserOpen, setManageUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const { data: apiData, loading, refetch } = useApi(() => adminApi.getUsers({ search: search || undefined }), [search]);

  const apiUsers: User[] = (apiData ?? []).map((u: any, i: number) => ({
    name: u.full_name ?? u.name ?? "Unknown",
    email: u.email,
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    skills: u.skills ?? [],
    status: u.status === "active" || u.status === "Active" ? "Active" : "Inactive",
    lessonsCompleted: u.lessons_completed ?? 0,
    avatar: AVATAR_POOL[i % AVATAR_POOL.length],
    plan: (u.plan as PlanType) ?? "Free",
  }));

  const fallbackUsers: User[] = [];

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (apiUsers.length > 0) setUsers(apiUsers);
  }, [apiData]);

  useEffect(() => {
    if (autoOpenModal) { setAddUserOpen(true); onModalOpened?.(); }
  }, [autoOpenModal]);

  const handleManageUser = (user: User) => { setSelectedUser(user); setManageUserOpen(true); };

  const handleAddUser = async (userData: { name: string; email: string; role: string; skills: string[] }) => {
    try {
      await adminApi.createUser({ full_name: userData.name, email: userData.email, role: userData.role });
      refetch();
    } catch {
      // Optimistic fallback
      const idx = users.length % AVATAR_POOL.length;
      setUsers(prev => [...prev, {
        name: userData.name, email: userData.email,
        joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        skills: userData.skills, status: "Active", lessonsCompleted: 0,
        avatar: AVATAR_POOL[idx], plan: "Free",
      }]);
    }
  };

  const handleUpdateUser = async (updated: User) => {
    setUsers(prev => prev.map(u => u.email === updated.email ? updated : u));
  };

  const filtered = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: "Total Users",  value: users.length,                                           sub: "All accounts",         color: "text-[#7B2CBF]" },
    { label: "Active",       value: users.filter(u => u.status === "Active").length,        sub: "Currently learning",   color: "text-[#22C55E]" },
    { label: "Pro / Ent.",   value: users.filter(u => u.plan !== "Free").length,            sub: "Paid subscribers",     color: "text-amber-500" },
    { label: "Avg. Lessons", value: Math.round(users.reduce((s, u) => s + u.lessonsCompleted, 0) / users.length), sub: "Per user",  color: "text-[#3B82F6]" },
  ];

  const topUser = [...users].sort((a, b) => b.lessonsCompleted - a.lessonsCompleted)[0];

  if (loading) return <UsersSkeleton />;

  return (
    <div className="space-y-5 md:space-y-6">
      <AddUserModal open={addUserOpen} onClose={() => setAddUserOpen(false)} onSave={handleAddUser} />
      <ManageUserModal
        open={manageUserOpen}
        onClose={() => setManageUserOpen(false)}
        user={selectedUser}
        onUpdate={handleUpdateUser}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="p-4 md:p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      {/* Top learner spotlight */}
      {topUser && (
        <Card className="p-4 md:p-5 border border-[#7B2CBF]/30 dark:border-[#7B2CBF]/20 bg-gradient-to-r from-[#F6EEFF] to-white dark:from-[#1E1030] dark:to-[#160D20]">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <UserAvatar src={topUser.avatar} name={topUser.name} size="lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <TrendingUp className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#7B2CBF] font-medium uppercase tracking-wide mb-0.5">Top Learner This Month</p>
              <p className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{topUser.name}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{topUser.email}</p>
            </div>
            <div className="shrink-0 text-right space-y-1">
              <div className="flex items-center gap-1.5 text-[#7B2CBF] justify-end">
                <BookOpen className="w-4 h-4" />
                <span className="text-xl font-bold">{topUser.lessonsCompleted}</span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">lessons done</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_BADGE[topUser.plan]}`}>
                {topUser.plan}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Actions + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={() => setAddUserOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button variant="outline" className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] placeholder:text-[#6B7280]" />
        </div>
      </div>

      {/* Users Table */}
      <Card className="border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">All Users</h3>
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{filtered.length} of {users.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-[#ECECEC] dark:border-[#2D2040] bg-[#FAFAFC] dark:bg-[#110C1A]">
                {["User", "Email", "Joined", "Plan", "Skills", "Lessons", "Status", ""].map((h, i) => (
                  <th key={i} className="text-left py-3 px-4 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, index) => (
                <tr key={index} className="border-b border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={user.avatar} name={user.name} />
                      <div>
                        <p className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{user.name}</p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] sm:hidden">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{user.email}</td>
                  <td className="py-3.5 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF] whitespace-nowrap">{user.joined}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${PLAN_BADGE[user.plan]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                      {user.skills.map((skill, i) => (
                        <Badge key={i} className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] border-0 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#F3F4F6] dark:bg-[#1F2937] rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-[#7B2CBF]"
                          style={{ width: `${Math.min((user.lessonsCompleted / 70) * 100, 100)}%` }} />
                      </div>
                      <span className="text-sm text-[#111827] dark:text-[#F9FAFB] font-medium">{user.lessonsCompleted}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                      user.status === "Active"
                        ? "bg-[#DCFCE7] text-[#16A34A] dark:bg-[#052e16] dark:text-[#4ade80]"
                        : "bg-[#F3F4F6] text-[#6B7280] dark:bg-[#1F2937] dark:text-[#9CA3AF]"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-[#22C55E]" : "bg-[#9CA3AF]"}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button onClick={() => handleManageUser(user)}
                      className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Manage user">
                      <Settings className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-[#C77DFF] mx-auto mb-3" />
            <p className="text-[#111827] dark:text-[#F9FAFB] font-medium">No users found</p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Try adjusting your search.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
