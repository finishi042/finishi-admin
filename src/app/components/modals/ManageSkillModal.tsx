import { useState } from "react";
import { X, Lightbulb, Users, BookOpen, TrendingUp, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface Skill {
  name: string;
  description: string;
  color: string;
  learners: number;
  lessons: number;
}

const SKILL_LESSONS: Record<string, { title: string; duration: string; views: number; status: string }[]> = {
  "Product Design": [
    { title: "Introduction to User Research", duration: "12 mins", views: 342, status: "Published" },
    { title: "Wireframing in Figma", duration: "10 mins", views: 425, status: "Published" },
    { title: "Design Principles", duration: "8 mins", views: 189, status: "Published" },
    { title: "Prototyping Basics", duration: "14 mins", views: 276, status: "Draft" },
  ],
  "Digital Marketing": [
    { title: "SEO Best Practices 2026", duration: "15 mins", views: 286, status: "Published" },
    { title: "Content Marketing Strategy", duration: "13 mins", views: 0, status: "Draft" },
    { title: "Social Media Fundamentals", duration: "11 mins", views: 198, status: "Published" },
  ],
  "Frontend Development": [
    { title: "React Hooks Deep Dive", duration: "18 mins", views: 0, status: "Draft" },
    { title: "CSS Grid Mastery", duration: "16 mins", views: 312, status: "Published" },
    { title: "TypeScript Basics", duration: "20 mins", views: 445, status: "Published" },
  ],
  "AI Prompt Engineering": [
    { title: "Advanced Prompt Techniques", duration: "14 mins", views: 198, status: "Published" },
    { title: "Chain of Thought Prompting", duration: "12 mins", views: 134, status: "Published" },
  ],
};

const DEFAULT_LESSONS = [
  { title: "Getting Started", duration: "10 mins", views: 120, status: "Published" },
  { title: "Core Concepts", duration: "15 mins", views: 98, status: "Published" },
];

interface ManageSkillModalProps {
  open: boolean;
  skill: Skill | null;
  onClose: () => void;
}

export default function ManageSkillModal({ open, skill, onClose }: ManageSkillModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "lessons" | "learners">("overview");

  if (!open || !skill) return null;

  const lessons = SKILL_LESSONS[skill.name] || DEFAULT_LESSONS;
  const publishedLessons = lessons.filter(l => l.status === "Published");
  const totalViews = lessons.reduce((s, l) => s + l.views, 0);
  const completionRate = Math.floor(60 + Math.random() * 30);

  const recentLearners = [
    { name: "Adebayo Adeyemi", progress: 78, lastActive: "2 min ago" },
    { name: "Sarah Johnson", progress: 55, lastActive: "1 hr ago" },
    { name: "Michael Chen", progress: 92, lastActive: "3 hrs ago" },
    { name: "Aisha Bello", progress: 34, lastActive: "Yesterday" },
    { name: "David Kim", progress: 67, lastActive: "2 days ago" },
  ];

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
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{skill.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Users, label: "Total Learners", value: skill.learners.toLocaleString(), color: "text-[#7B2CBF]" },
                  { icon: BookOpen, label: "Lessons", value: skill.lessons.toString(), color: "text-[#C77DFF]" },
                  { icon: TrendingUp, label: "Completion", value: `${completionRate}%`, color: "text-[#22C55E]" },
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
                  <span className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">Average Completion Rate</span>
                  <span className="text-sm font-semibold text-[#7B2CBF]">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
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
                <div className="space-y-2">
                  {lessons.slice(0, 3).map((lesson, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                      <div>
                        <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{lesson.title}</p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{lesson.duration} · {lesson.views} views</p>
                      </div>
                      <Badge className={lesson.status === "Published" ? "bg-[#22C55E] text-white text-xs" : "bg-[#6B7280] text-white text-xs"}>
                        {lesson.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "lessons" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{lessons.length} lessons in this skill</p>
                <Button size="sm" className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add Lesson
                </Button>
              </div>
              <div className="space-y-2">
                {lessons.map((lesson, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040] group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-[#7B2CBF]">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{lesson.title}</p>
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{lesson.duration} · {lesson.views} views</p>
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
            </div>
          )}

          {activeTab === "learners" && (
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{skill.learners.toLocaleString()} learners enrolled</p>
              <div className="space-y-3">
                {recentLearners.map((learner, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                    <div className="w-9 h-9 rounded-full bg-[#7B2CBF] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-semibold">{learner.name.split(" ").map(n => n[0]).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB]">{learner.name}</p>
                        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{learner.lastActive}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[#F6EEFF] dark:bg-[#1E1030] rounded-full overflow-hidden">
                          <div className="h-full bg-[#7B2CBF] rounded-full" style={{ width: `${learner.progress}%` }} />
                        </div>
                        <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] shrink-0">{learner.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Close
          </Button>
          <Button className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
