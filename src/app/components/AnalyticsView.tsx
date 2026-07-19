import { Users, UserCheck, Clock, Target, TrendingUp, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { AnalyticsSkeleton } from "./LoadingSkeleton";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

export default function AnalyticsView() {
  const { data: apiData, loading } = useApi(() => adminApi.getAnalytics());

  if (loading) return <AnalyticsSkeleton />;

  const platformMetrics = [
    { label: "Daily Active Users",     value: apiData ? String(apiData.active_users ?? 0)  : "—",   change: "—", icon: Users,      description: "Users active in the last 24 hours" },
    { label: "Weekly Active Users",    value: apiData ? String(apiData.total_users ?? 0)  : "—", change: "—",  icon: UserCheck,  description: "Users active in the last 7 days" },
    { label: "Average Learning Time",  value: "—",                                                change: "—", icon: Clock,      description: "Average session duration per user" },
    { label: "Lesson Completion Rate", value: apiData ? `${Math.round(apiData.completion_rate ?? 0)}%` : "—", change: "—", icon: Target, description: "Percentage of started lessons completed" },
  ];

  const engagementMetrics = [
    { label: "Total Sessions",         value: apiData ? String(apiData.enrollments ?? 0) : "—", period: "This month" },
    { label: "Avg. Sessions per User", value: "—",                                                    period: "This month" },
    { label: "New Users",              value: "—",                                                    period: "This week" },
    { label: "Returning Users",        value: apiData ? String(apiData.active_users ?? 0) : "—",   period: "This week" },
  ];

  const skillPopularity: any[] = [];

  const recentActivity: any[] = [];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Platform Metrics */}
      <div>
        <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB] mb-4">Platform Analytics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {platformMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="p-2 md:p-3 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030]">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#7B2CBF] dark:text-[#C77DFF]" />
                  </div>
                  <div className="flex items-center gap-1 text-[#22C55E]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{metric.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B7280] dark:text-[#9CA3AF]">{metric.label}</p>
                  <p className="text-2xl md:text-3xl font-semibold text-[#111827] dark:text-[#F9FAFB] mt-1 md:mt-2">{metric.value}</p>
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 hidden md:block">{metric.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Engagement Metrics */}
      <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {engagementMetrics.map((metric, index) => (
            <div key={index} className="p-3 md:p-4 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
              <p className="text-xs md:text-sm text-[#6B7280] dark:text-[#9CA3AF]">{metric.label}</p>
              <p className="text-xl md:text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB] mt-1 md:mt-2">{metric.value}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">{metric.period}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Skill Popularity */}
      <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">Skill Popularity</h3>
        <div className="space-y-4">
          {skillPopularity.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{item.skill}</span>
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{item.users.toLocaleString()} learners</span>
              </div>
              <div className="h-2 bg-[#F6EEFF] dark:bg-[#1E1030] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7B2CBF] rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Recent Activity</h3>
          <div className="flex items-center gap-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            <Calendar className="w-4 h-4" />
            <span>Last 7 days</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-[#ECECEC] dark:border-[#2D2040]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Active Users</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Lessons Completed</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((day, index) => (
                <tr key={index} className="border-b border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228]">
                  <td className="py-3 px-4 font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{day.date}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{day.users}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{day.lessons}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
