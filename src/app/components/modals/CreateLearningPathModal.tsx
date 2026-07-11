import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Plus, X } from "lucide-react";

interface CreateLearningPathModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (path: { name: string; description: string; skill: string; status: string }) => void;
}

const skillOptions = [
  "Product Design",
  "Digital Marketing",
  "Frontend Development",
  "AI Prompt Engineering",
  "Data Analytics",
  "Content Writing",
];

const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

const lessonSuggestions = [
  "Introduction & Overview",
  "Core Fundamentals",
  "Hands-on Practice",
  "Advanced Techniques",
  "Real-world Projects",
  "Assessment & Review",
];

export default function CreateLearningPathModal({ open, onClose, onSave }: CreateLearningPathModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skill, setSkill] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [status, setStatus] = useState("Active");
  const [lessons, setLessons] = useState<string[]>([]);
  const [lessonInput, setLessonInput] = useState("");
  const [loading, setLoading] = useState(false);

  const addLesson = (title: string) => {
    if (title.trim() && !lessons.includes(title.trim())) {
      setLessons(prev => [...prev, title.trim()]);
      setLessonInput("");
    }
  };

  const removeLesson = (idx: number) => setLessons(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!name.trim() || !skill) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    onSave?.({ name, description, skill, status });
    setName(""); setDescription(""); setSkill(""); setLessons([]); setDifficulty("Beginner"); setStatus("Active");
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">Create Learning Path</DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">Design a structured learning journey for your users</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Path Name <span className="text-[#EF4444]">*</span></Label>
            <Input
              placeholder="e.g. Product Design Beginner Path"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Description</Label>
            <Textarea
              placeholder="What will learners achieve from this path?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Skill Category <span className="text-[#EF4444]">*</span></Label>
              <select
                value={skill}
                onChange={e => setSkill(e.target.value)}
                className="w-full border border-[#ECECEC] dark:border-[#2D2040] rounded-md px-3 py-2 text-sm bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
              >
                <option value="">Select skill...</option>
                {skillOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Difficulty</Label>
              <div className="flex gap-2">
                {difficultyLevels.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs transition-all border ${
                      difficulty === d
                        ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                        : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Status</Label>
            <div className="flex gap-3">
              {["Active", "Draft"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                    status === s
                      ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                      : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Lessons</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a lesson title..."
                value={lessonInput}
                onChange={e => setLessonInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addLesson(lessonInput)}
                className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
              />
              <Button onClick={() => addLesson(lessonInput)} size="sm" className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {lessons.length > 0 && (
              <div className="space-y-2 mt-2">
                {lessons.map((lesson, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#ECECEC] dark:border-[#2D2040]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#7B2CBF] dark:text-[#C77DFF] font-medium">{i + 1}</span>
                      <span className="text-sm text-[#111827] dark:text-[#F9FAFB]">{lesson}</span>
                    </div>
                    <button onClick={() => removeLesson(i)} className="text-[#6B7280] hover:text-[#EF4444] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 flex-wrap mt-1">
              {lessonSuggestions.map(s => (
                <button
                  key={s}
                  onClick={() => addLesson(s)}
                  disabled={lessons.includes(s)}
                  className="text-xs px-2 py-1 rounded-full border border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF] hover:text-[#7B2CBF] disabled:opacity-40 transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !skill || loading}
            className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
          >
            {loading ? "Creating..." : "Create Learning Path"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
