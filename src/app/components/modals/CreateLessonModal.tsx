import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Sparkles, BookOpen, Loader2 } from "lucide-react";

interface CreateLessonModalProps {
  open: boolean;
  onClose: () => void;
  aiMode?: boolean;
  onSave?: (lesson: { title: string; skill: string; description: string; duration: string; status: string }) => void;
}

const skillOptions = [
  "Product Design",
  "Digital Marketing",
  "Frontend Development",
  "AI Prompt Engineering",
  "Data Analytics",
  "Content Writing",
];

const aiTemplates = [
  { label: "Beginner Introduction", prompt: "Create a beginner-friendly introduction lesson" },
  { label: "Case Study Analysis", prompt: "Design a case study analysis lesson" },
  { label: "Practical Workshop", prompt: "Build a hands-on practical workshop lesson" },
  { label: "Concept Deep Dive", prompt: "Create an in-depth concept exploration lesson" },
];

export default function CreateLessonModal({ open, onClose, aiMode = false, onSave }: CreateLessonModalProps) {
  const [mode, setMode] = useState<"manual" | "ai">(aiMode ? "ai" : "manual");
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("10");
  const [status, setStatus] = useState("Draft");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!aiPrompt.trim() || !skill) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2000));
    setTitle(`${skill}: ${aiPrompt.split(" ").slice(0, 5).join(" ")}...`);
    setDescription(`An AI-generated lesson on ${aiPrompt} within the ${skill} skill category. This lesson covers the key concepts, practical examples, and hands-on exercises to help learners master ${aiPrompt}.`);
    setDuration("14");
    setGenerated(true);
    setGenerating(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !skill) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    onSave?.({ title, skill, description, duration: `${duration} mins`, status });
    setTitle(""); setSkill(""); setDescription(""); setDuration("10"); setStatus("Draft");
    setAiPrompt(""); setGenerated(false); setMode(aiMode ? "ai" : "manual");
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">
            {mode === "ai" ? "Generate AI Lesson" : "Create Lesson"}
          </DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {mode === "ai" ? "Use AI to generate lesson content automatically" : "Build a lesson manually"}
          </p>
        </DialogHeader>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-[#F6EEFF] dark:bg-[#1E1030] rounded-lg">
          <button
            onClick={() => { setMode("manual"); setGenerated(false); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-all ${
              mode === "manual"
                ? "bg-white dark:bg-[#160D20] text-[#7B2CBF] shadow-sm"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7B2CBF]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Manual
          </button>
          <button
            onClick={() => setMode("ai")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm transition-all ${
              mode === "ai"
                ? "bg-white dark:bg-[#160D20] text-[#7B2CBF] shadow-sm"
                : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#7B2CBF]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
        </div>

        <div className="space-y-4 py-1">
          {/* Skill selector always visible */}
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Skill Category <span className="text-[#EF4444]">*</span></Label>
            <select
              value={skill}
              onChange={e => setSkill(e.target.value)}
              className="w-full border border-[#ECECEC] dark:border-[#2D2040] rounded-md px-3 py-2 text-sm bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]"
            >
              <option value="">Select skill category...</option>
              {skillOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {mode === "ai" && !generated && (
            <>
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">What should this lesson cover?</Label>
                <Textarea
                  placeholder="e.g. How to conduct effective user interviews and synthesize insights..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  rows={3}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Quick templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  {aiTemplates.map(t => (
                    <button
                      key={t.label}
                      onClick={() => setAiPrompt(t.prompt)}
                      className="text-left px-3 py-2 rounded-lg border border-[#ECECEC] dark:border-[#2D2040] text-sm text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF] hover:text-[#7B2CBF] transition-all"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={!aiPrompt.trim() || !skill || generating}
                className="w-full bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating lesson...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Lesson
                  </>
                )}
              </Button>
            </>
          )}

          {(mode === "manual" || generated) && (
            <>
              {generated && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#7B2CBF]/20">
                  <Sparkles className="w-4 h-4 text-[#7B2CBF]" />
                  <span className="text-sm text-[#7B2CBF]">Lesson generated! Review and edit below.</span>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Lesson Title <span className="text-[#EF4444]">*</span></Label>
                <Input
                  placeholder="e.g. Introduction to User Research"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#111827] dark:text-[#F9FAFB]">Content / Description</Label>
                <Textarea
                  placeholder="Lesson content, learning objectives, key topics..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Duration (mins)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="120"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#111827] dark:text-[#F9FAFB]">Status</Label>
                  <div className="flex gap-2">
                    {["Draft", "Published"].map(s => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`flex-1 py-2 rounded-md text-sm border transition-all ${
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
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Cancel
          </Button>
          {(mode === "manual" || generated) && (
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !skill || saving}
              className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
            >
              {saving ? "Saving..." : "Save Lesson"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
