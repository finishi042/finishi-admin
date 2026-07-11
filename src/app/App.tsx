import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import AdminSidebar from "./components/AdminSidebar";
import TopHeader from "./components/TopHeader";
import DashboardView from "./components/DashboardView";
import UsersView from "./components/UsersView";
import SkillsView from "./components/SkillsView";
import WaitlistView from "./components/WaitlistView";
import LearningPathsView from "./components/LearningPathsView";
import LessonsView from "./components/LessonsView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";
import EventsView from "./components/EventsView";
import TechEventsView from "./components/TechEventsView";
import LogoutScreen from "./components/LogoutScreen";
import NotificationsView from "./components/NotificationsView";

function AppInner() {
  const { isDark } = useTheme();
  const { logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active tab from URL path
  const pathSegment = location.pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
  const activeTab = pathSegment;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingModal, setPendingModal] = useState<string | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const handleQuickAction = (tab: string, modal: string) => {
    navigate(`/${tab}`);
    setPendingModal(modal);
    setSidebarOpen(false);
  };

  const clearPendingModal = () => setPendingModal(null);

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
    setSidebarOpen(false);
    setPendingModal(null);
  };

  const handleViewAllNotifications = () => handleTabChange("notifications");
  const handleLogout = () => setShowLogout(true);
  const handleCancelLogout = () => setShowLogout(false);
  const handleConfirmLogout = () => { setShowLogout(false); logout(); setIsLoggedOut(true); };

  const getHeaderContent = () => {
    switch (activeTab) {
      case "dashboard":   return { title: "Admin Dashboard", subtitle: "Monitor learners, content, and platform growth." };
      case "users":       return { title: "Users", subtitle: "Manage learner accounts and activity." };
      case "skills":      return { title: "Skills", subtitle: "Organize learning categories and topics." };
      case "paths":       return { title: "Learning Paths", subtitle: "Create and manage structured learning journeys." };
      case "lessons":     return { title: "Lessons", subtitle: "Manage your lesson library and content." };
      case "analytics":   return { title: "Analytics", subtitle: "Track platform performance and user engagement." };
      case "waitlist":    return { title: "Waitlist", subtitle: "Manage user waitlist and invitations." };
      case "settings":    return { title: "Settings", subtitle: "Configure platform settings and preferences." };
      case "events":      return { title: "Events", subtitle: "Manage webinars, workshops, and live sessions." };
      case "techEvents":     return { title: "Tech Events", subtitle: "Conferences, hackathons, meetups, and tech talks." };
      case "notifications":  return { title: "Notifications", subtitle: "All your alerts, updates, and activity in one place." };
      default:               return { title: "Admin Dashboard", subtitle: "Monitor learners, content, and platform growth." };
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView onQuickAction={handleQuickAction} />;
      case "users":
        return <UsersView autoOpenModal={pendingModal === "addUser"} onModalOpened={clearPendingModal} />;
      case "skills":
        return <SkillsView autoOpenModal={pendingModal === "addSkill"} onModalOpened={clearPendingModal} />;
      case "waitlist":
        return <WaitlistView />;
      case "paths":
        return <LearningPathsView autoOpenModal={pendingModal === "createPath"} onModalOpened={clearPendingModal} />;
      case "lessons":
        return <LessonsView autoOpenModal={pendingModal === "createLesson"} aiMode={pendingModal === "aiLesson"} onModalOpened={clearPendingModal} />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SettingsView />;
      case "events":
        return <EventsView />;
      case "techEvents":
        return <TechEventsView />;
      case "notifications":
        return <NotificationsView onNavigate={handleTabChange} />;
      default:
        return <DashboardView onQuickAction={handleQuickAction} />;
    }
  };

  const headerContent = getHeaderContent();

  // Logged-out state: show a minimal login-prompt screen
  if (isLoggedOut) {
    return (
      <div className="fixed inset-0 bg-[#0D0914] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#7B2CBF]/20 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C77DFF]/15 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7B2CBF] to-[#C77DFF] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#7B2CBF]/40">
            <span className="text-white font-black text-xl">F</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Finishi Admin</h2>
          <p className="text-[#9CA3AF] text-sm mb-8">You have been logged out. Sign back in to continue.</p>
          <button
            onClick={() => { setIsLoggedOut(false); setActiveTab("dashboard"); }}
            className="w-full bg-[#7B2CBF] hover:bg-[#6A24A8] text-white rounded-xl py-3 font-semibold transition-colors"
          >
            Sign Back In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? "dark" : ""}>
      {/* Logout overlay */}
      {showLogout && (
        <LogoutScreen onCancel={handleCancelLogout} onConfirmLogout={handleConfirmLogout} />
      )}

      <div className="flex h-screen bg-[#FAFAFC] dark:bg-[#0D0914] transition-colors duration-200">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopHeader
            title={headerContent.title}
            subtitle={headerContent.subtitle}
            onMenuClick={() => setSidebarOpen(true)}
            onNavigate={handleTabChange}
            onLogout={handleLogout}
            onViewAllNotifications={handleViewAllNotifications}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AuthGate />
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

function AuthGate() {
  const { admin, loading, login, error } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0D0914] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-[#7B2CBF]/30 border-t-[#9D4EDD] animate-spin" />
      </div>
    );
  }

  if (!admin) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError(null);
      setSubmitting(true);
      try {
        await login(email, password);
      } catch (err: any) {
        setLoginError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-[#0D0914] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#7B2CBF]/20 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C77DFF]/15 blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-sm px-6">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7B2CBF] to-[#C77DFF] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#7B2CBF]/40">
              <span className="text-white font-black text-lg">F</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Finishi Admin</h1>
            <p className="text-[#9CA3AF] text-sm mt-1">Sign in to manage the platform</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@finishi.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.06] text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7B2CBF]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.06] text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7B2CBF]"
              />
            </div>

            {(loginError || error) && (
              <p className="text-[#EF4444] text-xs text-center">{loginError || error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-[#7B2CBF] hover:bg-[#6A24A8] text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AppInner />;
}
