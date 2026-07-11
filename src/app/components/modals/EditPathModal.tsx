import { useState, useEffect } from "react";
import { X, Map } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

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

const SKILLS = [
  "Product Design", "Digital Marketing", "Frontend Development",
  "AI Prompt Engineering", "Data Analytics", "Content Writing",
];

const STATUSES = ["Active", "Draft", "Archived"];

interface EditPathModalProps {
  open: boolean;
  path: LearningPath | null;
  index: number | null;
  onClose: () => void;
  onSave: (index: number, path: LearningPath) => void;
}

export default function EditPathModal({ open, path, index, onClose, onSave }: EditPathModalProps) {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  useEffect(() => {
    if (path) {
      setName(path.name);
      setSkill(path.skill);
      setDescription(path.description);
      setStatus(path.status);
    }
  }, [path]);

  if (!open || !path || index === null) return null;

  const handleSave = () => {
    if (!name.trim() || !skill) return;
    onSave(index, { ...path, name: name.trim(), skill, description: description.trim(), status });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-md border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECECEC] dark:border-[#2D2040]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] flex items-center justify-center">
              <Map className="w-5 h-5 text-[#7B2CBF] dark:text-[#C77DFF]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Edit Learning Path</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Update path details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Path Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Product Design Beginner Path"
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1228] dark:text-[#F9FAFB]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Skill Category</Label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30"
            >
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Description</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what learners will achieve..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Status</Label>
            <div className="flex gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg border-2 transition-colors font-medium ${
                    status === s
                      ? s === "Active"
                        ? "border-[#22C55E] bg-[#F0FDF4] dark:bg-[#052e16]/30 text-[#166534] dark:text-[#4ADE80]"
                        : s === "Draft"
                        ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                        : "border-[#6B7280] bg-[#F9FAFB] dark:bg-[#1A1228] text-[#6B7280]"
                      : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Stats summary (read-only) */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
            {[
              { label: "Enrolled", value: path.users.toLocaleString() },
              { label: "Lessons", value: path.lessons.toString() },
              { label: "Completion", value: `${path.completion}%` },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-semibold text-[#111827] dark:text-[#F9FAFB] text-sm">{stat.value}</p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !skill} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
