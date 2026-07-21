import { useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Clock,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  Filter,
  ChevronDown,
  ExternalLink,
  X,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

// ─── Types ─────────────────────────────────────────────────────────────────

interface MonitoringSummary {
  period_hours: number;
  total_requests: number;
  inbound_requests: number;
  outbound_requests: number;
  total_errors: number;
  error_rate: number;
  avg_response_time_ms: number;
  p95_response_time_ms: number;
  avg_provider_time_ms: number;
}

interface TimeseriesPoint {
  timestamp: string;
  requests: number;
  errors: number;
  avg_duration_ms: number;
}

interface TopEndpoint {
  method: string;
  path: string;
  total_requests: number;
  error_count: number;
  error_rate: number;
  avg_duration_ms: number;
}

interface ProviderHealth {
  provider: string;
  total_calls: number;
  error_count: number;
  error_rate: number;
  avg_duration_ms: number;
  p50_duration_ms: number;
  p95_duration_ms: number;
  p99_duration_ms: number;
  last_call: string;
  last_error: string | null;
  status: "healthy" | "degraded" | "unhealthy";
}

interface ErrorEntry {
  id: string;
  direction: string;
  provider: string | null;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  error_message: string;
  error_code: string | null;
  started_at: string;
  request_id: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getMethodColor(method: string): string {
  switch (method) {
    case "GET": return "text-[#22C55E]";
    case "POST": return "text-[#3B82F6]";
    case "PUT": return "text-[#F59E0B]";
    case "PATCH": return "text-[#8B5CF6]";
    case "DELETE": return "text-[#EF4444]";
    default: return "text-[#6B7280]";
  }
}

function getStatusColor(status: "healthy" | "degraded" | "unhealthy"): string {
  switch (status) {
    case "healthy": return "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20";
    case "degraded": return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
    case "unhealthy": return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20";
  }
}

// ─── Mini Sparkline ────────────────────────────────────────────────────────

function Sparkline({ data, color = "#7B2CBF" }: { data: number[]; color?: string }) {
  if (!data.length) return <div className="h-10 w-full" />;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100;
    const y = 100 - (v / max) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-10 w-full">
      {data.length === 1 ? (
        <circle cx="50" cy="50" r="4" fill={color} />
      ) : (
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      )}
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function RequestMonitorView() {
  const [timeRange, setTimeRange] = useState(24);
  const [activeTab, setActiveTab] = useState<"overview" | "endpoints" | "providers" | "errors">("overview");

  const { data: summary, loading: summaryLoading, refetch: refetchSummary } = useApi(
    () => adminApi.getMonitoringSummary(timeRange),
    [timeRange]
  );

  const { data: timeseries, loading: timeseriesLoading } = useApi(
    () => adminApi.getMonitoringTimeseries({ hours: timeRange, bucket: timeRange <= 6 ? '5m' : timeRange <= 24 ? '1h' : '6h' }),
    [timeRange]
  );

  const { data: topEndpoints, loading: endpointsLoading } = useApi(
    () => adminApi.getMonitoringTopEndpoints({ hours: timeRange, limit: 15 }),
    [timeRange]
  );

  const { data: providers, loading: providersLoading } = useApi(
    () => adminApi.getMonitoringProviders(timeRange),
    [timeRange]
  );

  const { data: errors, loading: errorsLoading } = useApi(
    () => adminApi.getMonitoringErrors({ hours: timeRange, limit: 20 }),
    [timeRange]
  );

  const summaryData = summary as MonitoringSummary | null;
  const timeseriesData = (timeseries as any)?.points as TimeseriesPoint[] | undefined;
  const endpointsData = (topEndpoints as any)?.endpoints as TopEndpoint[] | undefined;
  const providersData = (providers as any)?.providers as ProviderHealth[] | undefined;
  const errorsData = (errors as any)?.errors as ErrorEntry[] | undefined;

  const handleRefresh = () => {
    refetchSummary();
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">Request Monitor</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Real-time request tracking and provider health
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] text-[#111827] dark:text-[#F9FAFB] cursor-pointer focus:outline-none focus:border-[#7B2CBF]"
            >
              <option value={1}>Last 1 hour</option>
              <option value={6}>Last 6 hours</option>
              <option value={24}>Last 24 hours</option>
              <option value={72}>Last 3 days</option>
              <option value={168}>Last 7 days</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7B2CBF] hover:border-[#7B2CBF] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          label="Total Requests"
          value={summaryData ? formatNumber(summaryData.total_requests) : "—"}
          subtitle={summaryData ? `${formatNumber(summaryData.inbound_requests)} in / ${formatNumber(summaryData.outbound_requests)} out` : ""}
          icon={Activity}
          loading={summaryLoading}
        />
        <KpiCard
          label="Avg Response Time"
          value={summaryData ? formatDuration(summaryData.avg_response_time_ms) : "—"}
          subtitle={summaryData ? `P95: ${formatDuration(summaryData.p95_response_time_ms)}` : ""}
          icon={Clock}
          loading={summaryLoading}
        />
        <KpiCard
          label="Error Rate"
          value={summaryData ? `${summaryData.error_rate}%` : "—"}
          subtitle={summaryData ? `${summaryData.total_errors} errors total` : ""}
          icon={AlertTriangle}
          loading={summaryLoading}
          alert={summaryData ? summaryData.error_rate > 5 : false}
        />
        <KpiCard
          label="Avg Provider Latency"
          value={summaryData ? formatDuration(summaryData.avg_provider_time_ms) : "—"}
          subtitle="External API calls"
          icon={ExternalLink}
          loading={summaryLoading}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-[#ECECEC] dark:border-[#2D2040]">
        <div className="flex gap-1 -mb-px">
          {[
            { id: "overview" as const, label: "Overview" },
            { id: "endpoints" as const, label: "Top Endpoints" },
            { id: "providers" as const, label: "Providers" },
            { id: "errors" as const, label: "Errors" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#7B2CBF] text-[#7B2CBF] dark:text-[#C77DFF]"
                  : "border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
              }`}
            >
              {tab.label}
              {tab.id === "errors" && summaryData && summaryData.total_errors > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-[#EF4444]/10 text-[#EF4444]">
                  {summaryData.total_errors}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab data={timeseriesData} loading={timeseriesLoading} />
      )}
      {activeTab === "endpoints" && (
        <EndpointsTab data={endpointsData} loading={endpointsLoading} />
      )}
      {activeTab === "providers" && (
        <ProvidersTab data={providersData} loading={providersLoading} />
      )}
      {activeTab === "errors" && (
        <ErrorsTab data={errorsData} loading={errorsLoading} />
      )}
    </div>
  );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────

function KpiCard({
  label, value, subtitle, icon: Icon, loading, alert,
}: {
  label: string; value: string; subtitle: string;
  icon: React.ElementType; loading: boolean; alert?: boolean;
}) {
  if (loading) {
    return (
      <Card className="p-4 md:p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-16 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
          <div className="h-8 w-20 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
          <div className="h-3 w-24 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 md:p-5 border bg-white dark:bg-[#160D20] ${
      alert ? "border-[#EF4444]/30 dark:border-[#EF4444]/30" : "border-[#ECECEC] dark:border-[#2D2040]"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${alert ? "bg-[#EF4444]/10" : "bg-[#F6EEFF] dark:bg-[#1E1030]"}`}>
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${alert ? "text-[#EF4444]" : "text-[#7B2CBF] dark:text-[#C77DFF]"}`} />
        </div>
      </div>
      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{label}</p>
      <p className={`text-xl md:text-2xl font-semibold mt-1 ${
        alert ? "text-[#EF4444]" : "text-[#111827] dark:text-[#F9FAFB]"
      }`}>{value}</p>
      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">{subtitle}</p>
    </Card>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────────────

function OverviewTab({ data, loading }: { data?: TimeseriesPoint[]; loading: boolean }) {
  if (loading) {
    return (
      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
          <div className="h-40 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
        </div>
      </Card>
    );
  }

  const points = data ?? [];
  const requestCounts = points.map(p => p.requests);
  const errorCounts = points.map(p => p.errors);
  const durationValues = points.map(p => p.avg_duration_ms);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Request Volume */}
      <Card className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h4 className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] mb-3">Request Volume</h4>
        <Sparkline data={requestCounts} color="#7B2CBF" />
        <div className="flex justify-between mt-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <span>{points.length > 0 ? new Date(points[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
          <span>{points.length > 0 ? new Date(points[points.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
        </div>
      </Card>

      {/* Response Time */}
      <Card className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h4 className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] mb-3">Avg Response Time</h4>
        <Sparkline data={durationValues} color="#3B82F6" />
        <div className="flex justify-between mt-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <span>{points.length > 0 ? new Date(points[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
          <span>{points.length > 0 ? new Date(points[points.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
        </div>
      </Card>

      {/* Error Volume */}
      <Card className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h4 className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] mb-3">Errors Over Time</h4>
        <Sparkline data={errorCounts} color="#EF4444" />
        <div className="flex justify-between mt-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <span>{points.length > 0 ? new Date(points[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
          <span>{points.length > 0 ? new Date(points[points.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
        </div>
      </Card>

      {/* Throughput breakdown */}
      <Card className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h4 className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] mb-3">Throughput Summary</h4>
        <div className="space-y-3">
          {points.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Peak Requests (bucket)</span>
                <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                  {Math.max(...requestCounts)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Total Errors</span>
                <span className="text-sm font-medium text-[#EF4444]">
                  {errorCounts.reduce((a, b) => a + b, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Max Avg Latency</span>
                <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
                  {formatDuration(Math.max(...durationValues))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Data Points</span>
                <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{points.length}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] text-center py-4">
              No request data for this time period
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Endpoints Tab ─────────────────────────────────────────────────────────

function EndpointsTab({ data, loading }: { data?: TopEndpoint[]; loading: boolean }) {
  if (loading) {
    return (
      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
          ))}
        </div>
      </Card>
    );
  }

  const endpoints = data ?? [];

  return (
    <Card className="border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] overflow-hidden">
      <div className="p-4 border-b border-[#ECECEC] dark:border-[#2D2040]">
        <h4 className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">
          Top Endpoints by Volume
        </h4>
      </div>
      {endpoints.length === 0 ? (
        <p className="p-6 text-sm text-[#6B7280] dark:text-[#9CA3AF] text-center">
          No endpoint data available
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#ECECEC] dark:border-[#2D2040] bg-[#FAFAFC] dark:bg-[#1A1228]">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Endpoint</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Requests</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Errors</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Error Rate</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((ep, i) => (
                <tr key={i} className="border-b border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-mono font-bold ${getMethodColor(ep.method)}`}>
                        {ep.method}
                      </span>
                      <span className="text-sm text-[#111827] dark:text-[#F9FAFB] font-mono truncate max-w-[300px]">
                        {ep.path}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right text-sm text-[#111827] dark:text-[#F9FAFB] font-medium">
                    {formatNumber(ep.total_requests)}
                  </td>
                  <td className="py-2.5 px-4 text-right text-sm text-[#EF4444]">
                    {ep.error_count > 0 ? ep.error_count : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={`text-sm ${ep.error_rate > 5 ? "text-[#EF4444]" : ep.error_rate > 1 ? "text-[#F59E0B]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}>
                      {ep.error_rate > 0 ? `${ep.error_rate}%` : "—"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-sm text-[#111827] dark:text-[#F9FAFB]">
                    {formatDuration(ep.avg_duration_ms)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ─── Providers Tab ─────────────────────────────────────────────────────────

function ProvidersTab({ data, loading }: { data?: ProviderHealth[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-24 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
              <div className="h-16 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const providersList = data ?? [];

  if (providersList.length === 0) {
    return (
      <Card className="p-8 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] text-center">
        <Server className="w-10 h-10 text-[#6B7280] dark:text-[#9CA3AF] mx-auto mb-3" />
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">No provider activity in this time range</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {providersList.map((provider) => (
        <Card key={provider.provider} className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {provider.status === "healthy" ? (
                <Wifi className="w-4 h-4 text-[#22C55E]" />
              ) : provider.status === "degraded" ? (
                <Wifi className="w-4 h-4 text-[#F59E0B]" />
              ) : (
                <WifiOff className="w-4 h-4 text-[#EF4444]" />
              )}
              <h4 className="font-medium text-[#111827] dark:text-[#F9FAFB] capitalize">
                {provider.provider}
              </h4>
            </div>
            <Badge className={`text-xs border ${getStatusColor(provider.status)}`}>
              {provider.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Total Calls</p>
              <p className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">{formatNumber(provider.total_calls)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Error Rate</p>
              <p className={`text-lg font-semibold ${provider.error_rate > 5 ? "text-[#EF4444]" : "text-[#111827] dark:text-[#F9FAFB]"}`}>
                {provider.error_rate}%
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Avg Latency</p>
              <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{formatDuration(provider.avg_duration_ms)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">P95 Latency</p>
              <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{formatDuration(provider.p95_duration_ms)}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#ECECEC] dark:border-[#2D2040] flex items-center justify-between">
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Last call: {timeAgo(provider.last_call)}
            </span>
            {provider.last_error && (
              <span className="text-xs text-[#EF4444]">
                Last error: {timeAgo(provider.last_error)}
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Errors Tab ────────────────────────────────────────────────────────────

function ErrorsTab({ data, loading }: { data?: ErrorEntry[]; loading: boolean }) {
  const [selectedError, setSelectedError] = useState<ErrorEntry | null>(null);

  if (loading) {
    return (
      <Card className="p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-[#F6EEFF] dark:bg-[#1E1030] rounded" />
          ))}
        </div>
      </Card>
    );
  }

  const errorsList = data ?? [];

  if (errorsList.length === 0) {
    return (
      <Card className="p-8 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] text-center">
        <AlertTriangle className="w-10 h-10 text-[#22C55E] mx-auto mb-3" />
        <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">No errors</p>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">All systems operating normally</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] overflow-hidden">
        <div className="p-4 border-b border-[#ECECEC] dark:border-[#2D2040] flex items-center justify-between">
          <h4 className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Recent Errors</h4>
          <Badge className="text-xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
            {errorsList.length} errors
          </Badge>
        </div>
        <div className="divide-y divide-[#ECECEC] dark:divide-[#2D2040]">
          {errorsList.map((err) => (
            <button
              key={err.id}
              onClick={() => setSelectedError(err)}
              className="w-full text-left p-4 hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-mono font-bold ${getMethodColor(err.method)}`}>
                      {err.method}
                    </span>
                    <span className="text-sm text-[#111827] dark:text-[#F9FAFB] font-mono truncate">
                      {err.path}
                    </span>
                    <Badge className="text-xs bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20">
                      {err.status_code}
                    </Badge>
                    {err.provider && (
                      <Badge className="text-xs bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] border-[#7B2CBF]/20">
                        {err.provider}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 truncate">
                    {err.error_message}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{timeAgo(err.started_at)}</p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{formatDuration(err.duration_ms)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Error Detail Slide Panel */}
      <ErrorDetailPanel error={selectedError} onClose={() => setSelectedError(null)} />
    </>
  );
}

// ─── Error Detail Slide Panel ──────────────────────────────────────────────

function ErrorDetailPanel({ error, onClose }: { error: ErrorEntry | null; onClose: () => void }) {
  if (!error) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-[#110C1A] border-l border-[#ECECEC] dark:border-[#2D2040] shadow-xl overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#110C1A] border-b border-[#ECECEC] dark:border-[#2D2040] p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Error Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] text-[#6B7280] dark:text-[#9CA3AF] transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Status + Method + Path */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-mono font-bold ${getMethodColor(error.method)}`}>
                {error.method}
              </span>
              <Badge className="text-xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20">
                {error.status_code}
              </Badge>
              {error.provider && (
                <Badge className="text-xs bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] border border-[#7B2CBF]/20">
                  {error.provider}
                </Badge>
              )}
            </div>
            <p className="text-sm text-[#111827] dark:text-[#F9FAFB] font-mono break-all">
              {error.path}
            </p>
          </div>

          {/* Error Message */}
          <DetailSection label="Error Message">
            <p className="text-sm text-[#EF4444] font-medium">{error.error_message || "—"}</p>
          </DetailSection>

          {/* Error Code */}
          {error.error_code && (
            <DetailSection label="Error Code">
              <code className="text-xs px-2 py-1 rounded bg-[#FAFAFC] dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] font-mono">
                {error.error_code}
              </code>
            </DetailSection>
          )}

          {/* Timing */}
          <DetailSection label="Timing">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Duration</p>
                <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{formatDuration(error.duration_ms)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Occurred</p>
                <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{timeAgo(error.started_at)}</p>
              </div>
            </div>
          </DetailSection>

          {/* Timestamp */}
          <DetailSection label="Timestamp">
            <p className="text-sm text-[#111827] dark:text-[#F9FAFB] font-mono">
              {new Date(error.started_at).toLocaleString()}
            </p>
          </DetailSection>

          {/* Request Info */}
          <DetailSection label="Request Info">
            <div className="space-y-2">
              <DetailRow label="Direction" value={error.direction} />
              <DetailRow label="Request ID" value={error.request_id || "—"} mono />
              {error.ip_address && <DetailRow label="IP Address" value={error.ip_address} mono />}
              {error.provider && <DetailRow label="Provider" value={error.provider} />}
            </div>
          </DetailSection>
        </div>
      </div>
    </>
  );
}

// ─── Detail Panel Helpers ──────────────────────────────────────────────────

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] uppercase tracking-wider">{label}</p>
      <div className="pl-0">{children}</div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{label}</span>
      <span className={`text-sm text-[#111827] dark:text-[#F9FAFB] ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}
