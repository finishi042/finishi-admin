import { X, Map, Users, BookOpen, TrendingUp, Clock, CheckCircle2, Circle } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface LearningPath {
  name: string;
  skill: string;
  description: string;
  users: number;
  completion: number;
  lessons: number;
  status: string;
  created: string;
}

const PATH_LESSONS: Record<string, { title: string; duration: string; completed: boolean }[]> = {
  "Product Design Beginner Path": [
    { title: "Introduction to User Research", duration: "12 mins", completed: true },
    { title: "Wireframing Basics", duration: "10 mins", completed: true },
    { title: "Design Principles", duration: "8 mins", completed: true },
    { title: "Figma Fundamentals", duration: "15 mins", completed: false },
    { title: "Prototyping Techniques", duration: "14 mins", completed: false },
    { title: "User Testing", duration: "11 mins", completed: false },
  ],
  "Frontend Fundamentals": [
    { title: "HTML Essentials", duration: "10 mins", completed: true },
    { title: "CSS Box Model", duration: "12 mins", completed: true },
    { title: "JavaScript Basics", duration: "20 mins", completed: false },
    { title: "React Introduction", duration: "18 mins", completed: false },
    { title: "State Management", duration: "15 mins", completed: false },
  ],
  "Digital Marketing Essentials": [
    { title: "SEO Fundamentals", duration: "15 mins", completed: true },
    { title: "Content Strategy", duration: "13 mins", completed: false },
    { title: "Social Media Marketing", duration: "11 mins", completed: false },
    { title: "Email Campaigns", duration: "9 mins", completed: false },
  ],
};

const DEFAULT_LESSONS = [
  { title: "Module 1: Introduction", duration: "10 mins", completed: true },
  { title: "Module 2: Core Concepts", duration: "15 mins", completed: true },
  { title: "Module 3: Advanced Topics", duration: "18 mins", completed: false },
  { title: "Module 4: Practical Application", duration: "20 mins", completed: false },
];

interface ViewPathModalProps {
  open: boolean;
  path: LearningPath | null;
  onClose: () => void;
}

export default function ViewPathModal({ open, path, onClose }: ViewPathModalProps) {
  if (!open || !path) return null;

  const lessons = PATH_LESSONS[path.name] || DEFAULT_LESSONS;
  const completedCount = lessons.filter(l => l.completed).length;
  const totalDuration = lessons.reduce((sum, l) => sum + parseInt(l.duration), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-xl border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header Banner */}
        <div className="shrink-0 bg-gradient-to-r from-[#7B2CBF] to-[#C77DFF] p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <Map className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-white text-lg leading-tight">{path.name}</h2>
                <p className="text-white/70 text-sm mt-0.5">{path.skill}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { icon: Users, label: "Enrolled", value: path.users.toLocaleString() },
              { icon: BookOpen, label: "Lessons", value: lessons.length.toString() },
              { icon: Clock, label: "Duration", value: `${totalDuration} min` },
              { icon: TrendingUp, label: "Completion", value: `${path.completion}%` },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <Icon className="w-4 h-4 text-white/70 mx-auto mb-1" />
                  <p className="font-semibold text-white text-sm">{stat.value}</p>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div className="mt-4">
            <Progress value={path.completion} className="h-1.5 bg-white/20 [&>div]:bg-white" />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Description */}
          {path.description && (
            <div>
              <h4 className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-2">About this path</h4>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{path.description}</p>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-3">
            <Badge className={`${path.status === "Active" ? "bg-[#22C55E]" : "bg-[#6B7280]"} text-white`}>
              {path.status}
            </Badge>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Created {path.created}
            </span>
          </div>

          {/* Lesson List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Lessons ({completedCount}/{lessons.length} completed)</h4>
            </div>
            <div className="space-y-2">
              {lessons.map((lesson, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  lesson.completed
                    ? "bg-[#F0FDF4] dark:bg-[#052e16]/30 border-[#BBF7D0] dark:border-[#166534]/40"
                    : "bg-[#FAFAFC] dark:bg-[#1A1228] border-[#ECECEC] dark:border-[#2D2040]"
                }`}>
                  {lesson.completed
                    ? <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
                    : <Circle className="w-5 h-5 text-[#D1D5DB] dark:text-[#4B5563] shrink-0" />
                  }
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${lesson.completed ? "text-[#166534] dark:text-[#4ADE80]" : "text-[#111827] dark:text-[#F9FAFB]"}`}>
                      {i + 1}. {lesson.title}
                    </p>
                  </div>
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] shrink-0">{lesson.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Close
          </Button>
          <Button className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            Edit Path
          </Button>
        </div>
      </div>
    </div>
  );
}
