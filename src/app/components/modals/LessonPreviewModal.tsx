import { X, BookOpen, Eye, Clock, Calendar, Tag, User } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface Lesson {
  title: string;
  skill: string;
  description: string;
  duration: string;
  created: string;
  status: string;
  views: number;
}

const LESSON_CONTENT: Record<string, string[]> = {
  "Introduction to User Research": [
    "User research is the foundation of great product design. In this lesson, you'll learn the essential techniques for understanding your users' needs, behaviors, and motivations.",
    "We'll cover key methods including contextual inquiry, user interviews, and observational studies. You'll practice synthesizing qualitative data into actionable insights.",
    "By the end of this lesson, you'll be able to plan and execute a basic user research study, analyze findings, and present them to stakeholders effectively.",
  ],
  "SEO Best Practices 2026": [
    "Search engine optimization has evolved dramatically. This lesson covers the latest algorithm changes and what they mean for your content strategy in 2026.",
    "Topics include Core Web Vitals optimization, AI-assisted content creation guidelines, entity-based SEO, and the rise of voice and visual search.",
    "Practical exercises include auditing an existing page, implementing structured data markup, and building a keyword cluster strategy.",
  ],
};

const DEFAULT_CONTENT = [
  "This lesson provides a comprehensive introduction to the core concepts and practical applications within the skill area.",
  "Through guided exercises and real-world examples, you'll build a strong foundation that prepares you for more advanced topics in the learning path.",
  "By the end of this lesson, you'll have practical knowledge you can immediately apply in your work.",
];

interface LessonPreviewModalProps {
  open: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onEdit?: () => void;
}

export default function LessonPreviewModal({ open, lesson, onClose, onEdit }: LessonPreviewModalProps) {
  if (!open || !lesson) return null;

  const content = LESSON_CONTENT[lesson.title] || DEFAULT_CONTENT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-xl border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-[#1E1030] to-[#2D1B4E] dark:from-[#0D0618] dark:to-[#160D20] p-6 rounded-t-2xl">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-[#C77DFF]" />
              </div>
              <Badge className={`${lesson.status === "Published" ? "bg-[#22C55E]" : "bg-[#6B7280]"} text-white text-xs`}>
                {lesson.status}
              </Badge>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
          <h2 className="font-semibold text-white text-xl leading-tight">{lesson.title}</h2>
          <p className="text-white/60 text-sm mt-2">{lesson.description}</p>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs text-white/60">
            <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{lesson.skill}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{lesson.duration}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{lesson.created}</span>
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{lesson.views} views</span>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Lesson Outline */}
          <div>
            <h4 className="text-sm font-semibold text-[#374151] dark:text-[#D1D5DB] mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#7B2CBF]" />
              Lesson Overview
            </h4>
            <div className="space-y-3">
              {content.map((para, i) => (
                <p key={i} className="text-sm text-[#6B7280] dark:text-[#9CA3AF] leading-relaxed">{para}</p>
              ))}
            </div>
          </div>

          {/* What you'll learn */}
          <div className="p-4 rounded-xl bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#C77DFF]/20">
            <h4 className="text-sm font-semibold text-[#7B2CBF] dark:text-[#C77DFF] mb-3">What you'll learn</h4>
            <ul className="space-y-2">
              {[
                "Core principles and best practices",
                "Hands-on techniques with real examples",
                "How to apply this knowledge in practice",
                "Common mistakes to avoid",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#374151] dark:text-[#D1D5DB]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7B2CBF] mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Lesson sections */}
          <div>
            <h4 className="text-sm font-semibold text-[#374151] dark:text-[#D1D5DB] mb-3">Lesson Sections</h4>
            <div className="space-y-2">
              {[
                { section: "Introduction", time: "2 min" },
                { section: "Core Concepts", time: "5 min" },
                { section: "Practical Example", time: "4 min" },
                { section: "Quiz & Summary", time: "1 min" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#FAFAFC] dark:bg-[#1A1228] border border-[#ECECEC] dark:border-[#2D2040]">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#7B2CBF] flex items-center justify-center text-white text-xs shrink-0">{i + 1}</span>
                    <span className="text-sm text-[#111827] dark:text-[#F9FAFB]">{item.section}</span>
                  </div>
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280] dark:text-[#9CA3AF]">
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => { onClose(); onEdit(); }} className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white">
              Edit Lesson
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
