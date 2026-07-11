import { useState, useEffect } from "react";
import { Map, Plus, Users, BookOpen, TrendingUp, Eye, Edit, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import CreateLearningPathModal from "./modals/CreateLearningPathModal";
import ViewPathModal from "./modals/ViewPathModal";
import EditPathModal from "./modals/EditPathModal";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

interface LearningPathsViewProps {
  autoOpenModal?: boolean;
  onModalOpened?: () => void;
}

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

export default function LearningPathsView({ autoOpenModal, onModalOpened }: LearningPathsViewProps) {
  const [createPathOpen, setCreatePathOpen] = useState(false);
  const [viewPath, setViewPath] = useState<{ path: LearningPath; index: number } | null>(null);
  const [editPath, setEditPath] = useState<{ path: LearningPath; index: number } | null>(null);

  const { data: apiData, refetch } = useApi(() => adminApi.getLearningPaths());

  const fallback: LearningPath[] = [];

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>(fallback);

  useEffect(() => {
    if (!apiData) return;
    const mapped: LearningPath[] = (apiData as any[]).map((p: any) => ({
      name: p.name,
      skill: p.skill_name ?? p.skill ?? "",
      description: p.description ?? "",
      users: p.enrolled_count ?? 0,
      completion: p.completion_rate ?? 0,
      lessons: p.lessons?.[0]?.count ?? p.lesson_count ?? 0,
      status: p.status === "active" ? "Active" : p.status === "draft" ? "Draft" : p.status,
      created: p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
      id: p.id,
    }));
    setLearningPaths(mapped);
  }, [apiData]);

  useEffect(() => {
    if (autoOpenModal) {
      setCreatePathOpen(true);
      onModalOpened?.();
    }
  }, [autoOpenModal]);

  const pathStats = [
    { label: "Total Paths", value: learningPaths.length.toString(), icon: Map },
    { label: "Active Learners", value: learningPaths.reduce((s, p) => s + p.users, 0).toLocaleString(), icon: Users },
    { label: "Avg. Completion", value: `${Math.round(learningPaths.reduce((s, p) => s + p.completion, 0) / learningPaths.length)}%`, icon: TrendingUp },
    { label: "Total Lessons", value: learningPaths.reduce((s, p) => s + p.lessons, 0).toString(), icon: BookOpen },
  ];

  const handleCreatePath = async (path: { name: string; description: string; skill: string; status: string }) => {
    try {
      await adminApi.createLearningPath({ name: path.name, description: path.description, skill_name: path.skill, status: path.status.toLowerCase() });
      refetch();
    } catch {
      setLearningPaths(prev => [{ ...path, users: 0, completion: 0, lessons: 0, created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) }, ...prev]);
    }
  };

  const handleEditSave = async (index: number, updated: LearningPath) => {
    const id = (learningPaths[index] as any).id;
    if (id) {
      try { await adminApi.updateLearningPath(id, { name: updated.name, description: updated.description, skill_name: updated.skill, status: updated.status.toLowerCase() }); refetch(); return; } catch {}
    }
    setLearningPaths(prev => prev.map((p, i) => i === index ? updated : p));
  };

  const handleDelete = async (index: number) => {
    const id = (learningPaths[index] as any).id;
    if (id) { try { await adminApi.deleteLearningPath(id); refetch(); return; } catch {} }
    setLearningPaths(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <CreateLearningPathModal
        open={createPathOpen}
        onClose={() => setCreatePathOpen(false)}
        onSave={handleCreatePath}
      />
      <ViewPathModal
        open={!!viewPath}
        path={viewPath?.path ?? null}
        onClose={() => setViewPath(null)}
      />
      <EditPathModal
        open={!!editPath}
        path={editPath?.path ?? null}
        index={editPath?.index ?? null}
        onClose={() => setEditPath(null)}
        onSave={handleEditSave}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {pathStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
              <div className="flex items-start justify-between">
                <div className="space-y-1 md:space-y-2 flex-1">
                  <p className="text-xs md:text-sm text-[#6B7280] dark:text-[#9CA3AF]">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-semibold text-[#111827] dark:text-[#F9FAFB]">{stat.value}</p>
                </div>
                <div className="p-2 md:p-3 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030]">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#7B2CBF] dark:text-[#C77DFF]" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">All Learning Paths</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Structured learning journeys for your users</p>
        </div>
        <Button onClick={() => setCreatePathOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white shrink-0">
          <Plus className="w-4 h-4 mr-1 md:mr-2" />
          <span className="hidden sm:inline">Create Path</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Paths List */}
      <div className="grid grid-cols-1 gap-4">
        {learningPaths.map((path, index) => (
          <Card key={index} className="p-4 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] hover:shadow-md dark:hover:shadow-[#2D2040]/50 transition-shadow">
            <div className="flex items-start gap-3 md:gap-4">
              {/* Icon */}
              <div className="bg-[#F6EEFF] dark:bg-[#1E1030] p-2.5 md:p-3 rounded-lg shrink-0">
                <Map className="w-5 h-5 md:w-6 md:h-6 text-[#7B2CBF] dark:text-[#C77DFF]" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{path.name}</h3>
                    <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 hidden md:block">{path.description}</p>
                  </div>
                  <Badge className={`${path.status === "Active" ? "bg-[#22C55E]" : "bg-[#6B7280]"} text-white shrink-0`}>
                    {path.status}
                  </Badge>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-3 md:gap-6 mt-2 text-xs md:text-sm text-[#6B7280] dark:text-[#9CA3AF] flex-wrap">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{path.skill}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{path.users} enrolled</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{path.lessons} lessons</span>
                  </div>
                  <span className="hidden md:inline">Created {path.created}</span>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Completion Rate</span>
                    <span className="text-xs font-medium text-[#111827] dark:text-[#F9FAFB]">{path.completion}%</span>
                  </div>
                  <Progress value={path.completion} className="h-1.5" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row items-center gap-1 shrink-0">
                <button
                  onClick={() => setViewPath({ path, index })}
                  className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg"
                  title="View details"
                >
                  <Eye className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                </button>
                <button
                  onClick={() => setEditPath({ path, index })}
                  className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg"
                  title="Edit path"
                >
                  <Edit className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                </button>
                <button onClick={() => handleDelete(index)} className="p-1.5 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-lg" title="Delete path">
                  <Trash2 className="w-4 h-4 text-[#EF4444]" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {learningPaths.length === 0 && (
        <Card className="p-12 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <div className="flex flex-col items-center justify-center text-center">
            <Map className="w-16 h-16 text-[#C77DFF] mb-4" />
            <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB] mb-2">No learning paths yet</h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">Create structured learning journeys for your users.</p>
            <Button onClick={() => setCreatePathOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Path
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
