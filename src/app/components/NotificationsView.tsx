import { useState, useEffect, useMemo } from "react";
import {
  Bell, UserPlus, BookOpen, AlertTriangle, Zap, CreditCard, Settings,
  CheckCircle2, Trash2, Clock, Search, SlidersHorizontal, X,
  ChevronRight, ArrowLeft, Users, MailCheck, RefreshCw, Send,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { NotificationsSkeleton } from "./LoadingSkeleton";
import BroadcastModal from "./modals/BroadcastModal";
import { useApi } from "../hooks/useApi";
import { adminNotificationsApi, type AdminNotification as ApiNotif } from "../api";

export type NotifType = "user" | "lesson" | "warning" | "system" | "plan" | "event";

export interface Notification {
  id: number;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  date: string; // for grouping: "Today" | "Yesterday" | "This Week" | "Earlier"
  read: boolean;
  action?: { label: string; tab?: string };
}

const ALL_NOTIFICATIONS: Notification[] = [];

const TYPE_META: Record<NotifType, { icon: React.ElementType; bg: string; color: string; label: string }> = {
  user:    { icon: UserPlus,      bg: "bg-[#F6EEFF] dark:bg-[#1E1030]",           color: "text-[#7B2CBF]",                      label: "Users"   },
  lesson:  { icon: BookOpen,      bg: "bg-blue-50 dark:bg-blue-950/30",            color: "text-blue-600 dark:text-blue-400",    label: "Lessons" },
  warning: { icon: AlertTriangle, bg: "bg-orange-50 dark:bg-orange-950/30",        color: "text-[#F97316]",                      label: "Warnings" },
  system:  { icon: Settings,      bg: "bg-[#F3F4F6] dark:bg-[#1F2937]",           color: "text-[#6B7280]",                      label: "System"  },
  plan:    { icon: CreditCard,    bg: "bg-amber-50 dark:bg-amber-950/30",          color: "text-amber-600 dark:text-amber-400", label: "Plans"   },
  event:   { icon: Zap,           bg: "bg-green-50 dark:bg-green-950/30",          color: "text-[#22C55E]",                      label: "Events"  },
};

const DATE_GROUPS = ["Today", "Yesterday", "This Week", "Earlier"] as const;
type DateGroup = (typeof DATE_GROUPS)[number];

const FILTER_TABS: { key: string; label: string; icon: React.ElementType }[] = [
  { key: "all",     label: "All",      icon: Bell },
  { key: "user",    label: "Users",    icon: Users },
  { key: "lesson",  label: "Lessons",  icon: BookOpen },
  { key: "event",   label: "Events",   icon: Zap },
  { key: "plan",    label: "Plans",    icon: CreditCard },
  { key: "warning", label: "Warnings", icon: AlertTriangle },
  { key: "system",  label: "System",   icon: Settings },
];

interface NotificationsViewProps {
  onNavigate?: (tab: string) => void;
}

export default function NotificationsView({ onNavigate }: NotificationsViewProps) {
  const { data: apiNotifs, loading, refetch } = useApi(() => adminNotificationsApi.list({ limit: 100 }));
  const [items, setItems] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterRead, setFilterRead] = useState<"all" | "read" | "unread">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [detailId, setDetailId] = useState<number | null>(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  // Sync API data to local state
  useEffect(() => {
    if (!apiNotifs || !Array.isArray(apiNotifs)) return;
    const mapped: Notification[] = apiNotifs.map((n: ApiNotif, i: number) => {
      const createdAt = new Date(n.created_at);
      const now = new Date();
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      let time = '';
      let date: string = 'Earlier';
      if (diffMins < 1) { time = 'Just now'; date = 'Today'; }
      else if (diffMins < 60) { time = `${diffMins} min ago`; date = 'Today'; }
      else if (diffHrs < 24) { time = `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`; date = 'Today'; }
      else if (diffDays === 1) { time = 'Yesterday'; date = 'Yesterday'; }
      else if (diffDays < 7) { time = createdAt.toLocaleDateString('en-US', { weekday: 'short' }); date = 'This Week'; }
      else { time = createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); date = 'Earlier'; }

      return {
        id: i + 1,
        type: (n.type ?? 'system') as NotifType,
        title: n.title,
        body: n.body,
        time,
        date,
        read: n.read,
        action: n.ref_type ? { label: `View ${n.ref_type.charAt(0).toUpperCase() + n.ref_type.slice(1)}`, tab: n.ref_type === 'subscription' ? 'users' : n.ref_type === 'waitlist' ? 'waitlist' : `${n.ref_type}s` } : undefined,
        _apiId: n.id,
      } as Notification & { _apiId: string };
    });
    setItems(mapped as any);
  }, [apiNotifs]);

  const unreadCount = items.filter(n => !n.read).length;

  const filtered = useMemo(() => {
    return items.filter(n => {
      if (filterType !== "all" && n.type !== filterType) return false;
      if (filterRead === "read" && !n.read) return false;
      if (filterRead === "unread" && n.read) return false;
      if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.body.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, filterType, filterRead, search]);

  const grouped = useMemo(() => {
    const map = new Map<DateGroup, Notification[]>();
    DATE_GROUPS.forEach(g => map.set(g, []));
    filtered.forEach(n => map.get(n.date as DateGroup)?.push(n));
    return map;
  }, [filtered]);

  const markRead = (id: number) => {
    const item = items[items.findIndex(n => n.id === id)] as any;
    if (item?._apiId) adminNotificationsApi.markRead(item._apiId).catch(() => {});
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };
  const markAllRead = () => {
    adminNotificationsApi.markAllRead().catch(() => {});
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };
  const dismiss = (id: number) => {
    const item = items[items.findIndex(n => n.id === id)] as any;
    if (item?._apiId) adminNotificationsApi.dismiss(item._apiId).catch(() => {});
    setItems(prev => prev.filter(n => n.id !== id));
    setDetailId(v => v === id ? null : v);
  };
  const toggleSelect = (id: number) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const selectAll = () => setSelected(new Set(filtered.map(n => n.id)));
  const clearSelect = () => setSelected(new Set());
  const deleteSelected = () => { setItems(prev => prev.filter(n => !selected.has(n.id))); setSelected(new Set()); };
  const markSelectedRead = () => { setItems(prev => prev.map(n => selected.has(n.id) ? { ...n, read: true } : n)); setSelected(new Set()); };

  const detailNotif = items.find(n => n.id === detailId) ?? null;

  const statsCards = [
    { label: "Total",   value: items.length,       color: "text-[#111827] dark:text-[#F9FAFB]", sub: "All notifications" },
    { label: "Unread",  value: unreadCount,         color: "text-[#EF4444]",                    sub: "Need attention" },
    { label: "Warnings",value: items.filter(n => n.type === "warning").length, color: "text-[#F97316]", sub: "Require action" },
    { label: "Today",   value: items.filter(n => n.date === "Today").length,   color: "text-[#7B2CBF]", sub: "New today" },
  ];

  if (loading) return <NotificationsSkeleton />;

  return (
    <div className="space-y-5 md:space-y-6">
      <BroadcastModal
        open={broadcastOpen}
        onClose={() => setBroadcastOpen(false)}
        onSent={() => refetch()}
      />
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">All Notifications</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllRead}
              className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF] hover:text-[#7B2CBF]"
            >
              <MailCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setBroadcastOpen(true)}
            className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsCards.map((s, i) => (
          <Card key={i} className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{s.label}</p>
            <p className={`text-3xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-6 items-start">
        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Filter bar */}
          <Card className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            {/* Category tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-4 scrollbar-hide">
              {FILTER_TABS.map(tab => {
                const Icon = tab.icon;
                const count = tab.key === "all"
                  ? items.length
                  : items.filter(n => n.type === tab.key).length;
                const unread = tab.key === "all"
                  ? unreadCount
                  : items.filter(n => n.type === tab.key && !n.read).length;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilterType(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                      filterType === tab.key
                        ? "bg-[#7B2CBF] text-white"
                        : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] hover:text-[#7B2CBF]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      filterType === tab.key ? "bg-white/20 text-white" : "bg-[#F3F4F6] dark:bg-[#1F2937] text-[#6B7280] dark:text-[#9CA3AF]"
                    }`}>{count}</span>
                    {unread > 0 && filterType !== tab.key && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search + Read filter row */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search notifications..."
                  className="pl-9 pr-4 py-2 w-full text-sm border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  </button>
                )}
              </div>
              <div className="flex rounded-lg border border-[#ECECEC] dark:border-[#2D2040] overflow-hidden shrink-0">
                {(["all", "unread", "read"] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setFilterRead(v)}
                    className={`px-3 py-2 text-xs font-medium capitalize transition-colors ${
                      filterRead === v
                        ? "bg-[#7B2CBF] text-white"
                        : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030]"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#7B2CBF]/20">
              <span className="text-sm font-medium text-[#7B2CBF]">{selected.size} selected</span>
              <Button size="sm" variant="outline" onClick={markSelectedRead}
                className="border-[#7B2CBF]/30 text-[#7B2CBF] hover:bg-[#7B2CBF] hover:text-white h-7 text-xs">
                <MailCheck className="w-3.5 h-3.5 mr-1" /> Mark read
              </Button>
              <Button size="sm" variant="outline" onClick={deleteSelected}
                className="border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white h-7 text-xs">
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
              <button onClick={clearSelect} className="ml-auto text-xs text-[#6B7280] hover:text-[#7B2CBF]">
                Clear selection
              </button>
            </div>
          )}

          {/* Select all row */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF] cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#7B2CBF]"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={e => e.target.checked ? selectAll() : clearSelect()}
                />
                Select all ({filtered.length})
              </label>
              <span className="text-xs text-[#9CA3AF]">{filtered.length} notification{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          )}

          {/* Grouped notifications */}
          {filtered.length === 0 ? (
            <Card className="p-12 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto mb-4" />
                <p className="font-semibold text-[#111827] dark:text-[#F9FAFB] mb-1">No notifications found</p>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Try adjusting your filters or search query.</p>
                <button onClick={() => { setFilterType("all"); setFilterRead("all"); setSearch(""); }}
                  className="mt-4 text-sm text-[#7B2CBF] hover:underline">Clear filters</button>
              </div>
            </Card>
          ) : (
            DATE_GROUPS.map(group => {
              const groupItems = grouped.get(group) ?? [];
              if (groupItems.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider mb-2 px-1">{group}</p>
                  <Card className="border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] overflow-hidden divide-y divide-[#ECECEC] dark:divide-[#2D2040]">
                    {groupItems.map(n => {
                      const meta = TYPE_META[n.type];
                      const Icon = meta.icon;
                      const isSelected = selected.has(n.id);
                      const isDetail = detailId === n.id;
                      return (
                        <div
                          key={n.id}
                          className={`group flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${
                            isDetail
                              ? "bg-[#F6EEFF]/60 dark:bg-[#1E1030]/60"
                              : n.read
                              ? "hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228]"
                              : "bg-[#F6EEFF]/30 dark:bg-[#1E1030]/30 hover:bg-[#F6EEFF]/60 dark:hover:bg-[#1E1030]/60"
                          }`}
                          onClick={() => { markRead(n.id); setDetailId(isDetail ? null : n.id); }}
                        >
                          {/* Checkbox */}
                          <div className="pt-1 shrink-0" onClick={e => { e.stopPropagation(); toggleSelect(n.id); }}>
                            <input type="checkbox" className="accent-[#7B2CBF] cursor-pointer" checked={isSelected} onChange={() => {}} />
                          </div>

                          {/* Type icon */}
                          <div className={`${meta.bg} p-2.5 rounded-xl shrink-0 mt-0.5`}>
                            <Icon className={`w-4 h-4 ${meta.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className={`text-sm font-semibold leading-snug ${n.read ? "text-[#374151] dark:text-[#D1D5DB]" : "text-[#111827] dark:text-[#F9FAFB]"}`}>
                                    {n.title}
                                  </p>
                                  {!n.read && (
                                    <span className="w-2 h-2 rounded-full bg-[#7B2CBF] shrink-0" />
                                  )}
                                  <Badge className={`text-xs py-0 px-2 ${meta.bg} ${meta.color} border-0`}>
                                    {TYPE_META[n.type].label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1 leading-relaxed">{n.body}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                  <Clock className="w-3 h-3" />
                                  <span className="whitespace-nowrap hidden sm:inline">{n.time}</span>
                                </div>
                                <button
                                  onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-[#9CA3AF] hover:text-[#EF4444] transition-opacity ml-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Expanded detail */}
                            {isDetail && n.action && (
                              <div className="mt-3 pt-3 border-t border-[#ECECEC] dark:border-[#2D2040] flex items-center gap-3">
                                <button
                                  onClick={e => { e.stopPropagation(); if (n.action?.tab) onNavigate?.(n.action.tab); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7B2CBF] text-white text-xs font-medium rounded-lg hover:bg-[#6A24A8] transition-colors"
                                >
                                  {n.action.label}
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); markRead(n.id); setDetailId(null); }}
                                  className="text-xs text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7B2CBF]"
                                >
                                  Dismiss
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              );
            })
          )}
        </div>

        {/* Right sidebar: Notification settings hint */}
        <div className="hidden lg:block w-64 shrink-0 space-y-4">
          <Card className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <div className="flex items-center gap-2 mb-3">
              <SlidersHorizontal className="w-4 h-4 text-[#7B2CBF]" />
              <h4 className="font-semibold text-sm text-[#111827] dark:text-[#F9FAFB]">Notification Settings</h4>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "New user alerts",    on: true },
                { label: "Lesson activity",    on: true },
                { label: "Event updates",      on: true },
                { label: "Plan changes",       on: true },
                { label: "System alerts",      on: false },
                { label: "Weekly digest",      on: true },
              ].map(({ label, on }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-[#374151] dark:text-[#D1D5DB]">{label}</span>
                  <div className={`w-8 h-4.5 rounded-full relative cursor-pointer transition-colors ${on ? "bg-[#7B2CBF]" : "bg-[#E5E7EB] dark:bg-[#374151]"}`}
                    style={{ height: "18px" }}>
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${on ? "left-3.5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate?.("settings")}
              className="mt-4 w-full text-xs text-[#7B2CBF] hover:underline flex items-center justify-center gap-1"
            >
              Manage in Settings <ChevronRight className="w-3 h-3" />
            </button>
          </Card>

          {/* Unread breakdown */}
          <Card className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <h4 className="font-semibold text-sm text-[#111827] dark:text-[#F9FAFB] mb-3">By Category</h4>
            <div className="space-y-2">
              {FILTER_TABS.filter(t => t.key !== "all").map(tab => {
                const Icon = tab.icon;
                const meta = TYPE_META[tab.key as NotifType];
                const total = items.filter(n => n.type === tab.key).length;
                const unread = items.filter(n => n.type === tab.key && !n.read).length;
                if (total === 0) return null;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilterType(tab.key)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] transition-colors"
                  >
                    <div className={`${meta.bg} p-1.5 rounded-lg`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>
                    <span className="text-xs text-[#374151] dark:text-[#D1D5DB] flex-1 text-left">{tab.label}</span>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{total}</span>
                    {unread > 0 && (
                      <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
