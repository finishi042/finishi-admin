import { useState, useEffect } from "react";
import {
  Globe, Database, CreditCard, ChevronRight, Check, Save,
  Eye, EyeOff, Mail, Sparkles, Zap, Bot, Brain, Shield,
  ExternalLink, RefreshCw, AlertCircle, UserCog, UserPlus,
  Trash2, X, Loader2
} from "lucide-react";
import { adminApi, adminAuthApi, AdminUser } from "../api";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import PaymentSettingsView from "./PaymentSettingsView";

type AppSettingsSection = "platform" | "admins" | "payments" | "integrations";

const NAV_ITEMS: { id: AppSettingsSection; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "platform", label: "Platform", icon: Globe, desc: "General platform configuration" },
  { id: "admins", label: "Admins", icon: UserCog, desc: "Manage admin accounts" },
  { id: "payments", label: "Payments", icon: CreditCard, desc: "Payment gateways & routing" },
  { id: "integrations", label: "Integrations", icon: Database, desc: "API keys and connections" },
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

/* ─── Section: Admins ─── */
function AdminsSection() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", full_name: "", role: "admin" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await adminApi.getAdmins();
        setAdmins(data);
      } catch {
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.full_name) {
      setError("All fields are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await adminAuthApi.register(newAdmin);
      setAdmins(prev => [...prev, created]);
      setShowAddModal(false);
      setNewAdmin({ email: "", password: "", full_name: "", role: "admin" });
    } catch (err: any) {
      setError(err.message || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    try {
      await adminApi.deleteAdmin(adminId);
      setAdmins(prev => prev.filter(a => a.admin_id !== adminId));
    } catch {
      // Ignore
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "super_admin") {
      return (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
          Super Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]">
        Admin
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Admin Management" subtitle="Create and manage admin accounts for your platform." />

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB]">Admin Accounts</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Users with access to this admin dashboard.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Admin
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#7B2CBF] animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-8 text-[#6B7280] dark:text-[#9CA3AF]">
            <UserCog className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No admins found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map(admin => (
              <div
                key={admin.admin_id}
                className="flex items-center justify-between p-4 rounded-xl border border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {admin.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB]">{admin.full_name}</p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(admin.role)}
                  {admin.role !== "super_admin" && (
                    <button
                      onClick={() => handleDeleteAdmin(admin.admin_id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                      title="Delete admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Admin Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl border border-[#ECECEC] dark:border-[#2D2040] w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-[#ECECEC] dark:border-[#2D2040]">
                <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB]">Add New Admin</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors">
                  <X className="w-5 h-5 text-[#6B7280]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Full Name</Label>
                  <Input
                    value={newAdmin.full_name}
                    onChange={e => setNewAdmin(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="John Doe"
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Email</Label>
                  <Input
                    type="email"
                    value={newAdmin.email}
                    onChange={e => setNewAdmin(p => ({ ...p, email: e.target.value }))}
                    placeholder="admin@finishi.com"
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Password</Label>
                  <Input
                    type="password"
                    value={newAdmin.password}
                    onChange={e => setNewAdmin(p => ({ ...p, password: e.target.value }))}
                    placeholder="Minimum 8 characters"
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Role</Label>
                  <div className="relative">
                    <select
                      value={newAdmin.role}
                      onChange={e => setNewAdmin(p => ({ ...p, role: e.target.value }))}
                      className="w-full appearance-none pl-3 pr-10 py-2.5 border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                    >
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none rotate-90" />
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Super admins can manage other admins and access all settings.</p>
                </div>

                {error && (
                  <p className="text-sm text-[#EF4444] bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-[#ECECEC] dark:border-[#2D2040]">
                <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-[#ECECEC] dark:border-[#2D2040]">
                  Cancel
                </Button>
                <Button onClick={handleCreateAdmin} disabled={saving} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : <><UserPlus className="w-4 h-4 mr-2" /> Create Admin</>}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Section: Integrations ─── */
function IntegrationsSection() {
  const [showKey, setShowKey] = useState(false);
  const [apiKey] = useState("fns_live_sk_••••••••••••••••••••••••••••••••");
  const [revealedKey] = useState("fns_live_sk_7B2CBF2026finishi_xK9mP3qRvT8nL1w");
  const [copied, setCopied] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState<Record<string, boolean | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check integration status from API
    const checkStatus = async () => {
      try {
        const status = await adminApi.getIntegrationStatus();
        setIntegrationStatus(status);
      } catch {
        // Default to unknown status
        setIntegrationStatus({});
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const copyKey = () => {
    navigator.clipboard.writeText(revealedKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // AI Providers
  const aiProviders = [
    { name: "OpenAI", desc: "GPT models for lesson generation and chat", color: "#10A37F", icon: Bot, key: "openai", docsUrl: "https://platform.openai.com/docs" },
    { name: "Google Gemini", desc: "Gemini models for AI features", color: "#4285F4", icon: Sparkles, key: "gemini", docsUrl: "https://ai.google.dev/docs" },
    { name: "Groq", desc: "Fast inference for real-time AI responses", color: "#F55036", icon: Zap, key: "groq", docsUrl: "https://console.groq.com/docs" },
    { name: "OpenRouter", desc: "Multi-model routing and fallback", color: "#6366F1", icon: Brain, key: "openrouter", docsUrl: "https://openrouter.ai/docs" },
  ];

  // Core Services
  const coreServices = [
    { name: "Supabase", desc: "Database, auth, and real-time features", color: "#3ECF8E", icon: Database, key: "supabase", docsUrl: "https://supabase.com/docs" },
    { name: "Resend", desc: "Transactional emails and notifications", color: "#000000", icon: Mail, key: "resend", docsUrl: "https://resend.com/docs" },
    { name: "Google OAuth", desc: "Social login via Supabase Auth", color: "#EA4335", icon: Shield, key: "google_oauth", docsUrl: "https://supabase.com/docs/guides/auth/social-login/auth-google" },
  ];

  const getStatusBadge = (key: string) => {
    if (loading) {
      return <RefreshCw className="w-4 h-4 text-[#6B7280] animate-spin" />;
    }
    const status = integrationStatus[key];
    if (status === true) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#DCFCE7] dark:bg-green-950/40 text-[#16A34A]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
          Connected
        </span>
      );
    }
    if (status === false) {
      return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FEF2F2] dark:bg-red-950/40 text-[#DC2626]">
          <AlertCircle className="w-3 h-3" />
          Not configured
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3F4F6] dark:bg-[#1E1030] text-[#6B7280]">
        Unknown
      </span>
    );
  };

  const IntegrationCard = ({ item }: { item: { name: string; desc: string; color: string; icon: React.ElementType; key: string; docsUrl: string } }) => {
    const Icon = item.icon;
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/30 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm text-[#111827] dark:text-[#F9FAFB]">{item.name}</p>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{item.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(item.key)}
          <a
            href={item.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-colors"
            title="View docs"
          >
            <ExternalLink className="w-4 h-4 text-[#6B7280]" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Integrations & API" subtitle="Manage API access and third-party service connections." />

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
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-1">AI Providers</h3>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">AI services powering lesson generation, personalization, and chat features.</p>
        <div className="space-y-3">
          {aiProviders.map(item => (
            <IntegrationCard key={item.key} item={item} />
          ))}
        </div>
      </Card>

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-1">Core Services</h3>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-4">Essential infrastructure for database, authentication, and email.</p>
        <div className="space-y-3">
          {coreServices.map(item => (
            <IntegrationCard key={item.key} item={item} />
          ))}
        </div>
      </Card>

      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#1E1030] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-[#7B2CBF]" />
          </div>
          <div>
            <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB]">Payment Providers</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Paddle, Paystack, Flutterwave, and Stripe are configured in the Payments tab with full provider management, transaction history, and subscription plans.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AppSettingsView() {
  const [active, setActive] = useState<AppSettingsSection>("platform");

  const renderSection = () => {
    switch (active) {
      case "platform": return <PlatformSection />;
      case "admins": return <AdminsSection />;
      case "payments": return <PaymentSettingsView />;
      case "integrations": return <IntegrationsSection />;
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
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all whitespace-nowrap lg:whitespace-normal text-left w-full min-w-fit lg:min-w-0 ${
                    isActive
                      ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
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
