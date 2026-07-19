import { useState, useEffect, useCallback } from "react";
import {
  CreditCard, Shield, Zap, Globe, ToggleLeft, ToggleRight,
  Check, AlertCircle, Loader2, Eye, EyeOff, Save, RefreshCw,
  ArrowRightLeft, ChevronDown, ChevronUp, ExternalLink,
  TrendingUp, TrendingDown, DollarSign, Activity, Users,
  Filter, ChevronLeft, ChevronRight, Download, Search
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { adminApi } from "../api";
import SubscriptionPlansView from "./SubscriptionPlansView";

// ── Types ───────────────────────────────────────────────────────────────────

interface ProviderConfig {
  id: string;
  provider: string;
  display_name: string;
  is_enabled: boolean;
  is_primary_local: boolean;
  is_failover_local: boolean;
  is_international: boolean;
  public_key: string | null;
  secret_key: string | null;
  webhook_secret: string | null;
  extra_config: Record<string, unknown>;
  supported_countries: string[];
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  user_email: string | null;
  idempotency_key: string;
  provider: string;
  provider_reference: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: string | null;
  billing_interval: string | null;
  failure_reason: string | null;
  failover_from: string | null;
  created_at: string;
}

interface PaymentStats {
  period_days: number;
  overview: {
    total_transactions: number;
    successful: number;
    failed: number;
    failover_events: number;
    success_rate: number;
    active_subscriptions: number;
  };
  revenue_by_provider: Record<string, { total: number; count: number; currency: string }>;
  revenue_by_plan: Record<string, { total: number; count: number }>;
  daily_trend: { date: string; success: number; failed: number }[];
}

type ProviderRole = 'international' | 'primary_local' | 'failover_local' | 'none';

// ── Provider metadata ───────────────────────────────────────────────────────

const PROVIDER_META: Record<string, { color: string; icon: React.ElementType; description: string; docsUrl: string }> = {
  paddle: {
    color: "#0052FF",
    icon: Globe,
    description: "International payments (merchant of record). Handles VAT/tax globally.",
    docsUrl: "https://developer.paddle.com/",
  },
  paystack: {
    color: "#00C3F7",
    icon: CreditCard,
    description: "Primary local payments for African markets. Supports cards, bank transfers, mobile money.",
    docsUrl: "https://paystack.com/docs/",
  },
  flutterwave: {
    color: "#F5A623",
    icon: Zap,
    description: "Failover for local payments. Activates automatically when Paystack is unavailable.",
    docsUrl: "https://developer.flutterwave.com/docs/",
  },
};

const ROLE_OPTIONS: { value: ProviderRole; label: string; description: string }[] = [
  { value: "international", label: "International", description: "Non-African countries" },
  { value: "primary_local", label: "Local Primary", description: "African countries (first choice)" },
  { value: "failover_local", label: "Local Failover", description: "Auto-activates on primary failure" },
  { value: "none", label: "No Role", description: "Provider is available but not routed" },
];

// ── Tabs ────────────────────────────────────────────────────────────────────

type TabId = "overview" | "providers" | "transactions" | "plans";

// ── Main Component ──────────────────────────────────────────────────────────

export default function PaymentSettingsView() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<TabId>>(new Set());

  // Lazy-load data only when the relevant tab is first viewed
  useEffect(() => {
    if (loadedTabs.has(activeTab)) return;

    const fetchForTab = async () => {
      setLoading(true);
      try {
        if (activeTab === "overview") {
          const statsData = await adminApi.getPaymentStats(30);
          setStats(statsData);
        } else if (activeTab === "providers") {
          const configData = await adminApi.getPaymentConfig();
          setConfigs(configData);
        }
        // "plans" and "transactions" tabs handle their own loading internally
      } catch (err) {
        console.error(`Failed to load ${activeTab} data:`, err);
      } finally {
        setLoading(false);
        setLoadedTabs(prev => new Set(prev).add(activeTab));
      }
    };

    fetchForTab();
  }, [activeTab]);

  const refreshTab = async () => {
    setLoadedTabs(prev => {
      const next = new Set(prev);
      next.delete(activeTab);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#7B2CBF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">Payment Management</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            Configure providers, monitor transactions, and view payment analytics.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refreshTab}
          className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-[#F3F4F6] dark:bg-[#1A1030] rounded-xl">
        {([
          { id: "overview" as TabId, label: "Overview & Stats" },
          { id: "providers" as TabId, label: "Providers" },
          { id: "plans" as TabId, label: "Plans" },
          { id: "transactions" as TabId, label: "Transactions" },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-[#160D20] text-[#7B2CBF] shadow-sm"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && <OverviewTab stats={stats} configs={configs} />}
      {activeTab === "providers" && <ProvidersTab configs={configs} setConfigs={setConfigs} onRefresh={refreshTab} />}
      {activeTab === "plans" && <SubscriptionPlansView />}
      {activeTab === "transactions" && <TransactionsTab />}
    </div>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ stats, configs }: { stats: PaymentStats | null; configs: ProviderConfig[] }) {
  if (!stats) {
    return <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">No stats available yet.</p>;
  }

  const { overview, revenue_by_provider, revenue_by_plan, daily_trend } = stats;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Transactions"
          value={overview.total_transactions}
          icon={Activity}
          color="text-[#7B2CBF]"
          bgColor="bg-[#F6EEFF] dark:bg-[#1E1030]"
        />
        <StatCard
          label="Success Rate"
          value={`${overview.success_rate}%`}
          icon={overview.success_rate >= 90 ? TrendingUp : TrendingDown}
          color={overview.success_rate >= 90 ? "text-green-600" : "text-amber-600"}
          bgColor={overview.success_rate >= 90 ? "bg-green-50 dark:bg-green-900/20" : "bg-amber-50 dark:bg-amber-900/20"}
        />
        <StatCard
          label="Active Subscriptions"
          value={overview.active_subscriptions}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          label="Failover Events"
          value={overview.failover_events}
          icon={ArrowRightLeft}
          color={overview.failover_events > 0 ? "text-amber-600" : "text-green-600"}
          bgColor={overview.failover_events > 0 ? "bg-amber-50 dark:bg-amber-900/20" : "bg-green-50 dark:bg-green-900/20"}
          subtitle={overview.failover_events > 0 ? "Check primary provider" : "No failovers"}
        />
      </div>

      {/* Daily trend mini chart */}
      {daily_trend.length > 0 && (
        <Card className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-4">Last 7 Days</h3>
          <div className="flex items-end gap-2 h-24">
            {daily_trend.map((day) => {
              const total = day.success + day.failed;
              const maxTotal = Math.max(...daily_trend.map(d => d.success + d.failed), 1);
              const height = total > 0 ? Math.max((total / maxTotal) * 100, 8) : 4;
              const successPct = total > 0 ? (day.success / total) * 100 : 100;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative rounded-t-sm overflow-hidden" style={{ height: `${height}%` }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-green-400 dark:bg-green-500"
                      style={{ height: `${successPct}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 right-0 bg-red-300 dark:bg-red-500/60"
                      style={{ height: `${100 - successPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#9CA3AF]">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-400" /> Successful</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-300" /> Failed</span>
          </div>
        </Card>
      )}

      {/* Revenue breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By provider */}
        <Card className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-3">Revenue by Provider</h3>
          {Object.keys(revenue_by_provider).length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No revenue data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(revenue_by_provider).map(([provider, data]) => (
                <div key={provider} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: PROVIDER_META[provider]?.color ?? "#6B7280" }}
                    />
                    <span className="text-sm capitalize text-[#111827] dark:text-[#F9FAFB]">{provider}</span>
                    <span className="text-xs text-[#9CA3AF]">({data.count} txns)</span>
                  </div>
                  <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                    {formatAmount(data.total, data.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* By plan */}
        <Card className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-3">Revenue by Plan</h3>
          {Object.keys(revenue_by_plan).length === 0 ? (
            <p className="text-sm text-[#9CA3AF]">No revenue data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(revenue_by_plan).map(([plan, data]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-[#7B2CBF]" />
                    <span className="text-sm capitalize text-[#111827] dark:text-[#F9FAFB]">{plan}</span>
                    <span className="text-xs text-[#9CA3AF]">({data.count} txns)</span>
                  </div>
                  <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                    {data.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Routing overview */}
      <Card className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="flex items-center gap-3 mb-3">
          <ArrowRightLeft className="w-5 h-5 text-[#7B2CBF]" />
          <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB]">Active Routing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-[#F0F7FF] dark:bg-[#0D1B30] border border-[#BFDBFE] dark:border-[#1E3A5F]">
            <p className="font-medium text-[#1E40AF] dark:text-[#60A5FA]">International</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
              {configs.find(c => c.is_international && c.is_enabled)?.display_name ?? "Not configured"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#F0FDF4] dark:bg-[#0D2818] border border-[#BBF7D0] dark:border-[#166534]">
            <p className="font-medium text-[#166534] dark:text-[#4ADE80]">Local Primary</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
              {configs.find(c => c.is_primary_local && c.is_enabled)?.display_name ?? "Not configured"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#FFFBEB] dark:bg-[#1C1505] border border-[#FDE68A] dark:border-[#92400E]">
            <p className="font-medium text-[#92400E] dark:text-[#FBBF24]">Local Failover</p>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
              {configs.find(c => c.is_failover_local && c.is_enabled)?.display_name ?? "Not configured"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <Shield className="w-3.5 h-3.5" />
          <span>Idempotency protection active — duplicate payments are automatically blocked.</span>
        </div>
      </Card>
    </div>
  );
}

// ── Providers Tab ───────────────────────────────────────────────────────────

function ProvidersTab({
  configs,
  setConfigs,
  onRefresh,
}: {
  configs: ProviderConfig[];
  setConfigs: React.Dispatch<React.SetStateAction<ProviderConfig[]>>;
  onRefresh: () => void;
}) {
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [roleChanging, setRoleChanging] = useState<string | null>(null);

  const handleToggle = async (provider: string) => {
    try {
      await adminApi.togglePaymentProvider(provider);
      setConfigs(prev => prev.map(c =>
        c.provider === provider ? { ...c, is_enabled: !c.is_enabled } : c
      ));
    } catch (err) {
      console.error("Failed to toggle provider:", err);
    }
  };

  const handleTest = async (provider: string) => {
    setTestingProvider(provider);
    setTestResults(prev => ({ ...prev, [provider]: undefined as any }));
    try {
      const result = await adminApi.testPaymentProvider(provider);
      setTestResults(prev => ({ ...prev, [provider]: result }));
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [provider]: { success: false, message: err.message } }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSave = async (provider: string, updates: Partial<ProviderConfig>) => {
    setSaving(provider);
    try {
      await adminApi.updatePaymentProvider(provider, updates);
      setSaveSuccess(provider);
      setTimeout(() => setSaveSuccess(null), 2500);
      onRefresh();
    } catch (err) {
      console.error("Failed to save provider config:", err);
    } finally {
      setSaving(null);
    }
  };

  const handleSetRole = async (provider: string, role: ProviderRole) => {
    setRoleChanging(provider);
    try {
      const updatedConfigs = await adminApi.setPaymentProviderRole(provider, role);
      setConfigs(updatedConfigs);
    } catch (err) {
      console.error("Failed to set provider role:", err);
    } finally {
      setRoleChanging(null);
    }
  };

  return (
    <div className="space-y-4">
      {configs.map(config => (
        <ProviderCard
          key={config.provider}
          config={config}
          expanded={expandedProvider === config.provider}
          onToggleExpand={() => setExpandedProvider(
            expandedProvider === config.provider ? null : config.provider
          )}
          onToggleEnabled={() => handleToggle(config.provider)}
          onTest={() => handleTest(config.provider)}
          onSave={(updates) => handleSave(config.provider, updates)}
          onSetRole={(role) => handleSetRole(config.provider, role)}
          testing={testingProvider === config.provider}
          testResult={testResults[config.provider]}
          saving={saving === config.provider}
          saveSuccess={saveSuccess === config.provider}
          roleChanging={roleChanging === config.provider}
        />
      ))}
    </div>
  );
}

// ── Transactions Tab ────────────────────────────────────────────────────────

function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterProvider, setFilterProvider] = useState<string>("");
  const [filterPlan, setFilterPlan] = useState<string>("");
  const [filterDateFrom, setFilterDateFrom] = useState<string>("");
  const [filterDateTo, setFilterDateTo] = useState<string>("");
  const [filterSearch, setFilterSearch] = useState<string>("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit };
      if (filterStatus) params.status = filterStatus;
      if (filterProvider) params.provider = filterProvider;
      if (filterPlan) params.plan = filterPlan;
      if (filterDateFrom) params.date_from = new Date(filterDateFrom).toISOString();
      if (filterDateTo) params.date_to = new Date(filterDateTo + "T23:59:59").toISOString();
      if (filterSearch) params.user_id = filterSearch; // search by user_id for now

      const res = await fetch(
        `${(import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/admin/payment-config/transactions?${new URLSearchParams(
          Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
        )}`,
        { credentials: 'include' }
      );
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
        setTotalCount(json.meta?.total ?? 0);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, filterProvider, filterPlan, filterDateFrom, filterDateTo, filterSearch]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const totalPages = Math.ceil(totalCount / limit);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["Date", "Provider", "Status", "Plan", "Amount", "Currency", "User Email", "Failover From", "Failure Reason"];
    const rows = transactions.map(tx => [
      new Date(tx.created_at).toISOString(),
      tx.provider,
      tx.status,
      tx.plan ?? "",
      String(tx.amount),
      tx.currency,
      tx.user_email ?? "",
      tx.failover_from ?? "",
      tx.failure_reason ?? "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterProvider("");
    setFilterPlan("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setFilterSearch("");
    setPage(1);
  };

  const hasActiveFilters = filterStatus || filterProvider || filterPlan || filterDateFrom || filterDateTo || filterSearch;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(v => !v)}
            className={`border-[#ECECEC] dark:border-[#2D2040] ${showFilters ? "bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF]" : "text-[#6B7280]"}`}
          >
            <Filter className="w-4 h-4 mr-1.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1.5 w-2 h-2 rounded-full bg-[#7B2CBF]" />
            )}
          </Button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-[#7B2CBF] hover:underline">
              Clear all
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            {totalCount} transaction{totalCount !== 1 ? "s" : ""}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Status</label>
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-2 text-sm border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Provider</label>
              <select
                value={filterProvider}
                onChange={e => { setFilterProvider(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-2 text-sm border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              >
                <option value="">All</option>
                <option value="paddle">Paddle</option>
                <option value="paystack">Paystack</option>
                <option value="flutterwave">Flutterwave</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Plan</label>
              <select
                value={filterPlan}
                onChange={e => { setFilterPlan(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-2 text-sm border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              >
                <option value="">All</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-2 text-sm border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={e => { setFilterDateTo(e.target.value); setPage(1); }}
                className="w-full px-2.5 py-2 text-sm border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">User ID</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={filterSearch}
                  onChange={e => { setFilterSearch(e.target.value); setPage(1); }}
                  placeholder="UUID..."
                  className="w-full pl-8 pr-2.5 py-2 text-sm border border-[#ECECEC] dark:border-[#2D2040] rounded-lg bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Transactions table */}
      <Card className="border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-[#7B2CBF] animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#9CA3AF]">
            No transactions found{hasActiveFilters ? " matching your filters" : ""}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ECECEC] dark:border-[#2D2040] bg-[#FAFAFC] dark:bg-[#0D0914]">
                  <th className="text-left py-3 px-4 font-medium text-[#6B7280] dark:text-[#9CA3AF]">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7280] dark:text-[#9CA3AF]">User</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7280] dark:text-[#9CA3AF]">Provider</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7280] dark:text-[#9CA3AF]">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7280] dark:text-[#9CA3AF]">Plan</th>
                  <th className="text-right py-3 px-4 font-medium text-[#6B7280] dark:text-[#9CA3AF]">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7280] dark:text-[#9CA3AF]">Failover</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-[#ECECEC]/50 dark:border-[#2D2040]/50 last:border-0 hover:bg-[#FAFAFC] dark:hover:bg-[#0D0914]/50">
                    <td className="py-3 px-4 text-[#111827] dark:text-[#F9FAFB] whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      <span className="ml-1 text-xs text-[#9CA3AF]">
                        {new Date(tx.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#111827] dark:text-[#F9FAFB] text-xs">
                        {tx.user_email ?? tx.user_id.slice(0, 8) + "..."}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: PROVIDER_META[tx.provider]?.color ?? "#6B7280" }}
                        />
                        <span className="capitalize text-[#111827] dark:text-[#F9FAFB]">{tx.provider}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <TransactionStatusBadge status={tx.status} />
                    </td>
                    <td className="py-3 px-4 capitalize text-[#111827] dark:text-[#F9FAFB]">
                      {tx.plan ?? "—"}
                      {tx.billing_interval && <span className="text-xs text-[#9CA3AF] ml-1">({tx.billing_interval})</span>}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#111827] dark:text-[#F9FAFB]">
                      {tx.amount > 0 ? formatAmount(tx.amount, tx.currency) : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {tx.failover_from ? (
                        <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                          from {tx.failover_from}
                        </Badge>
                      ) : (
                        <span className="text-[#9CA3AF]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#ECECEC] dark:border-[#2D2040]">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {/* Page numbers */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : page + i - 2;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 p-0 ${
                      pageNum === page
                        ? "bg-[#7B2CBF] text-white"
                        : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Provider Card ───────────────────────────────────────────────────────────

interface ProviderCardProps {
  config: ProviderConfig;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
  onTest: () => void;
  onSave: (updates: Partial<ProviderConfig>) => void;
  onSetRole: (role: ProviderRole) => void;
  testing: boolean;
  testResult?: { success: boolean; message: string };
  saving: boolean;
  saveSuccess: boolean;
  roleChanging: boolean;
}

function ProviderCard({
  config, expanded, onToggleExpand, onToggleEnabled, onTest, onSave, onSetRole,
  testing, testResult, saving, saveSuccess, roleChanging,
}: ProviderCardProps) {
  const meta = PROVIDER_META[config.provider];
  const Icon = meta?.icon ?? CreditCard;

  const [publicKey, setPublicKey] = useState(config.public_key ?? "");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [extraConfig, setExtraConfig] = useState(JSON.stringify(config.extra_config ?? {}, null, 2));

  const currentRole: ProviderRole = config.is_international
    ? "international"
    : config.is_primary_local
    ? "primary_local"
    : config.is_failover_local
    ? "failover_local"
    : "none";

  const roleBadge = config.is_international
    ? { label: "International", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" }
    : config.is_primary_local
    ? { label: "Local Primary", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" }
    : config.is_failover_local
    ? { label: "Local Failover", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" }
    : { label: "No Role", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };

  const handleSave = () => {
    const updates: Record<string, unknown> = {};
    if (publicKey && publicKey !== config.public_key) updates.public_key = publicKey;
    if (secretKey) updates.secret_key = secretKey;
    if (webhookSecret) updates.webhook_secret = webhookSecret;
    try {
      const parsed = JSON.parse(extraConfig);
      if (JSON.stringify(parsed) !== JSON.stringify(config.extra_config)) {
        updates.extra_config = parsed;
      }
    } catch { /* invalid JSON, skip */ }

    if (Object.keys(updates).length > 0) {
      onSave(updates as Partial<ProviderConfig>);
    }
  };

  return (
    <Card className={`border transition-all ${
      config.is_enabled
        ? "border-[#ECECEC] dark:border-[#2D2040]"
        : "border-[#ECECEC]/60 dark:border-[#2D2040]/60 opacity-75"
    } bg-white dark:bg-[#160D20]`}>
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: meta?.color ?? "#6B7280" }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB]">
                {config.display_name}
              </h3>
              <Badge className={`text-xs font-medium ${roleBadge.color}`}>
                {roleBadge.label}
              </Badge>
              {config.is_enabled && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
              {meta?.description ?? "Payment provider"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleEnabled}
            className="p-2 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-colors"
            title={config.is_enabled ? "Disable provider" : "Enable provider"}
          >
            {config.is_enabled ? (
              <ToggleRight className="w-6 h-6 text-[#7B2CBF]" />
            ) : (
              <ToggleLeft className="w-6 h-6 text-[#9CA3AF]" />
            )}
          </button>
          <button
            onClick={onToggleExpand}
            className="p-2 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-[#6B7280]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#6B7280]" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded config form */}
      {expanded && (
        <div className="px-5 pb-5 pt-0 border-t border-[#ECECEC] dark:border-[#2D2040]">
          <div className="pt-5 space-y-5">
            {/* Role assignment */}
            <div className="p-4 rounded-lg bg-[#FAFAFC] dark:bg-[#0D0914] border border-[#ECECEC] dark:border-[#2D2040]">
              <Label className="text-[#111827] dark:text-[#F9FAFB] font-medium">Routing Role</Label>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 mb-3">
                Assign this provider's role in the payment routing pipeline. Only one provider can hold each role.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => onSetRole(opt.value)}
                    disabled={roleChanging || currentRole === opt.value}
                    className={`relative p-3 rounded-lg border text-left transition-all ${
                      currentRole === opt.value
                        ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030]"
                        : "border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF]/50"
                    } ${roleChanging ? "opacity-60" : ""}`}
                  >
                    <p className={`text-xs font-medium ${currentRole === opt.value ? "text-[#7B2CBF]" : "text-[#111827] dark:text-[#F9FAFB]"}`}>
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{opt.description}</p>
                    {currentRole === opt.value && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#7B2CBF] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {roleChanging && (
                <div className="mt-2 flex items-center gap-2 text-xs text-[#7B2CBF]">
                  <Loader2 className="w-3 h-3 animate-spin" /> Updating role...
                </div>
              )}
            </div>

            {/* Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Public Key</Label>
                <Input
                  value={publicKey}
                  onChange={e => setPublicKey(e.target.value)}
                  placeholder={config.provider === "paddle" ? "Not used for Paddle" : "pk_live_..."}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Secret Key</Label>
                <div className="relative">
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={secretKey}
                    onChange={e => setSecretKey(e.target.value)}
                    placeholder={config.secret_key ? config.secret_key : "Enter secret key"}
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Webhook Secret</Label>
                <div className="relative">
                  <Input
                    type={showWebhook ? "text" : "password"}
                    value={webhookSecret}
                    onChange={e => setWebhookSecret(e.target.value)}
                    placeholder={config.webhook_secret ? config.webhook_secret : "Enter webhook secret/hash"}
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhook(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
                  >
                    {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Extra config (JSON) */}
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">
                Extra Configuration (JSON)
                <span className="ml-2 text-xs font-normal text-[#6B7280] dark:text-[#9CA3AF]">
                  {config.provider === "paddle" ? "price_map, environment, seller_id" :
                   config.provider === "paystack" ? "plan_map" :
                   "plan_map"}
                </span>
              </Label>
              <textarea
                value={extraConfig}
                onChange={e => setExtraConfig(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] resize-y"
                placeholder={getExtraConfigPlaceholder(config.provider)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-[#ECECEC] dark:border-[#2D2040]">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onTest}
                  disabled={testing || !config.secret_key}
                  className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]"
                >
                  {testing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Test Connection
                </Button>

                {testResult && (
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${
                    testResult.success ? "text-green-600 dark:text-green-400" : "text-red-500"
                  }`}>
                    {testResult.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {testResult.message}
                  </span>
                )}

                {meta?.docsUrl && (
                  <a
                    href={meta.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#7B2CBF] hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Docs
                  </a>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
              >
                {saveSuccess ? (
                  <><Check className="w-4 h-4 mr-2" /> Saved</>
                ) : saving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Credentials</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Shared Components ───────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, bgColor, subtitle,
}: {
  label: string; value: string | number; icon: React.ElementType; color: string; bgColor: string; subtitle?: string;
}) {
  return (
    <Card className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{label}</p>
          <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB] mt-1">{value}</p>
          {subtitle && <p className="text-[10px] text-[#9CA3AF] mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
      </div>
    </Card>
  );
}

function TransactionStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    refunded: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <Badge className={`text-xs capitalize ${styles[status] ?? styles.pending}`}>
      {status}
    </Badge>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(amount: number, currency: string): string {
  const symbols: Record<string, string> = { USD: "$", NGN: "\u20A6", GHS: "GH\u20B5", KES: "KSh", EUR: "\u20AC", GBP: "\u00A3" };
  const symbol = symbols[currency.toUpperCase()] ?? currency + " ";
  // Amounts stored in smallest unit — convert for display
  const decimals = ["JPY", "KRW", "VND"].includes(currency.toUpperCase()) ? 0 : 2;
  const displayAmount = decimals > 0 ? (amount / 100).toFixed(decimals) : String(amount);
  return `${symbol}${Number(displayAmount).toLocaleString()}`;
}

function getExtraConfigPlaceholder(provider: string): string {
  switch (provider) {
    case "paddle":
      return '{\n  "environment": "sandbox",\n  "seller_id": "...",\n  "price_map": {\n    "pro_monthly": "pri_...",\n    "pro_yearly": "pri_...",\n    "enterprise_monthly": "pri_..."\n  }\n}';
    case "paystack":
      return '{\n  "plan_map": {\n    "pro_monthly": "PLN_...",\n    "pro_yearly": "PLN_...",\n    "enterprise_monthly": "PLN_..."\n  }\n}';
    case "flutterwave":
      return '{\n  "plan_map": {\n    "pro_monthly": "FLW_PLN_...",\n    "pro_yearly": "FLW_PLN_...",\n    "enterprise_monthly": "FLW_PLN_..."\n  }\n}';
    default:
      return "{}";
  }
}
