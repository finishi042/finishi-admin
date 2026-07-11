import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface AddSkillModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (skill: { name: string; description: string; color: string }) => void;
}

const colorOptions = [
  { label: "Purple", value: "bg-[#7B2CBF]", hex: "#7B2CBF" },
  { label: "Violet", value: "bg-[#C77DFF]", hex: "#C77DFF" },
  { label: "Green", value: "bg-[#22C55E]", hex: "#22C55E" },
  { label: "Orange", value: "bg-[#F97316]", hex: "#F97316" },
  { label: "Blue", value: "bg-[#3B82F6]", hex: "#3B82F6" },
  { label: "Indigo", value: "bg-[#8B5CF6]", hex: "#8B5CF6" },
  { label: "Pink", value: "bg-[#EC4899]", hex: "#EC4899" },
  { label: "Teal", value: "bg-[#14B8A6]", hex: "#14B8A6" },
];

export default function AddSkillModal({ open, onClose, onSave }: AddSkillModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].hex);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    onSave?.({ name, description, color: selectedColor });
    setName("");
    setDescription("");
    setSelectedColor(colorOptions[0].hex);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">Add New Skill</DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Create a new skill category to organize learning content</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="skill-name" className="text-[#111827] dark:text-[#F9FAFB]">Skill Name <span className="text-[#EF4444]">*</span></Label>
            <Input
              id="skill-name"
              placeholder="e.g. Product Design"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] focus:ring-[#7B2CBF]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill-description" className="text-[#111827] dark:text-[#F9FAFB]">Description</Label>
            <Textarea
              id="skill-description"
              placeholder="Briefly describe what learners will gain from this skill..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Icon Color</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map(c => (
                <button
                  key={c.hex}
                  title={c.label}
                  onClick={() => setSelectedColor(c.hex)}
                  className={`w-8 h-8 rounded-lg transition-all ${selectedColor === c.hex ? "ring-2 ring-offset-2 ring-[#7B2CBF] scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#ECECEC] dark:border-[#2D2040]">
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedColor }}>
                <span className="text-white text-lg">⚡</span>
              </div>
              <div>
                <p className="font-medium text-[#111827] dark:text-[#F9FAFB]">{name || "Skill Name"}</p>
                <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{description || "Skill description..."}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
          >
            {loading ? "Creating..." : "Create Skill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
