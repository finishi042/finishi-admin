import {
  X, User, Settings, HelpCircle, LogOut, Moon, Sun,
  ChevronRight, Shield, Bell, BookOpen, Star,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAdminAuth } from "../context/AdminAuthContext";

interface AdminProfileDropdownProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export default function AdminProfileDropdown({ open, onClose, onNavigate, onLogout }: AdminProfileDropdownProps) {
  const { isDark, toggleTheme } = useTheme();
  const { admin } = useAdminAuth();
  const adminName = admin?.full_name ?? 'Admin';
  const adminEmail = admin?.email ?? '';
  const adminRole = admin?.role === 'super_admin' ? 'Super Admin' : 'Admin';
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  if (!open) return null;

  const menuItems = [
    { icon: User,     label: "View Profile",    sub: "Manage your account",    action: () => { onNavigate("settings"); onClose(); } },
    { icon: Settings, label: "Platform Settings", sub: "Configure your platform", action: () => { onNavigate("settings"); onClose(); } },
    { icon: Bell,     label: "Notifications",    sub: "Manage alerts",           action: () => onClose() },
    { icon: HelpCircle, label: "Help & Support", sub: "Docs, FAQ, contact",      action: () => onClose() },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 z-50 w-[300px] bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">

        {/* Profile header */}
        <div className="bg-gradient-to-br from-[#7B2CBF] to-[#C77DFF] p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 ring-2 ring-white/40 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-base">{adminInitials}</span>
              </div>
              <div>
                <p className="font-semibold text-white">{adminName}</p>
                <p className="text-white/70 text-xs">{adminEmail}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Shield className="w-3 h-3 text-white/80" />
                  <span className="text-xs text-white/80 font-medium">{adminRole}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: BookOpen, label: "Lessons",  value: "—" },
              { icon: User,     label: "Users",    value: "—" },
              { icon: Star,     label: "Rating",   value: "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl py-2 px-3 text-center">
                <Icon className="w-3.5 h-3.5 text-white/70 mx-auto mb-1" />
                <p className="text-white font-semibold text-sm">{value}</p>
                <p className="text-white/60 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu items */}
        <div className="p-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1228] flex items-center justify-center shrink-0 group-hover:bg-[#EDE5F8] dark:group-hover:bg-[#2D1B4E] transition-colors">
                  <Icon className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#7B2CBF] transition-colors" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{item.label}</p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{item.sub}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB] dark:text-[#4B5563] group-hover:text-[#7B2CBF] transition-colors" />
              </button>
            );
          })}

          {/* Theme toggle */}
          <button
            onClick={() => { toggleTheme(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1228] flex items-center justify-center shrink-0 group-hover:bg-[#EDE5F8] dark:group-hover:bg-[#2D1B4E] transition-colors">
              {isDark
                ? <Sun className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#7B2CBF] transition-colors" />
                : <Moon className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF] group-hover:text-[#7B2CBF] transition-colors" />
              }
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {isDark ? "Currently using dark theme" : "Currently using light theme"}
              </p>
            </div>
            <div className={`w-9 h-5 rounded-full transition-colors relative ${isDark ? "bg-[#7B2CBF]" : "bg-[#E5E7EB] dark:bg-[#374151]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isDark ? "left-4" : "left-0.5"}`} />
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-[#ECECEC] dark:border-[#2D2040]" />

        {/* Logout */}
        <div className="p-2">
          <button
            onClick={() => { onClose(); onLogout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-[#EF4444]">Log Out</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">End your session</p>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
