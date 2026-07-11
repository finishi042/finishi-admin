import { useState, useEffect } from "react";
import { X, BookOpen } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Lesson {
  title: string;
  skill: string;
  description: string;
  duration: string;
  created: string;
  status: string;
  views: number;
}

const SKILLS = [
  "Product Design", "Digital Marketing", "Frontend Development",
  "AI Prompt Engineering", "Data Analytics", "Content Writing",
];

const DURATIONS = ["5 mins", "8 mins", "10 mins", "12 mins", "14 mins", "15 mins", "18 mins", "20 mins", "25 mins", "30 mins"];

interface EditLessonModalProps {
  open: boolean;
  lesson: Lesson | null;
  index: number | null;
  onClose: () => void;
  onSave: (index: number, lesson: Lesson) => void;
}

export default function EditLessonModal({ open, lesson, index, onClose, onSave }: EditLessonModalProps) {
  const [title, setTitle] = useState("");
  const [skill, setSkill] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("10 mins");
  const [status, setStatus] = useState("Draft");

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setSkill(lesson.skill);
      setDescription(lesson.description);
      setDuration(lesson.duration);
      setStatus(lesson.status);
    }
  }, [lesson]);

  if (!open || !lesson || index === null) return null;

  const handleSave = () => {
    if (!title.trim() || !skill) return;
    onSave(index, { ...lesson, title: title.trim(), skill, description: description.trim(), duration, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-md border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#7B2CBF] dark:text-[#C77DFF]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Edit Lesson</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Update lesson details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Lesson Title</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Introduction to User Research"
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
              placeholder="Brief description of lesson content..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Duration</Label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    duration === d
                      ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                      : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Status</Label>
            <div className="flex gap-2">
              {["Draft", "Published"].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 py-2 px-3 text-sm rounded-lg border-2 transition-colors font-medium ${
                    status === s
                      ? s === "Published"
                        ? "border-[#22C55E] bg-[#F0FDF4] dark:bg-[#052e16]/30 text-[#166534] dark:text-[#4ADE80]"
                        : "border-[#6B7280] bg-[#F9FAFB] dark:bg-[#1A1228] text-[#6B7280]"
                      : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Read-only stats */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
            <div className="text-center">
              <p className="font-semibold text-[#111827] dark:text-[#F9FAFB] text-sm">{lesson.views}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Total Views</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-[#111827] dark:text-[#F9FAFB] text-sm">{lesson.created}</p>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Created</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || !skill} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
