import { useState, useEffect } from "react";
import { Plus, Lightbulb, Users, BookOpen, Edit, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import AddSkillModal from "./modals/AddSkillModal";
import EditSkillModal from "./modals/EditSkillModal";
import ManageSkillModal from "./modals/ManageSkillModal";
import ConfirmDeleteDialog from "./modals/ConfirmDeleteDialog";
import { SkillsSkeleton } from "./LoadingSkeleton";
import { useApi } from "../hooks/useApi";
import { adminApi } from "../api";

interface SkillsViewProps {
  autoOpenModal?: boolean;
  onModalOpened?: () => void;
}

interface Skill {
  name: string;
  description: string;
  color: string;
  learners: number;
  lessons: number;
}

export default function SkillsView({ autoOpenModal, onModalOpened }: SkillsViewProps) {
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<{ skill: Skill; index: number } | null>(null);
  const [manageSkill, setManageSkill] = useState<Skill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ index: number; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: apiData, loading, refetch } = useApi(() => adminApi.getSkills());

  const fallback: Skill[] = [];

  const apiSkills: Skill[] = (apiData ?? []).map((s: any) => ({
    name: s.name,
    description: s.description ?? "",
    learners: s.learner_count ?? 0,
    lessons: s.lesson_count ?? 0,
    color: s.color ?? "#7B2CBF",
    id: s.id,
  }));

  const [skills, setSkills] = useState<Skill[]>(fallback);

  useEffect(() => { setSkills(apiSkills.length > 0 ? apiSkills : []); }, [apiData]);

  useEffect(() => {
    if (autoOpenModal) {
      setAddSkillOpen(true);
      onModalOpened?.();
    }
  }, [autoOpenModal]);

  const handleAddSkill = async (skill: { name: string; description: string; color: string }) => {
    try {
      await adminApi.createSkill(skill);
      refetch();
    } catch {
      setSkills(prev => [...prev, { ...skill, learners: 0, lessons: 0 }]);
    }
  };

  const handleEditSave = async (index: number, updated: Skill) => {
    const id = (skills[index] as any).id;
    if (id) {
      try { await adminApi.updateSkill(id, { name: updated.name, description: updated.description, color: updated.color }); refetch(); return; } catch {}
    }
    setSkills(prev => prev.map((s, i) => i === index ? updated : s));
  };

  const handleDelete = async (index: number) => {
    const id = (skills[index] as any).id;
    if (!id) {
      setSkills(prev => prev.filter((_, i) => i !== index));
      return;
    }
    setDeleteTarget({ index, name: skills[index].name });
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = (skills[deleteTarget.index] as any).id;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await adminApi.deleteSkill(id);
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      setDeleteError(err.message ?? 'Failed to delete skill');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <SkillsSkeleton />;

  return (
    <div className="space-y-4 md:space-y-6">
      <AddSkillModal
        open={addSkillOpen}
        onClose={() => setAddSkillOpen(false)}
        onSave={handleAddSkill}
      />
      <EditSkillModal
        open={!!editSkill}
        skill={editSkill?.skill ?? null}
        index={editSkill?.index ?? null}
        onClose={() => setEditSkill(null)}
        onSave={handleEditSave}
      />
      <ManageSkillModal
        open={!!manageSkill}
        skill={manageSkill}
        onClose={() => setManageSkill(null)}
      />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={confirmDelete}
        title={`Delete "${deleteTarget?.name ?? ''}"?`}
        description="This skill will be permanently deleted. Lessons associated with this skill will not be removed but will lose their skill reference."
        loading={deleteLoading}
        error={deleteError}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-xl text-[#111827] dark:text-[#F9FAFB]">Skill Categories</h2>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">Manage learning categories and topics</p>
        </div>
        <Button onClick={() => setAddSkillOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Create Skill</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { label: "Total Skills", value: skills.length.toString() },
          { label: "Total Learners", value: skills.reduce((s, sk) => s + sk.learners, 0).toLocaleString() },
          { label: "Total Lessons", value: skills.reduce((s, sk) => s + sk.lessons, 0).toString() },
        ].map((stat, i) => (
          <Card key={i} className="p-3 md:p-5 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{stat.label}</p>
            <p className="text-xl md:text-2xl font-semibold text-[#111827] dark:text-[#F9FAFB] mt-1">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {skills.map((skill, index) => (
          <Card key={index} className="p-5 md:p-6 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20] hover:shadow-md dark:hover:shadow-[#2D2040]/50 transition-shadow group">
            <div className="space-y-4">
              {/* Icon */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: skill.color }}>
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditSkill({ skill, index })}
                    className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg"
                    title="Edit skill"
                  >
                    <Edit className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  </button>
                  <button onClick={() => handleDelete(index)} className="p-1.5 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-lg" title="Delete skill">
                    <Trash2 className="w-4 h-4 text-[#EF4444]" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">{skill.name}</h3>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">{skill.description}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 pt-3 border-t border-[#ECECEC] dark:border-[#2D2040]">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{skill.learners.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                  <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{skill.lessons} lessons</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditSkill({ skill, index })}
                  className="flex-1 border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF] hover:text-[#7B2CBF]"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setManageSkill(skill)}
                  className="flex-1 border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF] hover:text-[#7B2CBF]"
                >
                  Manage
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {skills.length === 0 && (
        <Card className="p-12 border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#160D20]">
          <div className="flex flex-col items-center justify-center text-center">
            <Lightbulb className="w-16 h-16 text-[#C77DFF] mb-4" />
            <h3 className="font-semibold text-lg text-[#111827] dark:text-[#F9FAFB] mb-2">Create your first skill category</h3>
            <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-4">Start organizing your learning content by skill areas.</p>
            <Button onClick={() => setAddSkillOpen(true)} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Skill
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
