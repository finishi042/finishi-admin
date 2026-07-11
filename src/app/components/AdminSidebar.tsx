import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Map,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
  Calendar,
  X,
  Clock,
  ChevronDown,
  Cpu,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose?: () => void;
}

export default function AdminSidebar({ activeTab, onTabChange, onClose }: AdminSidebarProps) {
  const { admin } = useAdminAuth();
  const adminName = admin?.full_name ?? 'Admin';
  const adminRole = admin?.role === 'super_admin' ? 'Super Admin' : 'Admin';
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isEventsActive = activeTab === "events" || activeTab === "techEvents";
  const [eventsOpen, setEventsOpen] = useState(isEventsActive);

  const mainItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "skills", label: "Skills", icon: Lightbulb },
    { id: "paths", label: "Learning Paths", icon: Map },
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const managementItems = [
    { id: "waitlist", label: "Waitlist", icon: Clock },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const eventsSubItems = [
    { id: "events", label: "All Events", icon: Calendar },
    { id: "techEvents", label: "Tech Events", icon: Cpu },
  ];

  const handleEventsToggle = () => {
    const willOpen = !eventsOpen;
    setEventsOpen(willOpen);
    if (willOpen && !isEventsActive) {
      onTabChange("events");
    }
  };

  const handleSubItemClick = (id: string) => {
    onTabChange(id);
    setEventsOpen(true);
    onClose?.();
  };

  const NavButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: React.ElementType }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => { onTabChange(id); onClose?.(); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          active
            ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
            : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span className="font-medium text-sm">{label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7B2CBF] dark:bg-[#C77DFF]" />}
      </button>
    );
  };

  return (
    <div className="w-64 h-screen bg-white dark:bg-[#110C1A] border-r border-[#ECECEC] dark:border-[#2D2040] flex flex-col transition-colors duration-200">
      {/* Logo */}
      <div className="p-6 border-b border-[#ECECEC] dark:border-[#2D2040] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#7B2CBF] rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB]">Finishi</span>
          <span className="text-xs px-1.5 py-0.5 bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] rounded-md">Admin</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] text-[#6B7280] dark:text-[#9CA3AF] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] px-3 py-2 uppercase tracking-wider">
          Main Menu
        </p>

        {mainItems.map(item => (
          <NavButton key={item.id} {...item} />
        ))}

        {/* Events with sub-items */}
        <div>
          <button
            onClick={handleEventsToggle}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isEventsActive
                ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm flex-1 text-left">Events</span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${eventsOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Sub-items */}
          <div
            className={`overflow-hidden transition-all duration-200 ${
              eventsOpen ? "max-h-24 opacity-100 mt-0.5" : "max-h-0 opacity-0"
            }`}
          >
            <div className="ml-4 pl-3 border-l-2 border-[#F6EEFF] dark:border-[#2D2040] space-y-0.5 py-0.5">
              {eventsSubItems.map(sub => {
                const SubIcon = sub.icon;
                const active = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubItemClick(sub.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all ${
                      active
                        ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                        : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
                    }`}
                  >
                    <SubIcon className="w-4 h-4 shrink-0" />
                    <span className="font-medium text-sm">{sub.label}</span>
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7B2CBF] dark:bg-[#C77DFF]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] px-3 py-2 uppercase tracking-wider mt-3">
          Management
        </p>
        {managementItems.map(item => (
          <NavButton key={item.id} {...item} />
        ))}
      </nav>

      {/* Admin Profile */}
      <div className="p-4 border-t border-[#ECECEC] dark:border-[#2D2040]">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] cursor-pointer transition-colors">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-[#7B2CBF] text-white text-sm">{adminInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB] truncate">{adminName}</div>
            <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">{adminRole}</div>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] hover:text-[#EF4444] dark:hover:text-[#EF4444] mt-1 transition-colors">
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
