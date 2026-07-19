import { useState, useEffect, useMemo } from "react";
import { BookOpen, Plus, Filter, Download, Eye, Edit, Trash2, Sparkles, X, FileText } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import CreateLessonModal from "./modals/CreateLessonModal";
import LessonPreviewModal from "./modals/LessonPreviewModal";
import EditLessonModal from "./modals/EditLessonModal";
import FilterLessonsPanel, { LessonFilters } from "./modals/FilterLessonsPanel";
import ExportDialog from "./modals/ExportDialog";
import ConfirmDeleteDialog from "./modals/ConfirmDeleteDialog";
import LessonEditorModal from "./editor/LessonEditorModal";
import { LessonsSkeleton } from "./LoadingSkeleton";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

interface LessonsViewProps {
  autoOpenModal?: boolean;
  aiMode?: boolean;
  onModalOpened?: () => void;
}

interface Lesson {
  title: string;
  skill: string;
  description: string;
  duration: string;
  created: string;
  status: string;
  views: number;
}

const DEFAULT_FILTERS: LessonFilters = {
  skill: "All Skills",
  status: "All",
  duration: "Any Duration",
  sortBy: "Newest First",
};

function durationMinutes(d: string) {
  const n = parseInt(d);
  return isNaN(n) ? 0 : n;
}

export default function LessonsView({ autoOpenModal, aiMode, onModalOpened }: LessonsViewProps) {
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<{ lesson: Lesson; index: number } | null>(null);
  const [editLesson, setEditLesson] = useState<{ lesson: Lesson; index: number } | null>(null);
  const [editorLesson, setEditorLesson] = useState<{ id: string; title: string } | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<LessonFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<LessonFilters>(DEFAULT_FILTERS);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: apiData, loading, refetch } = useApi(() => adminApi.getLessons());

  const fallback: Lesson[] = [];

  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    if (!apiData) return;
    const mapped: Lesson[] = (apiData as any[]).map((l: any) => ({
      title: l.title,
      skill: l.skill_name ?? l.skill ?? "",
      description: l.description ?? "",
      duration: l.duration_mins ? `${l.duration_mins} mins` : "—",
      created: l.created_at ? new Date(l.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      status: l.status === "published" ? "Published" : "Draft",
      views: l.view_count ?? 0,
      id: l.id,
    }));
    if (mapped.length > 0) setLessons(mapped);
    else setLessons([]);
  }, [apiData]);

  useEffect(() => {
    if (autoOpenModal) {
      setIsAiMode(!!aiMode);
      setCreateLessonOpen(true);
      onModalOpened?.();
    }
  }, [autoOpenModal, aiMode]);

  const handleCreateLesson = async (lesson: { title: string; skill: string; description: string; duration: string; status: string; course_id?: string }) => {
    const duration_mins = parseInt(lesson.duration) || 10;
    try {
      await adminApi.createLesson({ title: lesson.title, skill_name: lesson.skill, description: lesson.description, duration_mins, status: lesson.status.toLowerCase(), course_id: lesson.course_id });
      refetch();
    } catch {
      setLessons(prev => [{ ...lesson, created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), views: 0 }, ...prev]);
    }
  };

  const handleEditSave = async (index: number, updated: Lesson) => {
    const id = (lessons[index] as any).id;
    if (id) {
      try { await adminApi.updateLesson(id, { title: updated.title, skill_name: updated.skill, description: updated.description, duration_mins: parseInt(updated.duration) || 10, status: updated.status.toLowerCase() }); refetch(); return; } catch {}
    }
    setLessons(prev => prev.map((l, i) => i === index ? updated : l));
  };

  const handleDelete = async (index: number) => {
    const id = (lessons[index] as any).id;
    if (!id) {
      setLessons(prev => prev.filter((_, i) => i !== index));
      return;
    }
    setDeleteTarget({ index, title: lessons[index].title });
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = (lessons[deleteTarget.index] as any).id;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await adminApi.deleteLesson(id);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      setDeleteError(err.message ?? 'Failed to delete lesson');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    if (appliedFilters.skill !== "All Skills") {
      result = result.filter(l => l.skill === appliedFilters.skill);
    }
    if (appliedFilters.status !== "All") {
      result = result.filter(l => l.status === appliedFilters.status);
    }
    if (appliedFilters.duration !== "Any Duration") {
      result = result.filter(l => {
        const mins = durationMinutes(l.duration);
        if (appliedFilters.duration === "< 10 mins") return mins < 10;
        if (appliedFilters.duration === "10–15 mins") return mins >= 10 && mins <= 15;
        if (appliedFilters.duration === "15–20 mins") return mins > 15 && mins <= 20;
        if (appliedFilters.duration === "> 20 mins") return mins > 20;
        return true;
      });
    }
    switch (appliedFilters.sortBy) {
      case "Most Views": result.sort((a, b) => b.views - a.views); break;
      case "A–Z": result.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "Z–A": result.sort((a, b) => b.title.localeCompare(a.title)); break;
      case "Oldest First": result.reverse(); break;
    }
    return result;
  }, [lessons, appliedFilters]);

  const isFiltered = JSON.stringify(appliedFilters) !== JSON.stringify(DEFAULT_FILTERS);
  const activeFilterCount = [
    appliedFilters.skill !== "All Skills",
    appliedFilters.status !== "All",
    appliedFilters.duration !== "Any Duration",
    appliedFilters.sortBy !== "Newest First",
  ].filter(Boolean).length;

  const lessonStats = [
    { label: "Total Lessons", value: lessons.length.toString() },
    { label: "Published", value: lessons.filter(l => l.status === "Published").length.toString() },
    { label: "Drafts", value: lessons.filter(l => l.status === "Draft").length.toString() },
    { label: "Total Views", value: lessons.reduce((s, l) => s + l.views, 0) > 1000
        ? `${(lessons.reduce((s, l) => s + l.views, 0) / 1000).toFixed(1)}K`
        : lessons.reduce((s, l) => s + l.views, 0).toString()
    },
  ];

  if (loading) return <LessonsSkeleton />;

  return (
    <div className="space-y-4 md:space-y-6">
      <CreateLessonModal
        open={createLessonOpen}
        onClose={() => setCreateLessonOpen(false)}
        aiMode={isAiMode}
        onSave={handleCreateLesson}
      />
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
        onSave={handleEditSave}
      />
      <FilterLessonsPanel
        open={filterOpen}
        filters={pendingFilters}
        onChange={setPendingFilters}
        onClose={() => { setFilterOpen(false); setPendingFilters(appliedFilters); }}
        onApply={() => { setAppliedFilters(pendingFilters); setFilterOpen(false); }}
        onReset={() => { setPendingFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS); setFilterOpen(false); }}
      />
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        totalLessons={filteredLessons.length}
      />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={confirmDelete}
        title={`Delete "${deleteTarget?.title ?? ''}"?`}
        description="This lesson will be permanently deleted. If it is assigned to a learning path phase, it will be removed from there as well."
        loading={deleteLoading}
        error={deleteError}
      />
      <LessonEditorModal
        open={!!editorLesson}
        lessonId={editorLesson?.id ?? null}
        lessonTitle={editorLesson?.title}
        onClose={() => setEditorLesson(null)}
        onSaved={() => refetch()}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {lessonStats.map((stat, index) => (
          <Card key={index} className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <p className="text-xs md:text-sm text-[#6B7280] dark:text-[#9CA3AF]">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-semibold text-[#111827] dark:text-[#F9FAFB] mt-1 md:mt-2">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">Content Library</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Manage all your lessons and learning content</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setPendingFilters(appliedFilters); setFilterOpen(true); }}
            className={`border-[#ECECEC] dark:border-[#2D2040] relative ${isFiltered ? "border-[#7B2CBF] text-[#7B2CBF] dark:text-[#C77DFF]" : "text-[#6B7280] dark:text-[#9CA3AF]"}`}
          >
            <Filter className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="ml-1.5 bg-[#7B2CBF] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportOpen(true)}
            className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]"
          >
            <Download className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button
            size="sm"
            onClick={() => { setIsAiMode(true); setCreateLessonOpen(true); }}
            variant="outline"
            className="border-[#7B2CBF] text-[#7B2CBF] hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030]"
          >
            <Sparkles className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">AI Generate</span>
            <span className="sm:hidden">AI</span>
          </Button>
          <Button
            size="sm"
            onClick={() => { setIsAiMode(false); setCreateLessonOpen(true); }}
            className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
          >
            <Plus className="w-4 h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Create Lesson</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Active filter pills */}
      {isFiltered && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Active filters:</span>
          {appliedFilters.skill !== "All Skills" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] text-xs font-medium">
              {appliedFilters.skill}
              <button onClick={() => setAppliedFilters(f => ({ ...f, skill: "All Skills" }))}><X className="w-3 h-3" /></button>
            </span>
          )}
          {appliedFilters.status !== "All" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] text-xs font-medium">
              {appliedFilters.status}
              <button onClick={() => setAppliedFilters(f => ({ ...f, status: "All" }))}><X className="w-3 h-3" /></button>
            </span>
          )}
          {appliedFilters.duration !== "Any Duration" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] text-xs font-medium">
              {appliedFilters.duration}
              <button onClick={() => setAppliedFilters(f => ({ ...f, duration: "Any Duration" }))}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={() => setAppliedFilters(DEFAULT_FILTERS)}
            className="text-xs text-[#EF4444] hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Lessons Table */}
      <Card className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
        {filteredLessons.length === 0 ? (
          <div className="py-10 text-center">
            <BookOpen className="w-10 h-10 text-[#C77DFF] mx-auto mb-3" />
            <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">No lessons match your filters</p>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Try adjusting or clearing your filters</p>
            <button onClick={() => setAppliedFilters(DEFAULT_FILTERS)} className="mt-3 text-sm text-[#7B2CBF] hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[#ECECEC] dark:border-[#2D2040]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Lesson Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Skill</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Views</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#6B7280] dark:text-[#9CA3AF]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((lesson, index) => {
                  const originalIndex = lessons.indexOf(lesson);
                  return (
                    <tr key={index} className="border-b border-[#ECECEC] dark:border-[#2D2040] hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228]">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-[#111827] dark:text-[#F9FAFB] text-sm">{lesson.title}</div>
                          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{lesson.description}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF] border-0 text-xs">
                          {lesson.skill}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{lesson.duration}</td>
                      <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{lesson.created}</td>
                      <td className="py-4 px-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">{lesson.views}</td>
                      <td className="py-4 px-4">
                        <Badge className={lesson.status === "Published" ? "bg-[#22C55E] text-white" : "bg-[#6B7280] text-white"}>
                          {lesson.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditorLesson({ id: (lesson as any).id, title: lesson.title })}
                            className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg"
                            title="Edit content & quiz"
                          >
                            <FileText className="w-4 h-4 text-[#7B2CBF] dark:text-[#C77DFF]" />
                          </button>
                          <button
                            onClick={() => setPreviewLesson({ lesson, index: originalIndex })}
                            className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg"
                            title="Preview lesson"
                          >
                            <Eye className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                          </button>
                          <button
                            onClick={() => setEditLesson({ lesson, index: originalIndex })}
                            className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg"
                            title="Edit lesson"
                          >
                            <Edit className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                          </button>
                          <button
                            onClick={() => handleDelete(originalIndex)}
                            className="p-1.5 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-lg"
                            title="Delete lesson"
                          >
                            <Trash2 className="w-4 h-4 text-[#EF4444]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {lessons.length === 0 && (
        <Card className="p-12 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <div className="flex flex-col items-center justify-center text-center">
            <BookOpen className="w-16 h-16 text-[#C77DFF] mb-4" />
            <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB] mb-2">No lessons yet</h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">Create your first lesson to get started.</p>
            <Button onClick={() => setCreateLessonOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Lesson
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
