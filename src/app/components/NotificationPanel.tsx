import { useState } from "react";
import {
  X, Bell, UserPlus, BookOpen, AlertTriangle, Zap,
  CreditCard, CheckCircle2, Settings, Clock, Trash2,
} from "lucide-react";
import { Button } from "./ui/button";

interface Notification {
  id: number;
  type: "user" | "lesson" | "warning" | "system" | "plan" | "event";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL: Notification[] = [];

const TYPE_META = {
  user:    { icon: UserPlus,     bg: "bg-[#F6EEFF] dark:bg-[#1E1030]",                  color: "text-[#7B2CBF]" },
  lesson:  { icon: BookOpen,     bg: "bg-blue-50 dark:bg-blue-950/30",                  color: "text-blue-600 dark:text-blue-400" },
  warning: { icon: AlertTriangle,bg: "bg-orange-50 dark:bg-orange-950/30",              color: "text-[#F97316]" },
  system:  { icon: Settings,     bg: "bg-[#F3F4F6] dark:bg-[#1F2937]",                 color: "text-[#6B7280]" },
  plan:    { icon: CreditCard,   bg: "bg-amber-50 dark:bg-amber-950/30",               color: "text-amber-600 dark:text-amber-400" },
  event:   { icon: Zap,          bg: "bg-green-50 dark:bg-green-950/30",               color: "text-[#22C55E]" },
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onViewAll?: () => void;
}

export default function NotificationPanel({ open, onClose, onViewAll }: NotificationPanelProps) {
  const [items, setItems] = useState<Notification[]>(INITIAL);
  const [tab, setTab] = useState<"all" | "unread">("all");

  if (!open) return null;

  const unreadCount = items.filter(n => !n.read).length;
  const visible = tab === "unread" ? items.filter(n => !n.read) : items;

  const markRead = (id: number) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: number) => setItems(prev => prev.filter(n => n.id !== id));

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 top-full mt-2 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col max-h-[calc(100vh-120px)]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-5 h-5 text-[#7B2CBF]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#EF4444] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#7B2CBF] hover:underline flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors">
              <X className="w-4 h-4 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-3 gap-1 shrink-0">
          {(["all", "unread"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                  : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
              }`}
            >
              {t}
              {t === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-[#EF4444] text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-3 py-3 space-y-1">
          {visible.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#22C55E] mx-auto mb-3" />
              <p className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">All caught up!</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">No unread notifications.</p>
            </div>
          ) : (
            visible.map(n => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                    n.read
                      ? "hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228]"
                      : "bg-[#F6EEFF]/50 dark:bg-[#1E1030]/60 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030]"
                  }`}
                >
                  <div className={`${meta.bg} p-2 rounded-lg shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium leading-snug ${n.read ? "text-[#374151] dark:text-[#D1D5DB]" : "text-[#111827] dark:text-[#F9FAFB]"}`}>
                        {n.title}
                        {!n.read && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-[#7B2CBF] align-middle" />}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-[#EF4444] text-[#9CA3AF] shrink-0 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 leading-snug">{n.body}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="w-3 h-3 text-[#9CA3AF]" />
                      <span className="text-xs text-[#9CA3AF]">{n.time}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF] hover:text-[#7B2CBF]"
            onClick={() => { onClose(); onViewAll?.(); }}
          >
            View all notifications
          </Button>
        </div>
      </div>
    </>
  );
}
