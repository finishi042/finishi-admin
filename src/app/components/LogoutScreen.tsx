import { useState, useEffect } from "react";
import { LogOut, CheckCircle2, ArrowRight, Shield, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface LogoutScreenProps {
  onCancel: () => void;
  onConfirmLogout: () => void;
}

type Stage = "confirm" | "loggingOut" | "done";

export default function LogoutScreen({ onCancel, onConfirmLogout }: LogoutScreenProps) {
  const [stage, setStage] = useState<Stage>("confirm");
  const [progress, setProgress] = useState(0);

  const handleLogout = () => {
    setStage("loggingOut");
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 18 + 8;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStage("done"), 400);
      }
      setProgress(Math.min(p, 100));
    }, 120);
  };

  useEffect(() => {
    if (stage === "done") {
      const timer = setTimeout(onConfirmLogout, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0914]">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#7B2CBF]/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#C77DFF]/15 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#7B2CBF]/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">

        {/* ── CONFIRM STAGE ── */}
        {stage === "confirm" && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            {/* Logo mark */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7B2CBF] to-[#C77DFF] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#7B2CBF]/40">
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Leaving so soon?</h1>
            <p className="text-[#9CA3AF] text-sm leading-relaxed mb-8">
              You're about to log out of your Finishi admin session. Any unsaved changes will be lost.
            </p>

            {/* Session info card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7B2CBF]/40 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">AD</span>
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">Admin</p>
                  <p className="text-[#9CA3AF] text-xs"></p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 bg-[#7B2CBF]/30 rounded-full px-2.5 py-1">
                  <Shield className="w-3 h-3 text-[#C77DFF]" />
                  <span className="text-xs text-[#C77DFF] font-medium">Super Admin</span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-3 grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "Session", value: "4h 22m" },
                  { label: "Actions", value: "47" },
                  { label: "Last page", value: "Users" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-white font-semibold text-sm">{value}</p>
                    <p className="text-[#6B7280] text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={handleLogout}
                className="bg-[#EF4444] hover:bg-red-600 text-white h-11 gap-2 w-full"
              >
                <LogOut className="w-4 h-4" />
                Yes, Log Me Out
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-white/20 text-white hover:bg-white/10 h-11 w-full"
              >
                Stay in Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* ── LOGGING OUT STAGE ── */}
        {stage === "loggingOut" && (
          <div className="animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7B2CBF] to-[#C77DFF] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#7B2CBF]/40">
              <LogOut className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Logging out…</h2>
            <p className="text-[#9CA3AF] text-sm mb-8">Clearing your session securely</p>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-[#7B2CBF] to-[#C77DFF] rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[#6B7280] text-xs">{Math.round(progress)}%</p>

            <div className="mt-8 space-y-2">
              {[
                { label: "Saving session data", done: progress > 25 },
                { label: "Clearing local cache", done: progress > 55 },
                { label: "Revoking access token", done: progress > 80 },
                { label: "Finalizing logout", done: progress >= 100 },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done ? "bg-[#22C55E]" : "bg-white/10"}`}>
                    {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`transition-colors duration-300 ${done ? "text-[#D1D5DB]" : "text-[#6B7280]"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DONE STAGE ── */}
        {stage === "done" && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-[#22C55E] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#22C55E]/40">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">See you later!</h2>
            <p className="text-[#9CA3AF] text-sm mb-6 leading-relaxed">
              You've been logged out successfully. Your session has been cleared and your account is secure.
            </p>

            {/* Tip card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left">
              <p className="text-xs text-[#C77DFF] font-medium uppercase tracking-wide mb-1">Did you know?</p>
              <p className="text-sm text-[#D1D5DB]">
                Finishi protects your admin session with end-to-end encryption and automatic session expiry.
              </p>
            </div>

            <Button
              onClick={onConfirmLogout}
              className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white h-11 gap-2 w-full"
            >
              Back to Login
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-[#6B7280] text-xs mt-4">Redirecting automatically in 3s…</p>
          </div>
        )}
      </div>
    </div>
  );
}
