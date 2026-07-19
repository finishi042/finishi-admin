import { useState, useEffect } from "react";
import { BookOpen, Plus, Edit, Trash2, Eye, Layers } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ConfirmDeleteDialog from "./modals/ConfirmDeleteDialog";
import ErrorDialog from "./modals/ErrorDialog";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

interface Course {
  id: string;
  title: string;
  skill_name: string;
  description: string;
  level: string;
  lesson_count: number;
  published: boolean;
  created: string;
}

export default function CoursesView() {
  const [createOpen, setCreateOpen] = useState(false);
  const { data: apiData, loading, refetch } = useApi(() => adminApi.getCourses());

  const [courses, setCourses] = useState<Course[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create form state
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSkill, setFormSkill] = useState("");
  const [formLevel, setFormLevel] = useState("beginner");
  const [formSaving, setFormSaving] = useState(false);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!apiData) return;
    const mapped: Course[] = (Array.isArray(apiData) ? apiData : []).map((c: any) => ({
      id: c.id,
      title: c.title,
      skill_name: c.skill_name ?? "",
      description: c.description ?? "",
      level: c.level ?? "beginner",
      lesson_count: c.lesson_count ?? 0,
      published: c.published ?? false,
      created: c.created_at ? new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    }));
    setCourses(mapped);
  }, [apiData]);

  useEffect(() => {
    if (formOpen) {
      adminApi.getSkills()
        .then((data: any) => setSkills((Array.isArray(data) ? data : []).map((s: any) => ({ id: s.id, name: s.name }))))
        .catch(() => setSkills([]));
    }
  }, [formOpen]);

  const handleCreate = async () => {
    if (!formTitle.trim() || !formSkill) return;
    setFormSaving(true);
    try {
      await adminApi.createCourse({ title: formTitle, description: formDescription, skill_name: formSkill, level: formLevel });
      setFormOpen(false);
      setFormTitle(""); setFormDescription(""); setFormSkill(""); setFormLevel("beginner");
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message ?? "Failed to create course");
    } finally {
      setFormSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await adminApi.deleteCourse(deleteTarget.id);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      setDeleteError(err.message ?? "Failed to delete course");
    } finally {
      setDeleteLoading(false);
    }
  };

  const stats = [
    { label: "Total Courses", value: courses.length.toString() },
    { label: "Published", value: courses.filter(c => c.published).length.toString() },
    { label: "Draft", value: courses.filter(c => !c.published).length.toString() },
    { label: "Total Lessons", value: courses.reduce((s, c) => s + c.lesson_count, 0).toString() },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-4 border border-[#ECECEC] dark:border-[#2D2040] animate-pulse">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={confirmDelete}
        title={`Delete "${deleteTarget?.title ?? ''}"?`}
        description="This course will be permanently deleted. Lessons in this course will not be deleted but will become unassigned."
        loading={deleteLoading}
        error={deleteError}
      />
      <ErrorDialog open={!!errorMsg} onClose={() => setErrorMsg(null)} message={errorMsg ?? ""} />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">Courses</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Manage course modules and their lessons</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{stat.label}</p>
            <p className="text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB] mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Course List */}
      {courses.length === 0 ? (
        <Card className="p-12 border border-[#ECECEC] dark:border-[#2D2040] text-center">
          <Layers className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
          <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-1">No courses yet</p>
          <p className="text-sm text-[#9CA3AF] mb-4">Create your first course to organize lessons.</p>
          <Button onClick={() => setFormOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            <Plus className="w-4 h-4 mr-2" /> Create Course
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course.id} className="p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#F6EEFF] dark:bg-[#1E1030] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#7B2CBF]" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg">
                    <Edit className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button onClick={() => setDeleteTarget({ id: course.id, title: course.title })} className="p-1.5 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-lg">
                    <Trash2 className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>

              <h3 className="font-medium text-[#111827] dark:text-[#F9FAFB] mb-1 truncate">{course.title}</h3>
              {course.description && (
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-3 line-clamp-2">{course.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> {course.lesson_count} lessons
                </span>
                <Badge className={`text-[10px] ${course.published ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#6B7280]/10 text-[#6B7280]"}`}>
                  {course.published ? "Published" : "Draft"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9CA3AF]">{course.skill_name}</span>
                <Badge className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] text-[10px] capitalize">{course.level}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Dialog (simple inline) */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-md border border-[#ECECEC] dark:border-[#2D2040] p-6 space-y-4">
            <h2 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB]">Create Course</h2>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Title *</label>
              <input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder="e.g. React Fundamentals"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Skill *</label>
              <select
                value={formSkill}
                onChange={e => setFormSkill(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30"
              >
                <option value="">Select skill...</option>
                {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Description</label>
              <textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="What does this course cover?"
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Level</label>
              <div className="flex gap-2">
                {["beginner", "intermediate", "advanced"].map(l => (
                  <button
                    key={l}
                    onClick={() => setFormLevel(l)}
                    className={`flex-1 py-2 text-sm rounded-lg border capitalize transition-all ${
                      formLevel === l
                        ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                        : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]">
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!formTitle.trim() || !formSkill || formSaving}
                className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
              >
                {formSaving ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
