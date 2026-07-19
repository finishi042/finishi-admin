import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  BookOpen,
  Map,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  Sparkles
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import LessonPreviewModal from "./modals/LessonPreviewModal";
import EditLessonModal from "./modals/EditLessonModal";
import { DashboardSkeleton } from "./LoadingSkeleton";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

const DASH_AVATARS: Record<string, string> = {};

function DashAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-semibold">{initials}</span>
    </div>
  );
}

interface DashLesson {
  title: string;
  skill: string;
  description: string;
  duration: string;
  created: string;
  status: string;
  views: number;
}

interface DashboardViewProps {
  onQuickAction?: (tab: string, modal: string) => void;
}

export default function DashboardView({ onQuickAction }: DashboardViewProps) {
  const [previewLesson, setPreviewLesson] = useState<{ lesson: DashLesson; index: number } | null>(null);
  const [editLesson, setEditLesson] = useState<{ lesson: DashLesson; index: number } | null>(null);
  const [recentLessons, setRecentLessons] = useState<DashLesson[]>([]);

  const { data: dashData, loading } = useApi(() => adminApi.getDashboard());

  const kpis = dashData?.kpis;
  const kpiData = [
    { label: "Total Users", value: kpis ? kpis.total_users.toLocaleString() : "—", icon: Users, growth: "+12%", color: "text-[#7B2CBF]" },
    { label: "Active Learners", value: kpis ? kpis.active_learners.toLocaleString() : "—", icon: UserCheck, growth: "+8%", color: "text-[#22C55E]" },
    { label: "Lessons Completed", value: kpis ? kpis.lessons_completed.toLocaleString() : "—", icon: BookOpen, growth: "+24%", color: "text-[#C77DFF]" },
    { label: "Learning Paths Created", value: kpis ? kpis.learning_paths.toLocaleString() : "—", icon: Map, growth: "+5%", color: "text-[#F97316]" },
  ];

  const recentActivity: any[] = dashData?.recent_activity ?? [];

  const SKILL_COLORS = ["bg-[#7B2CBF]", "bg-[#C77DFF]", "bg-[#22C55E]", "bg-[#F97316]"];
  const popularSkills: any[] = (dashData?.popular_skills ?? []).map((s: any, i: number) => ({ ...s, color: SKILL_COLORS[i % SKILL_COLORS.length] }));

  const learningPaths: any[] = dashData?.paths_overview ?? [];

  const apiLessons: DashLesson[] = (dashData?.recent_lessons ?? []).map((l: any) => ({
    title: l.title,
    skill: l.skill_name,
    description: l.description ?? "",
    duration: l.duration_mins ? `${l.duration_mins} mins` : "—",
    created: l.created_at ? new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    status: l.status === "published" ? "Published" : "Draft",
    views: l.view_count ?? 0,
  }));

  // Sync API lessons into state when they arrive
  useEffect(() => { if (apiLessons.length > 0) setRecentLessons(apiLessons); }, [dashData]);

  const quickActions = [
    { label: "Add New Skill", icon: Plus, color: "bg-[#7B2CBF]", tab: "skills", modal: "addSkill" },
    { label: "Create Learning Path", icon: Map, color: "bg-[#C77DFF]", tab: "paths", modal: "createPath" },
    { label: "Generate AI Lesson", icon: Sparkles, color: "bg-[#22C55E]", tab: "lessons", modal: "aiLesson" },
    { label: "Manage Users", icon: Users, color: "bg-[#F97316]", tab: "users", modal: "addUser" },
  ];

  const handleLessonEditSave = (index: number, updated: DashLesson) => {
    setRecentLessons(prev => prev.map((l, i) => i === index ? updated : l));
  };

  const handleDeleteLesson = (index: number) => {
    setRecentLessons(prev => prev.filter((_, i) => i !== index));
  };

  // Normalise activity row fields from API vs fallback
  const normActivity = (u: any) => ({
    name: u.name ?? u.full_name ?? "Unknown",
    skill: u.skill ?? u.skill_name ?? "—",
    lesson: u.lesson ?? u.current_lesson ?? "—",
    progress: u.progress ?? 0,
    lastActive: u.lastActive ?? u.last_active ?? "—",
  });

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-4 md:space-y-6">
      <LessonPreviewModal
        open={!!previewLesson}
        lesson={previewLesson?.lesson ?? null}
        onClose={() => setPreviewLesson(null)}
        onEdit={previewLesson ? () => {
          const snap = previewLesson;
          setPreviewLesson(null);
          setEditLesson(snap);
        } : undefined}
      />
      <EditLessonModal
        open={!!editLesson}
        lesson={editLesson?.lesson ?? null}
        index={editLesson?.index ?? null}
        onClose={() => setEditLesson(null)}
        onSave={handleLessonEditSave}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
              <div className="flex items-start justify-between">
                <div className="space-y-1 md:space-y-2 flex-1">
                  <p className="text-xs md:text-sm text-[#6B7280] dark:text-[#9CA3AF]">{kpi.label}</p>
                  <p className="text-2xl md:text-3xl font-semibold text-[#111827] dark:text-[#F9FAFB]">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span className="text-xs md:text-sm text-[#22C55E]">{kpi.growth}</span>
                  </div>
                </div>
                <div className="p-2 md:p-3 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030]">
                  <Icon className={`w-5 h-5 md:w-6 md:h-6 ${kpi.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickAction?.(action.tab, action.modal)}
                className="flex flex-col items-center gap-2 md:gap-3 p-4 md:p-6 rounded-lg border-2 border-[#ECECEC] dark:border-[#2D2040] hover:border-[#7B2CBF] hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] transition-all group"
              >
                <div className={`${action.color} p-3 md:p-4 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <span className="font-medium text-[#111827] dark:text-[#F9FAFB] text-center text-xs md:text-sm">{action.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* User Activity */}
      <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">Recent Learner Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-[#ECECEC] dark:border-[#2D2040]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">User Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Skill</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Current Lesson</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Progress</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((raw, index) => {
                const user = normActivity(raw);
                return (
                <tr key={index} className="border-b border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <DashAvatar name={user.name} />
                      <span className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{user.skill}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{user.lesson}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#F6EEFF] dark:bg-[#1E1030] rounded-full overflow-hidden max-w-[80px]">
                        <div className="h-full bg-[#7B2CBF] rounded-full" style={{ width: `${user.progress}%` }} />
                      </div>
                      <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{user.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#6B7280] dark:text-[#9CA3AF]">{user.lastActive}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Skills and Paths Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Popular Skills */}
        <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Popular Skills</h3>
            <Button
              size="sm"
              onClick={() => onQuickAction?.("skills", "addSkill")}
              className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Skill
            </Button>
          </div>
          <div className="space-y-3">
            {popularSkills.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${skill.color}`} />
                  <span className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{skill.name}</span>
                </div>
                <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{(skill.learner_count ?? skill.learners ?? 0).toLocaleString()} Learners</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Learning Paths */}
        <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">Learning Paths Overview</h3>
          <div className="space-y-3">
            {learningPaths.map((path, index) => (
              <div key={index} className="p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{path.name}</h4>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{path.skill_name ?? path.skill}</p>
                  </div>
                  <Badge className="bg-[#22C55E] text-white text-xs">{path.status}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <span>{path.enrolled_count ?? path.users ?? 0} Users</span>
                  <span>•</span>
                  <span>{path.completion_rate ?? path.completion ?? 0}% Completion</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Lessons */}
      <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB] mb-4">Recent Lessons</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[#ECECEC] dark:border-[#2D2040]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Lesson Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Skill</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Created</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentLessons.map((lesson, index) => (
                <tr key={index} className="border-b border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228]">
                  <td className="py-3 px-4 font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{lesson.title}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{lesson.skill}</td>
                  <td className="py-3 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{lesson.created}</td>
                  <td className="py-3 px-4">
                    <Badge className={lesson.status === "Published" ? "bg-[#22C55E] text-white" : "bg-[#6B7280] text-white"}>
                      {lesson.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewLesson({ lesson, index })}
                        className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg"
                        title="Preview lesson"
                      >
                        <Eye className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                      </button>
                      <button
                        onClick={() => setEditLesson({ lesson, index })}
                        className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg"
                        title="Edit lesson"
                      >
                        <Edit className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(index)}
                        className="p-1.5 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-lg"
                        title="Delete lesson"
                      >
                        <Trash2 className="w-4 h-4 text-[#EF4444]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
