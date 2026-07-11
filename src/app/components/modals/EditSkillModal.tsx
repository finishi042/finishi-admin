import { useState, useEffect } from "react";
import { X, Lightbulb } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const COLORS = [
  "#7B2CBF", "#C77DFF", "#22C55E", "#F97316",
  "#3B82F6", "#8B5CF6", "#EF4444", "#EC4899",
  "#14B8A6", "#F59E0B",
];

interface Skill {
  name: string;
  description: string;
  color: string;
  learners: number;
  lessons: number;
}

interface EditSkillModalProps {
  open: boolean;
  skill: Skill | null;
  index: number | null;
  onClose: () => void;
  onSave: (index: number, skill: Skill) => void;
}

export default function EditSkillModal({ open, skill, index, onClose, onSave }: EditSkillModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  useEffect(() => {
    if (skill) {
      setName(skill.name);
      setDescription(skill.description);
      setColor(skill.color);
    }
  }, [skill]);

  if (!open || skill === null || index === null) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(index, { ...skill, name: name.trim(), description: description.trim(), color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-md border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECECEC] dark:border-[#2D2040]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: color }}>
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Edit Skill</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Update skill details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Skill Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Product Design"
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1228] dark:text-[#F9FAFB]"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Description</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of what learners will gain..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-[#7B2CBF] dark:ring-offset-[#160D20] scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-3">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#111827] dark:text-[#F9FAFB]">{name || "Skill Name"}</p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">{description || "Description will appear here"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
