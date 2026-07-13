import { useState, useRef, useEffect } from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import NotificationPanel from "./NotificationPanel";
import AdminProfileDropdown from "./AdminProfileDropdown";

import { useApi } from "../hooks/useApi";
import { adminNotificationsApi } from "../api";

interface TopHeaderProps {
  title: string;
  subtitle: string;
  onMenuClick?: () => void;
  onNavigate?: (tab: string) => void;
  onLogout?: () => void;
  onViewAllNotifications?: () => void;
}

export default function TopHeader({ title, subtitle, onMenuClick, onNavigate, onLogout, onViewAllNotifications }: TopHeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { admin } = useAdminAuth();
  const { data: unreadData } = useApi(() => adminNotificationsApi.getUnreadCount());
  const unreadCount = (unreadData as any)?.unread ?? 0;
  const adminName = admin?.full_name ?? 'Admin';
  const adminEmail = admin?.email ?? '';
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close panels on outside click — handled by each panel's own backdrop div
  // but we also need to close the other panel when one opens
  const openNotif = () => { setNotifOpen(v => !v); setProfileOpen(false); };
  const openProfile = () => { setProfileOpen(v => !v); setNotifOpen(false); };

  return (
    <div className="bg-white dark:bg-[#110C1A] border-b border-[#ECECEC] dark:border-[#2D2040] px-4 md:px-6 lg:px-8 py-4 transition-colors duration-200 relative z-30">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] text-[#6B7280] dark:text-[#9CA3AF] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-[#111827] dark:text-[#F9FAFB] truncate">{title}</h1>
          <p className="text-xs md:text-sm text-[#6B7280] dark:text-[#9CA3AF] hidden sm:block truncate">{subtitle}</p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search - hidden on small screens */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 w-48 lg:w-64 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] text-[#111827] dark:text-[#F9FAFB] placeholder:text-[#6B7280] dark:placeholder:text-[#9CA3AF] text-sm transition-colors"
            />
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] text-[#6B7280] dark:text-[#9CA3AF] transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={openNotif}
              className={`relative p-2 rounded-lg transition-colors ${
                notifOpen
                  ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF]"
                  : "hover:bg-[#FAFAFC] dark:hover:bg-[#1E1030] text-[#6B7280] dark:text-[#9CA3AF]"
              }`}
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#EF4444] rounded-full text-[9px] text-white font-bold flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} onViewAll={onViewAllNotifications} />
          </div>

          {/* Admin Profile */}
          <div ref={profileRef} className="relative hidden sm:block">
            <button
              onClick={openProfile}
              className={`flex items-center gap-3 pl-3 border-l border-[#ECECEC] dark:border-[#2D2040] rounded-lg transition-colors ${
                profileOpen ? "opacity-80" : "hover:opacity-80"
              }`}
            >
              <div className="text-right hidden lg:block">
                <div className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB]">{adminName}</div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{adminEmail}</div>
              </div>
              <div className={`w-9 h-9 rounded-full bg-[#7B2CBF] flex items-center justify-center ring-2 transition-all ${
                profileOpen ? "ring-[#7B2CBF] ring-offset-2 dark:ring-offset-[#110C1A]" : "ring-transparent"
              }`}>
                <span className="text-white text-sm font-bold">{adminInitials}</span>
              </div>
            </button>

            <AdminProfileDropdown
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
              onNavigate={onNavigate ?? (() => {})}
              onLogout={onLogout ?? (() => {})}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
