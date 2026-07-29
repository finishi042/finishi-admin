import { useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  LayoutDashboard,
  Users,
  Lightbulb,
  Map,
  BookOpen,
  Layers,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  Calendar,
  X,
  Clock,
  ChevronDown,
  Cpu,
  Activity,
  Globe,
  CreditCard,
  Database,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import finishiLogo from "../../imports/finishi-logo.svg";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({ activeTab, onTabChange, onClose, collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const { admin } = useAdminAuth();
  const adminName = admin?.full_name ?? 'Admin';
  const adminRole = admin?.role === 'super_admin' ? 'Super Admin' : 'Admin';
  const adminInitials = adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isEventsActive = activeTab === "events" || activeTab === "techEvents";
  const isSettingsActive = activeTab === "platformSettings" || activeTab === "adminsSettings" || activeTab === "payments" || activeTab === "integrations";
  const [eventsOpen, setEventsOpen] = useState(isEventsActive);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  const mainItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "skills", label: "Skills", icon: Lightbulb },
    { id: "paths", label: "Learning Paths", icon: Map },
    { id: "courses", label: "Courses", icon: Layers },
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const managementItems = [
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "waitlist", label: "Waitlist", icon: Clock },
    { id: "profileSettings", label: "Profile", icon: UserCog },
  ];

  const eventsSubItems = [
    { id: "events", label: "All Events", icon: Calendar },
    { id: "techEvents", label: "Tech Events", icon: Cpu },
  ];

  const settingsSubItems = [
    { id: "platformSettings", label: "Platform", icon: Globe },
    { id: "adminsSettings", label: "Admins", icon: UserCog },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "integrations", label: "Integrations", icon: Database },
  ];

  const handleEventsToggle = () => {
    if (collapsed) {
      onTabChange("events");
      return;
    }
    const willOpen = !eventsOpen;
    setEventsOpen(willOpen);
    if (willOpen && !isEventsActive) {
      onTabChange("events");
    }
  };

  const handleSettingsToggle = () => {
    if (collapsed) {
      onTabChange("platformSettings");
      return;
    }
    const willOpen = !settingsOpen;
    setSettingsOpen(willOpen);
    if (willOpen && !isSettingsActive) {
      onTabChange("platformSettings");
    }
  };

  const handleSubItemClick = (id: string) => {
    onTabChange(id);
    if (eventsSubItems.some(item => item.id === id)) {
      setEventsOpen(true);
    }
    if (settingsSubItems.some(item => item.id === id)) {
      setSettingsOpen(true);
    }
    onClose?.();
  };

  const NavButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: React.ElementType }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => { onTabChange(id); onClose?.(); }}
        title={collapsed ? label : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
          collapsed ? "justify-center" : ""
        } ${
          active
            ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
            : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="font-medium text-sm">{label}</span>}
        {!collapsed && active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7B2CBF] dark:bg-[#C77DFF]" />}
      </button>
    );
  };

  return (
    <div className={`${collapsed ? "w-[72px]" : "w-64"} h-screen bg-white dark:bg-[#110C1A] border-r border-[#ECECEC] dark:border-[#2D2040] flex flex-col transition-all duration-200`}>
      {/* Logo */}
      <div className={`${collapsed ? "p-3" : "p-6"} border-b border-[#ECECEC] dark:border-[#2D2040] flex items-center justify-between`}>
        <div className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}>
          <img src={finishiLogo} alt="Finishi" className="w-8 h-8" />
          {!collapsed && (
            <>
              <span className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB]">Finishi</span>
              <span className="text-xs px-1.5 py-0.5 bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] rounded-md">Admin</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex p-1 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] text-[#6B7280] dark:text-[#9CA3AF] transition-colors"
            >
              {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] text-[#6B7280] dark:text-[#9CA3AF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? "p-2" : "p-3"} space-y-0.5 overflow-y-auto`}>
        {!collapsed && (
          <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] px-3 py-2 uppercase tracking-wider">
            Main Menu
          </p>
        )}

        {mainItems.map(item => (
          <NavButton key={item.id} {...item} />
        ))}

        {/* Events with sub-items */}
        <div>
          <button
            onClick={handleEventsToggle}
            title={collapsed ? "Events" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              collapsed ? "justify-center" : ""
            } ${
              isEventsActive
                ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="font-medium text-sm flex-1 text-left">Events</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${eventsOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {/* Sub-items */}
          {!collapsed && (
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
          )}
        </div>

        {!collapsed && (
          <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] px-3 py-2 uppercase tracking-wider mt-3">
            Management
          </p>
        )}
        {managementItems.map(item => (
          <NavButton key={item.id} {...item} />
        ))}

        {/* Settings with sub-items */}
        <div>
          <button
            onClick={handleSettingsToggle}
            title={collapsed ? "Settings" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              collapsed ? "justify-center" : ""
            } ${
              isSettingsActive
                ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="font-medium text-sm flex-1 text-left">Settings</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${settingsOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {/* Sub-items */}
          {!collapsed && (
            <div
              className={`overflow-hidden transition-all duration-200 ${
                settingsOpen ? "max-h-48 opacity-100 mt-0.5" : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-4 pl-3 border-l-2 border-[#F6EEFF] dark:border-[#2D2040] space-y-0.5 py-0.5">
                {settingsSubItems.map(sub => {
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
          )}
        </div>
      </nav>

      {/* Admin Profile */}
      <div className={`${collapsed ? "p-2" : "p-4"} border-t border-[#ECECEC] dark:border-[#2D2040]`}>
        <div className={`flex items-center gap-3 ${collapsed ? "p-2 justify-center" : "p-3"} rounded-lg hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] cursor-pointer transition-colors`} title={collapsed ? adminName : undefined}>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-[#7B2CBF] text-white text-sm">{adminInitials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB] truncate">{adminName}</div>
              <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">{adminRole}</div>
            </div>
          )}
        </div>
        <button
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20] hover:text-[#EF4444] dark:hover:text-[#EF4444] mt-1 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}
