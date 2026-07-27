import { useState, useEffect } from "react";
import {
  Globe, Database, CreditCard, ChevronRight, Check, Save,
  Eye, EyeOff, Mail, Sparkles, Zap, Bot, Brain, Shield,
  ExternalLink, RefreshCw, AlertCircle
} from "lucide-react";
import { adminApi } from "../api";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import PaymentSettingsView from "./PaymentSettingsView";

type AppSettingsSection = "platform" | "payments" | "integrations";

const NAV_ITEMS: { id: AppSettingsSection; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "platform", label: "Platform", icon: Globe, desc: "General platform configuration" },
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
