import { useState, useEffect } from "react";
import {
  Database, CreditCard, Check,
  Eye, EyeOff, Mail, Sparkles, Zap, Bot, Brain, Shield,
  ExternalLink, RefreshCw, AlertCircle
} from "lucide-react";
import { adminApi } from "../api";
import { Card } from "./ui/card";

export default function IntegrationsView() {
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
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">Paddle, Paystack, Flutterwave, and Stripe are configured in the Payments page with full provider management, transaction history, and subscription plans.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
