import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Plus, X, BookOpen, Loader2 } from "lucide-react";
import { adminApi } from "../../api";

interface CreateLearningPathModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (path: { name: string; description: string; skill: string; status: string; courseIds: string[] }) => void;
}

interface AvailableCourse {
  id: string;
  title: string;
  skill_name: string;
  lesson_count: number;
  level: string;
  published: boolean;
}

export default function CreateLearningPathModal({ open, onClose, onSave }: CreateLearningPathModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState("Active");
  const [selectedCourses, setSelectedCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch skills
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  // Fetch available courses
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSkillsLoading(true);
      adminApi.getSkills()
        .then((data: any) => setSkills((Array.isArray(data) ? data : []).map((s: any) => ({ id: s.id, name: s.name }))))
        .catch(() => setSkills([]))
        .finally(() => setSkillsLoading(false));
    }
  }, [open]);

  // Fetch courses when skill changes
  useEffect(() => {
    if (!skill) { setAvailableCourses([]); return; }
    setCoursesLoading(true);
    adminApi.getCourses({ skill })
      .then((data: any) => {
        const courses = (Array.isArray(data) ? data : []).map((c: any) => ({
          id: c.id,
          title: c.title,
          skill_name: c.skill_name ?? "",
          lesson_count: c.lesson_count ?? 0,
          level: c.level ?? "beginner",
          published: c.published ?? false,
        }));
        setAvailableCourses(courses);
      })
      .catch(() => setAvailableCourses([]))
      .finally(() => setCoursesLoading(false));
  }, [skill]);

  const addCourse = (course: AvailableCourse) => {
    if (selectedCourses.find(c => c.id === course.id)) return;
    setSelectedCourses(prev => [...prev, course]);
  };

  const removeCourse = (courseId: string) => {
    setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const unselectedCourses = availableCourses.filter(c => !selectedCourses.find(sc => sc.id === c.id));

  const handleSubmit = async () => {
    if (!name.trim() || !skill) return;
    setLoading(true);
    try {
      onSave?.({ name, description, skill, status, courseIds: selectedCourses.map(c => c.id) });
    } finally {
      setName(""); setDescription(""); setSkill(""); setStatus("Active");
      setSelectedCourses([]);
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-[#111827] dark:text-[#F9FAFB]">Create Learning Path</DialogTitle>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">A learning path is a sequence of courses to master a skill</p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Path Name <span className="text-[#EF4444]">*</span></Label>
            <Input
              placeholder="e.g. Full-Stack Developer Path"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1030] dark:text-[#F9FAFB]"
            />
          </div>

          {/* Description */}
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

          {/* Skill + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Skill <span className="text-[#EF4444]">*</span></Label>
              <select
                value={skill}
                onChange={e => { setSkill(e.target.value); setSelectedCourses([]); }}
                disabled={skillsLoading}
                className="w-full border border-[#ECECEC] dark:border-[#2D2040] rounded-md px-3 py-2 text-sm bg-white dark:bg-[#1A1030] text-[#111827] dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#7B2CBF] disabled:opacity-50"
              >
                <option value="">{skillsLoading ? "Loading..." : "Select skill..."}</option>
                {skills.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#111827] dark:text-[#F9FAFB]">Status</Label>
              <div className="flex gap-2">
                {["Active", "Draft"].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-md text-sm border transition-all ${
                      status === s
                        ? "bg-[#7B2CBF] text-white border-[#7B2CBF]"
                        : "border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className="space-y-3">
            <Label className="text-[#111827] dark:text-[#F9FAFB]">Courses in this Path</Label>

            {!skill && (
              <p className="text-xs text-[#6B7280] italic">Select a skill to see available courses.</p>
            )}

            {/* Selected courses */}
            {selectedCourses.length > 0 && (
              <div className="space-y-2">
                {selectedCourses.map((course, idx) => (
                  <div key={course.id} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#7B2CBF]/20">
                    <span className="text-xs text-[#7B2CBF] font-bold w-5">{idx + 1}</span>
                    <BookOpen className="w-4 h-4 text-[#7B2CBF] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#111827] dark:text-[#F9FAFB] truncate">{course.title}</p>
                      <p className="text-xs text-[#6B7280]">{course.lesson_count} lessons · {course.level}</p>
                    </div>
                    <button onClick={() => removeCourse(course.id)} className="text-[#6B7280] hover:text-[#EF4444] shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add course dropdown */}
            {skill && unselectedCourses.length > 0 && (
              <select
                value=""
                onChange={e => {
                  const course = availableCourses.find(c => c.id === e.target.value);
                  if (course) addCourse(course);
                }}
                className="w-full border border-dashed border-[#ECECEC] dark:border-[#2D2040] rounded-md px-3 py-2 text-xs bg-white dark:bg-[#1A1030] text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#7B2CBF]"
              >
                <option value="">+ Add a course to this path...</option>
                {unselectedCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title} ({c.lesson_count} lessons)</option>
                ))}
              </select>
            )}

            {skill && !coursesLoading && availableCourses.length === 0 && (
              <p className="text-xs text-[#6B7280] italic">No courses found for this skill. Create courses first.</p>
            )}

            {coursesLoading && (
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <Loader2 className="w-3 h-3 animate-spin" /> Loading courses...
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]">
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
