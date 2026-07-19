import { useState, useEffect } from "react";
import { X, Map, Users, BookOpen, TrendingUp, Clock, Loader2, Layers } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { adminApi } from "../../api";

interface LearningPath {
  id?: string;
  name: string;
  skill: string;
  description: string;
  users: number;
  completion: number;
  lessons: number;
  status: string;
  created: string;
}

interface PathCourse {
  id: string;
  course_id: string;
  order_index: number;
  course: {
    id: string;
    title: string;
    description: string;
    skill_name: string;
    level: string;
    published: boolean;
    lesson_count: number;
    duration_minutes: number | null;
  } | null;
}

interface ViewPathModalProps {
  open: boolean;
  path: LearningPath | null;
  onClose: () => void;
}

export default function ViewPathModal({ open, path, onClose }: ViewPathModalProps) {
  const [courses, setCourses] = useState<PathCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !path) {
      setCourses([]);
      return;
    }

    const pathId = (path as any).id;
    if (!pathId) return;

    setLoading(true);
    setError(null);

    adminApi.getLearningPath(pathId)
      .then((data: any) => {
        if (data?.courses) {
          setCourses(data.courses);
        } else {
          setCourses([]);
        }
      })
      .catch((err: any) => {
        setError(err.message ?? "Failed to load path details");
        setCourses([]);
      })
      .finally(() => setLoading(false));
  }, [open, path]);

  if (!open || !path) return null;

  const totalCourses = courses.length;
  const totalLessons = courses.reduce((sum, pc) => sum + (pc.course?.lesson_count ?? 0), 0);

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

          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { icon: Users, label: "Enrolled", value: path.users.toLocaleString() },
              { icon: Layers, label: "Courses", value: totalCourses.toString() },
              { icon: BookOpen, label: "Lessons", value: totalLessons.toString() },
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

          <div className="mt-4">
            <Progress value={path.completion} className="h-1.5 bg-white/20 [&>div]:bg-white" />
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {path.description && (
            <div>
              <h4 className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB] mb-2">About this path</h4>
              <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{path.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Badge className={`${path.status === "Active" ? "bg-[#22C55E]" : "bg-[#6B7280]"} text-white`}>
              {path.status}
            </Badge>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Created {path.created}
            </span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-[#7B2CBF]" />
              <span className="ml-2 text-sm text-[#6B7280]">Loading courses...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Courses */}
          {!loading && !error && courses.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Courses ({totalCourses})</h4>
              {courses.map((pc, idx) => (
                <div key={pc.id} className="p-4 rounded-xl border border-[#ECECEC] dark:border-[#2D2040] bg-[#FAFAFC] dark:bg-[#1A1228]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#7B2CBF] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] truncate">
                        {pc.course?.title ?? "Unknown course"}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-[#6B7280]">{pc.course?.lesson_count ?? 0} lessons</span>
                        <Badge className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] text-[10px] capitalize">
                          {pc.course?.level ?? "—"}
                        </Badge>
                        <Badge className={`text-[10px] ${pc.course?.published ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#6B7280]/10 text-[#6B7280]"}`}>
                          {pc.course?.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {pc.course?.description && (
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-2 ml-11 line-clamp-2">{pc.course.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-6">
              <Layers className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
              <p className="text-sm text-[#6B7280]">No courses assigned to this path yet.</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Edit this path to add courses.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
