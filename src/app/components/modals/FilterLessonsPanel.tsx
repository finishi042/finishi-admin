import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

export interface LessonFilters {
  skill: string;
  status: string;
  duration: string;
  sortBy: string;
}

interface FilterLessonsPanelProps {
  open: boolean;
  filters: LessonFilters;
  onChange: (filters: LessonFilters) => void;
  onClose: () => void;
  onApply: () => void;
  onReset: () => void;
}

const SKILLS = ["All Skills", "Product Design", "Digital Marketing", "Frontend Development", "AI Prompt Engineering", "Data Analytics", "Content Writing"];
const DURATIONS = ["Any Duration", "< 10 mins", "10–15 mins", "15–20 mins", "> 20 mins"];
const SORT_OPTIONS = ["Newest First", "Oldest First", "Most Views", "A–Z", "Z–A"];

export default function FilterLessonsPanel({ open, filters, onChange, onClose, onApply, onReset }: FilterLessonsPanelProps) {
  if (!open) return null;

  const set = (key: keyof LessonFilters, value: string) => onChange({ ...filters, [key]: value });

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-white dark:bg-[#160D20] shadow-2xl border-l border-[#ECECEC] dark:border-[#2D2040] flex flex-col animate-in slide-in-from-right duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#ECECEC] dark:border-[#2D2040]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#7B2CBF]" />
            <h3 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">Filter Lessons</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors">
            <X className="w-4 h-4 text-[#6B7280]" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Skill */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Skill Category</Label>
            <div className="space-y-1.5">
              {SKILLS.map(s => (
                <label key={s} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] cursor-pointer">
                  <input
                    type="radio"
                    name="skill"
                    checked={filters.skill === s}
                    onChange={() => set("skill", s)}
                    className="accent-[#7B2CBF]"
                  />
                  <span className="text-sm text-[#374151] dark:text-[#D1D5DB]">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Status</Label>
            <div className="flex gap-2">
              {["All", "Published", "Draft"].map(s => (
                <button
                  key={s}
                  onClick={() => set("status", s)}
                  className={`flex-1 py-2 text-sm rounded-lg border-2 transition-colors font-medium ${
                    filters.status === s
                      ? "border-[#7B2CBF] bg-[#F6EEFF] dark:bg-[#1E1030] text-[#7B2CBF] dark:text-[#C77DFF]"
                      : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF] hover:border-[#7B2CBF]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Duration</Label>
            <div className="space-y-1.5">
              {DURATIONS.map(d => (
                <label key={d} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    checked={filters.duration === d}
                    onChange={() => set("duration", d)}
                    className="accent-[#7B2CBF]"
                  />
                  <span className="text-sm text-[#374151] dark:text-[#D1D5DB]">{d}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Sort By</Label>
            <select
              value={filters.sortBy}
              onChange={e => set("sortBy", e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#ECECEC] dark:border-[#2D2040] bg-white dark:bg-[#1A1228] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF]/30"
            >
              {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#ECECEC] dark:border-[#2D2040] flex gap-3">
          <Button variant="outline" onClick={onReset} className="flex-1 border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Reset
          </Button>
          <Button onClick={onApply} className="flex-1 bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  );
}
