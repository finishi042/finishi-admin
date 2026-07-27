import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";
import { Toaster } from "sonner";
import AdminSidebar from "./components/AdminSidebar";
import TopHeader from "./components/TopHeader";
import DashboardView from "./components/DashboardView";
import UsersView from "./components/UsersView";
import SkillsView from "./components/SkillsView";
import WaitlistView from "./components/WaitlistView";
import LearningPathsView from "./components/LearningPathsView";
import LessonsView from "./components/LessonsView";
import CoursesView from "./components/CoursesView";
import AnalyticsView from "./components/AnalyticsView";
import AppSettingsView from "./components/AppSettingsView";
import ProfileSettingsView from "./components/ProfileSettingsView";
import EventsView from "./components/EventsView";
import TechEventsView from "./components/TechEventsView";
import LogoutScreen from "./components/LogoutScreen";
import NotificationsView from "./components/NotificationsView";
import RequestMonitorView from "./components/RequestMonitorView";

function AppInner() {
  const { isDark } = useTheme();
  const { admin, logout } = useAdminAuth();
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
      case "courses":     return { title: "Courses", subtitle: "Manage course modules and their lessons." };
      case "lessons":     return { title: "Lessons", subtitle: "Manage your lesson library and content." };
      case "analytics":   return { title: "Analytics", subtitle: "Track platform performance and user engagement." };
      case "waitlist":    return { title: "Waitlist", subtitle: "Manage user waitlist and invitations." };
      case "appSettings":    return { title: "App Settings", subtitle: "Configure platform, payments, and integrations." };
      case "profileSettings": return { title: "Profile Settings", subtitle: "Manage your account and preferences." };
      case "events":      return { title: "Events", subtitle: "Manage webinars, workshops, and live sessions." };
      case "techEvents":     return { title: "Tech Events", subtitle: "Conferences, hackathons, meetups, and tech talks." };
      case "notifications":  return { title: "Notifications", subtitle: "All your alerts, updates, and activity in one place." };
      case "monitoring":     return { title: "Request Monitor", subtitle: "Track API requests, provider health, and error rates." };
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
      case "courses":
        return <CoursesView />;
      case "lessons":
        return <LessonsView autoOpenModal={pendingModal === "createLesson"} aiMode={pendingModal === "aiLesson"} onModalOpened={clearPendingModal} />;
      case "analytics":
        return <AnalyticsView />;
      case "appSettings":
        return <AppSettingsView />;
      case "profileSettings":
        return <ProfileSettingsView />;
      case "events":
        return <EventsView />;
      case "techEvents":
        return <TechEventsView />;
      case "notifications":
        return <NotificationsView onNavigate={handleTabChange} />;
      case "monitoring":
        return <RequestMonitorView />;
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
        <LogoutScreen onCancel={handleCancelLogout} onConfirmLogout={handleConfirmLogout} adminName={admin?.full_name} adminRole={admin?.role} currentPage={activeTab} />
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
        <Toaster position="top-right" richColors closeButton />
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

function AuthGate() {
  const { admin, loading, login, error } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Forgot password flow
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (!otpExpiresAt) return;
    
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setCountdown(remaining);
      setCanResend(remaining === 0);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt]);

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

    const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setForgotError(null);
      setForgotMessage(null);
      setSubmitting(true);
      try {
        const { adminAuthApi } = await import('./api');
        const result = await adminAuthApi.forgotPassword(email);
        setForgotMessage(result.message);
        setOtpExpiresAt(Date.now() + 10 * 60 * 1000); // 10 minutes
        setCanResend(false);
        setView('reset');
      } catch (err: any) {
        setForgotError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    const handleResendOtp = async () => {
      if (!canResend) return;
      setForgotError(null);
      setSubmitting(true);
      try {
        const { adminAuthApi } = await import('./api');
        await adminAuthApi.forgotPassword(email);
        setOtpExpiresAt(Date.now() + 10 * 60 * 1000); // 10 minutes
        setCanResend(false);
        setOtp("");
        setForgotMessage("A new code has been sent to your email.");
      } catch (err: any) {
        setForgotError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setForgotError(null);
      
      if (newPassword !== confirmPassword) {
        setForgotError("Passwords don't match");
        return;
      }
      
      setSubmitting(true);
      try {
        const { adminAuthApi } = await import('./api');
        const result = await adminAuthApi.resetPassword({ email, otp, password: newPassword });
        setForgotMessage(result.message);
        // Reset form and go back to login
        setView('login');
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setPassword("");
      } catch (err: any) {
        setForgotError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    const passwordRequirements = [
      { test: (p: string) => p.length >= 8, label: "8+ characters" },
      { test: (p: string) => /[A-Z]/.test(p), label: "Uppercase" },
      { test: (p: string) => /[a-z]/.test(p), label: "Lowercase" },
      { test: (p: string) => /[0-9]/.test(p), label: "Number" },
      { test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p), label: "Special char" },
    ];

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
            <p className="text-[#9CA3AF] text-sm mt-1">
              {view === 'login' && "Sign in to manage the platform"}
              {view === 'forgot' && "Enter your email to receive a reset code"}
              {view === 'reset' && "Enter the code and your new password"}
            </p>
          </div>

          {/* Login Form */}
          {view === 'login' && (
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-3.5 py-2.5 pr-11 rounded-lg border border-white/[0.12] bg-white/[0.06] text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7B2CBF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white/80 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {(loginError || error) && (
                <p className="text-[#EF4444] text-xs text-center">{loginError || error}</p>
              )}

              {forgotMessage && (
                <p className="text-[#22C55E] text-xs text-center">{forgotMessage}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-[#7B2CBF] hover:bg-[#6A24A8] text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => { setView('forgot'); setForgotError(null); setForgotMessage(null); }}
                className="w-full text-center text-sm text-[#9D4EDD] hover:text-[#C77DFF] transition-colors"
              >
                Forgot password?
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {view === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 space-y-4">
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

              {forgotError && (
                <p className="text-[#EF4444] text-xs text-center">{forgotError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-[#7B2CBF] hover:bg-[#6A24A8] text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Reset Code"}
              </button>

              <button
                type="button"
                onClick={() => { setView('login'); setForgotError(null); }}
                className="w-full text-center text-sm text-[#9D4EDD] hover:text-[#C77DFF] transition-colors"
              >
                Back to login
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {view === 'reset' && (
            <form onSubmit={handleResetPassword} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="text-center mb-2">
                <p className="text-[#22C55E] text-xs">
                  A 6-digit code was sent to {email}
                </p>
                {countdown > 0 ? (
                  <p className="text-white/50 text-xs mt-1">
                    Code expires in{" "}
                    <span className="text-[#9D4EDD] font-mono">
                      {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </span>
                  </p>
                ) : (
                  <p className="text-[#EF4444] text-xs mt-1">Code expired</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1.5">Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.06] text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7B2CBF] text-center tracking-[0.5em] font-mono text-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full px-3.5 py-2.5 pr-11 rounded-lg border border-white/[0.12] bg-white/[0.06] text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7B2CBF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showNewPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {/* Password requirements indicator */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {passwordRequirements.map((req) => (
                    <span
                      key={req.label}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        req.test(newPassword)
                          ? 'bg-[#22C55E]/20 text-[#22C55E]'
                          : 'bg-white/[0.06] text-white/40'
                      }`}
                    >
                      {req.label}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-white/[0.12] bg-white/[0.06] text-white text-sm placeholder:text-white/30 outline-none focus:border-[#7B2CBF]"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[#EF4444] text-[10px] mt-1">Passwords don't match</p>
                )}
              </div>

              {forgotError && (
                <p className="text-[#EF4444] text-xs text-center">{forgotError}</p>
              )}

              {forgotMessage && view === 'reset' && (
                <p className="text-[#22C55E] text-xs text-center">{forgotMessage}</p>
              )}

              <button
                type="submit"
                disabled={submitting || otp.length !== 6 || !passwordRequirements.every(r => r.test(newPassword)) || newPassword !== confirmPassword || countdown === 0}
                className="w-full py-2.5 rounded-xl bg-[#7B2CBF] hover:bg-[#6A24A8] text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? "Resetting..." : "Reset Password"}
              </button>

              {/* Resend OTP */}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend || submitting}
                className={`w-full text-center text-sm transition-colors ${
                  canResend 
                    ? 'text-[#9D4EDD] hover:text-[#C77DFF] cursor-pointer' 
                    : 'text-white/30 cursor-not-allowed'
                }`}
              >
                {canResend ? "Resend code" : `Resend available in ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`}
              </button>

              <button
                type="button"
                onClick={() => { setView('login'); setForgotError(null); setOtp(""); setNewPassword(""); setConfirmPassword(""); setOtpExpiresAt(null); }}
                className="w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <AppInner />;
}
