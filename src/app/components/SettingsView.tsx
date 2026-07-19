import { useState } from "react";
import {
  User, Bell, Shield, Palette, Globe, Mail, Key, Database, CreditCard,
  ChevronRight, Sun, Moon, Monitor, Check, Save, Eye, EyeOff,
  Smartphone, LogOut, AlertTriangle, Upload, Trash2
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTheme } from "../context/ThemeContext";
import PaymentSettingsView from "./PaymentSettingsView";

type SettingsSection =
  | "profile"
  | "appearance"
  | "notifications"
  | "security"
  | "platform"
  | "payments"
  | "integrations"
  | "danger";

const NAV_ITEMS: { id: SettingsSection; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "profile", label: "Profile", icon: User, desc: "Your admin account details" },
  { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme, colors & display" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Alerts and email settings" },
  { id: "security", label: "Security", icon: Shield, desc: "Password and access control" },
  { id: "platform", label: "Platform", icon: Globe, desc: "General platform configuration" },
  { id: "payments", label: "Payments", icon: CreditCard, desc: "Payment gateways & routing" },
  { id: "integrations", label: "Integrations", icon: Database, desc: "API keys and connections" },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, desc: "Irreversible actions" },
];

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] focus:ring-offset-2 ${
        checked ? "bg-[#7B2CBF]" : "bg-[#D1D5DB] dark:bg-[#374151]"
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">{title}</h2>
      <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">{subtitle}</p>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start sm:items-center justify-between gap-4 py-4 border-b border-[#ECECEC] dark:border-[#2D2040] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{label}</p>
        {description && <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ─── Section: Profile ─── */
function ProfileSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Profile Settings" subtitle="Update your admin account name, email, and avatar." />

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-[#7B2CBF] flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">AD</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-[#2D2040] border border-[#ECECEC] dark:border-[#3D3060] rounded-lg flex items-center justify-center shadow-sm hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-colors">
              <Upload className="w-3.5 h-3.5 text-[#7B2CBF]" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Profile Photo</p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">PNG or JPG, max 2MB</p>
            <button className="text-xs text-[#7B2CBF] mt-1 hover:underline">Remove photo</button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Full Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Email Address</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Role</Label>
            <Input value={role} onChange={e => setRole(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Time Zone</Label>
            <div className="relative">
              <select className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]">
                <option>Africa/Lagos (WAT, UTC+1)</option>
                <option>UTC</option>
                <option>America/New_York</option>
                <option>Europe/London</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#ECECEC] dark:border-[#2D2040] flex justify-end">
          <Button onClick={handleSave} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section: Appearance ─── */
function AppearanceSection() {
  const { isDark, toggleTheme } = useTheme();
  const [accentColor, setAccentColor] = useState("#7B2CBF");
  const [density, setDensity] = useState("comfortable");
  const [fontSize, setFontSize] = useState("medium");

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun, preview: "bg-white border-2" },
    { value: "dark", label: "Dark", icon: Moon, preview: "bg-[#0D0914] border-2" },
    { value: "system", label: "System", icon: Monitor, preview: "bg-gradient-to-br from-white to-[#0D0914] border-2" },
  ];

  const current = isDark ? "dark" : "light";

  const accentColors = [
    { hex: "#7B2CBF", label: "Primary Purple" },
    { hex: "#6366F1", label: "Indigo" },
    { hex: "#3B82F6", label: "Blue" },
    { hex: "#10B981", label: "Emerald" },
    { hex: "#F59E0B", label: "Amber" },
    { hex: "#EF4444", label: "Red" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Appearance" subtitle="Customize how the dashboard looks and feels." />

      {/* Theme */}
      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-4">Color Mode</h3>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(opt => {
            const Icon = opt.icon;
            const selected = current === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  if (opt.value === "light" && isDark) toggleTheme();
                  if (opt.value === "dark" && !isDark) toggleTheme();
                  if (opt.value === "system") {
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    if (prefersDark !== isDark) toggleTheme();
                  }
                }}
                className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all ${
                  selected
                    ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030]"
                    : "border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/40"
                }`}
              >
                <div className={`w-full h-16 rounded-lg ${opt.preview} ${selected ? "border-[#7B2CBF]" : "border-[#ECECEC] dark:border-[#2D2040]"} overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${selected ? "text-[#7B2CBF]" : "text-[#6B7280]"}`} />
                  </div>
                </div>
                <span className={`text-sm font-medium ${selected ? "text-[#7B2CBF]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}>
                  {opt.label}
                </span>
                {selected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#7B2CBF] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Accent Color */}
        <div className="mt-6 pt-6 border-t border-[#ECECEC] dark:border-[#2D2040]">
          <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-1">Accent Color</h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-3">Primary color for buttons, highlights, and active states.</p>
          <div className="flex gap-2.5 flex-wrap">
            {accentColors.map(c => (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => setAccentColor(c.hex)}
                className={`w-9 h-9 rounded-xl transition-all hover:scale-110 ${
                  accentColor === c.hex ? "ring-2 ring-offset-2 ring-[#7B2CBF] scale-110" : ""
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {accentColor === c.hex && <Check className="w-4 h-4 text-white mx-auto" />}
              </button>
            ))}
          </div>
        </div>

        {/* Density */}
        <div className="mt-6 pt-6 border-t border-[#ECECEC] dark:border-[#2D2040]">
          <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-3">Interface Density</h3>
          <div className="flex gap-2">
            {["compact", "comfortable", "spacious"].map(d => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize border transition-all ${
                  density === d
                    ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                    : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section: Notifications ─── */
function NotificationsSection() {
  const [notifs, setNotifs] = useState({
    newUser: true,
    newLesson: true,
    waitlistApproval: true,
    systemAlerts: true,
    weeklyReport: true,
    monthlyDigest: false,
    emailNewUser: false,
    emailWaitlist: true,
    emailReport: true,
    browserPush: true,
    slackWebhook: false,
  });

  const toggle = (key: keyof typeof notifs) => setNotifs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" subtitle="Control which alerts and updates you receive." />

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-2">In-App Alerts</h3>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Notifications shown inside the dashboard.</p>
        <SettingRow label="New user registered" description="Alert when a learner creates an account">
          <Toggle checked={notifs.newUser} onChange={() => toggle("newUser")} />
        </SettingRow>
        <SettingRow label="New lesson published" description="Alert when a lesson goes live">
          <Toggle checked={notifs.newLesson} onChange={() => toggle("newLesson")} />
        </SettingRow>
        <SettingRow label="Waitlist approvals needed" description="Alert when users are waiting for approval">
          <Toggle checked={notifs.waitlistApproval} onChange={() => toggle("waitlistApproval")} />
        </SettingRow>
        <SettingRow label="System alerts" description="Critical platform warnings and errors">
          <Toggle checked={notifs.systemAlerts} onChange={() => toggle("systemAlerts")} />
        </SettingRow>
      </Card>

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-2">Email Reports</h3>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-1">Scheduled digests sent to your admin email.</p>
        <SettingRow label="New user notification emails" description="Email for each new user signup">
          <Toggle checked={notifs.emailNewUser} onChange={() => toggle("emailNewUser")} />
        </SettingRow>
        <SettingRow label="Waitlist emails" description="Email when waitlist submissions arrive">
          <Toggle checked={notifs.emailWaitlist} onChange={() => toggle("emailWaitlist")} />
        </SettingRow>
        <SettingRow label="Weekly analytics report" description="Every Monday at 09:00 AM">
          <Toggle checked={notifs.weeklyReport} onChange={() => toggle("weeklyReport")} />
        </SettingRow>
        <SettingRow label="Monthly digest" description="First Monday of each month">
          <Toggle checked={notifs.monthlyDigest} onChange={() => toggle("monthlyDigest")} />
        </SettingRow>
      </Card>

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-2">Push & Integrations</h3>
        <SettingRow label="Browser push notifications" description="Requires browser permission">
          <Toggle checked={notifs.browserPush} onChange={() => toggle("browserPush")} />
        </SettingRow>
        <SettingRow label="Slack webhook alerts" description="Post critical alerts to Slack channel">
          <Toggle checked={notifs.slackWebhook} onChange={() => toggle("slackWebhook")} />
        </SettingRow>
      </Card>
    </div>
  );
}

/* ─── Section: Security ─── */
function SecuritySection() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [twofa, setTwofa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("8");
  const [saved, setSaved] = useState(false);

  const isValid = current && newPass.length >= 8 && newPass === confirm;

  const handleSave = () => {
    if (!isValid) return;
    setSaved(true);
    setCurrent(""); setNewPass(""); setConfirm("");
    setTimeout(() => setSaved(false), 2500);
  };

  const strength = newPass.length === 0 ? 0 : newPass.length < 6 ? 1 : newPass.length < 10 ? 2 : 3;
  const strengthColors = ["", "bg-[#EF4444]", "bg-[#F97316]", "bg-[#22C55E]"];
  const strengthLabels = ["", "Weak", "Fair", "Strong"];

  return (
    <div className="space-y-6">
      <SectionHeader title="Security" subtitle="Manage password, 2FA, and session settings." />

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-5">Change Password</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Current Password</Label>
            <div className="relative">
              <Input
                type={showCurrent ? "text" : "password"}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="Enter current password"
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] pr-10"
              />
              <button onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">New Password</Label>
            <div className="relative">
              <Input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Minimum 8 characters"
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] pr-10"
              />
              <button onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPass && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : "bg-[#E5E7EB] dark:bg-[#374151]"}`} />
                  ))}
                </div>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] pr-10"
              />
              <button onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm && newPass !== confirm && (
              <p className="text-xs text-[#EF4444]">Passwords do not match</p>
            )}
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={handleSave} disabled={!isValid} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            {saved ? <><Check className="w-4 h-4 mr-2" /> Updated!</> : <><Key className="w-4 h-4 mr-2" /> Update Password</>}
          </Button>
        </div>
      </Card>

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-2">Access Control</h3>
        <SettingRow label="Two-Factor Authentication" description="Require a code when logging in from new devices">
          <Toggle checked={twofa} onChange={setTwofa} />
        </SettingRow>
        <SettingRow label="Session Timeout" description="Auto-logout after period of inactivity">
          <div className="relative">
            <select
              value={sessionTimeout}
              onChange={e => setSessionTimeout(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
            >
              {["1", "2", "4", "8", "24"].map(h => <option key={h} value={h}>{h} hour{parseInt(h) > 1 ? "s" : ""}</option>)}
            </select>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none rotate-90" />
          </div>
        </SettingRow>
        <div className="pt-4">
          <button className="flex items-center gap-2 text-sm text-[#EF4444] hover:underline">
            <LogOut className="w-4 h-4" />
            Sign out of all sessions
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section: Platform ─── */
function PlatformSection() {
  const [platformName, setPlatformName] = useState("Finishi");
  const [tagline, setTagline] = useState("AI-powered micro-learning for Africa");
  const [supportEmail, setSupportEmail] = useState("support@finishi.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [waitlistMode, setWaitlistMode] = useState(true);
  const [language, setLanguage] = useState("en");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Platform Settings" subtitle="Configure your platform's identity and accessibility." />

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-5">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Platform Name</Label>
            <Input value={platformName} onChange={e => setPlatformName(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Support Email</Label>
            <Input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Tagline</Label>
            <Input value={tagline} onChange={e => setTagline(e.target.value)} className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]" />
          </div>
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Default Language</Label>
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
                <option value="ha">Hausa</option>
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#ECECEC] dark:border-[#2D2040] space-y-1">
          <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-1">Access & Registration</h3>
          <SettingRow label="User Registration Open" description="Allow new users to register directly">
            <Toggle checked={registrationOpen} onChange={setRegistrationOpen} />
          </SettingRow>
          <SettingRow label="Waitlist Mode" description="Collect emails and approve users manually">
            <Toggle checked={waitlistMode} onChange={setWaitlistMode} />
          </SettingRow>
          <SettingRow label="Maintenance Mode" description="Show a maintenance page to all non-admin visitors">
            <Toggle checked={maintenanceMode} onChange={setMaintenanceMode} />
          </SettingRow>
        </div>

        <div className="mt-6 pt-6 border-t border-[#ECECEC] dark:border-[#2D2040] flex justify-end">
          <Button onClick={handleSave} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            {saved ? <><Check className="w-4 h-4 mr-2" /> Saved!</> : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section: Integrations ─── */
function IntegrationsSection() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey] = useState("fns_live_sk_••••••••••••••••••••••••••••••••");
  const [revealedKey] = useState("fns_live_sk_7B2CBF2026finishi_xK9mP3qRvT8nL1w");
  const [copied, setCopied] = useState(false);

  const copyKey = () => {
    navigator.clipboard.writeText(revealedKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const integrations = [
    { name: "Mailchimp", desc: "Email marketing and automation", connected: true, color: "#FFE01B", icon: Mail },
    { name: "Slack", desc: "Team notifications and alerts", connected: false, color: "#4A154B", icon: Bell },
    { name: "Stripe", desc: "Payment processing", connected: true, color: "#635BFF", icon: Database },
    { name: "Google Analytics", desc: "Web traffic and conversion tracking", connected: false, color: "#E37400", icon: Globe },
    { name: "Twilio", desc: "SMS notifications to learners", connected: false, color: "#F22F46", icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Integrations & API" subtitle="Manage API access and third-party connections." />

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-1">API Key</h3>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">Use this key to authenticate requests to the Finishi API.</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 font-mono text-sm bg-[#F6EEFF] dark:bg-[#1E1030] px-4 py-3 rounded-lg border border-[#ECECEC] dark:border-[#2D2040] text-[#111827] dark:text-[#F9FAFB] overflow-hidden truncate">
            {showKey ? revealedKey : apiKey}
          </div>
          <button onClick={() => setShowKey(v => !v)} className="p-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-colors">
            {showKey ? <EyeOff className="w-4 h-4 text-[#6B7280]" /> : <Eye className="w-4 h-4 text-[#6B7280]" />}
          </button>
          <button onClick={copyKey} className="p-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-colors">
            {copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Database className="w-4 h-4 text-[#6B7280]" />}
          </button>
        </div>
        <p className="text-xs text-[#EF4444] mt-2">Keep this key secret. Regenerating it will invalidate the previous one.</p>
        <button className="mt-3 text-sm text-[#7B2CBF] hover:underline font-medium">Regenerate API Key</button>
      </Card>

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-4">Connected Apps</h3>
        <div className="space-y-3">
          {integrations.map(int => {
            const Icon = int.icon;
            return (
              <div key={int.name} className="flex items-center justify-between p-4 rounded-xl border border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: int.color }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB]">{int.name}</p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{int.desc}</p>
                  </div>
                </div>
                <button
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    int.connected
                      ? "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#EF4444] hover:text-[#EF4444]"
                      : "bg-[#7B2CBF] text-white border-[#7B2CBF] hover:bg-[#6A24A8]"
                  }`}
                >
                  {int.connected ? "Disconnect" : "Connect"}
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ─── Section: Danger Zone ─── */
function DangerSection() {
  const [confirmText, setConfirmText] = useState("");
  const [purgeConfirm, setPurgeConfirm] = useState("");

  return (
    <div className="space-y-6">
      <SectionHeader title="Danger Zone" subtitle="These actions are permanent and cannot be undone." />

      <Card className="p-6 border-2 border-[#FCA5A5] dark:border-[#7f1d1d] bg-[#FFF5F5] dark:bg-[#1a0505]">
        <div className="space-y-6">
          {/* Clear analytics */}
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">Clear Analytics Data</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Remove all tracked events and engagement data. User accounts are not affected.</p>
            </div>
            <Button variant="outline" className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 shrink-0">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="border-t border-[#FECACA] dark:border-[#450a0a]" />

          {/* Export all data */}
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">Export All Platform Data</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Download a full JSON export of all users, skills, paths, and lessons.</p>
            </div>
            <Button variant="outline" className="border-[#EF4444] text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 shrink-0">
              <Upload className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="border-t border-[#FECACA] dark:border-[#450a0a]" />

          {/* Delete account */}
          <div>
            <p className="font-medium text-[#DC2626] dark:text-[#f87171]">Delete Admin Account</p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 mb-4">
              Permanently delete this admin account. Type <span className="font-mono font-semibold">DELETE</span> to confirm.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder='Type "DELETE" to confirm'
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                className="border-[#FECACA] dark:border-[#7f1d1d] dark:bg-[#1a0505] dark:text-[#F9FAFB]"
              />
              <Button
                disabled={confirmText !== "DELETE"}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white disabled:opacity-40 shrink-0"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Main Component ─── */
export default function SettingsView() {
  const [active, setActive] = useState<SettingsSection>("profile");

  const renderSection = () => {
    switch (active) {
      case "profile": return <ProfileSection />;
      case "appearance": return <AppearanceSection />;
      case "notifications": return <NotificationsSection />;
      case "security": return <SecuritySection />;
      case "platform": return <PlatformSection />;
      case "payments": return <PaymentSettingsView />;
      case "integrations": return <IntegrationsSection />;
      case "danger": return <DangerSection />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 min-h-0">
      {/* Sidebar Nav */}
      <div className="lg:w-64 shrink-0">
        <Card className="p-2 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          {/* Mobile: horizontal scroll tabs */}
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const isDanger = item.id === "danger";
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all whitespace-nowrap lg:whitespace-normal text-left w-full min-w-fit lg:min-w-0 ${
                    isActive
                      ? isDanger
                        ? "bg-[#FEE2E2] dark:bg-red-950/30 text-[#DC2626]"
                        : "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                      : isDanger
                        ? "text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-red-950/20"
                        : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-[#FAFAFC] dark:hover:bg-[#160D20]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div className="flex-1 min-w-0 hidden lg:block">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-[#9CA3AF] truncate">{item.desc}</p>
                  </div>
                  <span className="lg:hidden text-sm font-medium">{item.label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current shrink-0 hidden lg:block" />}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {renderSection()}
      </div>
    </div>
  );
}
