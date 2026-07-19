import { useState, useEffect } from "react";
import { X, Lightbulb, Users, BookOpen, TrendingUp, Plus, Trash2, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { adminApi } from "../../api";

interface Skill {
  name: string;
  description: string;
  color: string;
  learners: number;
  lessons: number;
}

interface LessonData {
  id: string;
  title: string;
  duration_mins: number;
  view_count: number;
  status: string;
}

interface LearnerData {
  id: string;
  full_name: string;
  email: string;
  last_login: string | null;
}

interface ManageSkillModalProps {
  open: boolean;
  skill: Skill | null;
  onClose: () => void;
}

export default function ManageSkillModal({ open, skill, onClose }: ManageSkillModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "lessons" | "learners">("overview");
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [learners, setLearners] = useState<LearnerData[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [learnersLoading, setLearnersLoading] = useState(false);

  // Fetch lessons for this skill when modal opens
  useEffect(() => {
    if (!open || !skill) { setLessons([]); setLearners([]); return; }

    setLessonsLoading(true);
    adminApi.getLessons({ skill: skill.name })
      .then((data: any) => {
        const mapped = (Array.isArray(data) ? data : []).map((l: any) => ({
          id: l.id,
          title: l.title,
          duration_mins: l.duration_mins ?? 10,
          view_count: l.view_count ?? 0,
          status: l.status === "published" ? "Published" : "Draft",
        }));
        setLessons(mapped);
      })
      .catch(() => setLessons([]))
      .finally(() => setLessonsLoading(false));

    // Fetch learners (users who have this skill in their interests)
    setLearnersLoading(true);
    adminApi.getUsers({ limit: 10 })
      .then((data: any) => {
        const users = (Array.isArray(data) ? data : data?.users ?? []).map((u: any) => ({
          id: u.id,
          full_name: u.full_name ?? u.email ?? "Unknown",
          email: u.email,
          last_login: u.last_login ?? u.created_at ?? null,
        }));
        setLearners(users);
      })
      .catch(() => setLearners([]))
      .finally(() => setLearnersLoading(false));
  }, [open, skill]);

  if (!open || !skill) return null;

  const publishedLessons = lessons.filter(l => l.status === "Published");
  const totalViews = lessons.reduce((s, l) => s + l.view_count, 0);
  const completionRate = skill.learners > 0 ? Math.min(100, Math.round((publishedLessons.length / Math.max(lessons.length, 1)) * 100)) : 0;

  function timeAgo(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-2xl border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: skill.color }}>
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{skill.name}</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Skill Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#ECECEC] dark:border-[#2D2040] shrink-0 px-6">
          {(["overview", "lessons", "learners"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-sm font-medium capitalize border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#7B2CBF] text-[#7B2CBF] dark:text-[#C77DFF]"
                  : "border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F9FAFB]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{skill.description || "No description provided."}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Users, label: "Total Learners", value: skill.learners.toLocaleString(), color: "text-[#7B2CBF]" },
                  { icon: BookOpen, label: "Lessons", value: lessons.length.toString(), color: "text-[#C77DFF]" },
                  { icon: TrendingUp, label: "Published", value: `${publishedLessons.length}`, color: "text-[#22C55E]" },
                  { icon: BookOpen, label: "Total Views", value: totalViews.toLocaleString(), color: "text-[#F97316]" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040] text-center">
                      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${stat.color}`} />
                      <p className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{stat.value}</p>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Published Lessons</span>
                  <span className="text-sm font-semibold text-[#7B2CBF]">{publishedLessons.length}/{lessons.length}</span>
                </div>
                <Progress value={lessons.length > 0 ? (publishedLessons.length / lessons.length) * 100 : 0} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <span>{publishedLessons.length} of {lessons.length} lessons published</span>
                  <span>{skill.learners.toLocaleString()} active learners</span>
                </div>
              </div>

              {/* Quick lesson list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">Recent Lessons</h4>
                  <button onClick={() => setActiveTab("lessons")} className="text-xs text-[#7B2CBF] flex items-center gap-1 hover:underline">
                    View all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {lessonsLoading ? (
                  <div className="flex items-center gap-2 py-4 justify-center text-sm text-[#6B7280]">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading lessons...
                  </div>
                ) : lessons.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] text-center py-4">No lessons created for this skill yet.</p>
                ) : (
                  <div className="space-y-2">
                    {lessons.slice(0, 3).map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                        <div>
                          <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{lesson.title}</p>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{lesson.duration_mins} mins · {lesson.view_count} views</p>
                        </div>
                        <Badge className={lesson.status === "Published" ? "bg-[#22C55E] text-white text-xs" : "bg-[#6B7280] text-white text-xs"}>
                          {lesson.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "lessons" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""} in this skill</p>
                <Button size="sm" className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add Lesson
                </Button>
              </div>
              {lessonsLoading ? (
                <div className="flex items-center gap-2 py-8 justify-center text-sm text-[#6B7280]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading lessons...
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">No lessons yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, i) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040] group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-[#7B2CBF]">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{lesson.title}</p>
                          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{lesson.duration_mins} mins · {lesson.view_count} views</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={lesson.status === "Published" ? "bg-[#22C55E] text-white text-xs" : "bg-[#6B7280] text-white text-xs"}>
                          {lesson.status}
                        </Badge>
                        <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-lg transition-opacity">
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "learners" && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{skill.learners.toLocaleString()} learners enrolled</p>
              {learnersLoading ? (
                <div className="flex items-center gap-2 py-8 justify-center text-sm text-[#6B7280]">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading learners...
                </div>
              ) : learners.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">No learners enrolled yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {learners.map((learner) => (
                    <div key={learner.id} className="flex items-center gap-4 p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                      <div className="w-9 h-9 rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-semibold">
                          {learner.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] truncate">{learner.full_name}</p>
                          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] shrink-0">{timeAgo(learner.last_login)}</span>
                        </div>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate">{learner.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
