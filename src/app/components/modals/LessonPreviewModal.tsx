import { useState, useEffect } from "react";
import { X, BookOpen, Eye, Clock, Calendar, Tag, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { adminApi } from "../../api";

interface Lesson {
  title: string;
  skill: string;
  description: string;
  duration: string;
  created: string;
  status: string;
  views: number;
}

interface LessonPreviewModalProps {
  open: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onEdit?: () => void;
}

export default function LessonPreviewModal({ open, lesson, onClose, onEdit }: LessonPreviewModalProps) {
  const [content, setContent] = useState<string>("");
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !lesson) {
      setContent("");
      setQuiz(null);
      return;
    }

    const lessonId = (lesson as any).id;
    if (!lessonId) return;

    setLoading(true);
    Promise.all([
      adminApi.getLesson(lessonId).catch(() => null),
      adminApi.getLessonQuiz(lessonId).catch(() => null),
    ]).then(([lessonData, quizData]) => {
      setContent(lessonData?.content ?? "");
      setQuiz(quizData ?? null);
    }).finally(() => setLoading(false));
  }, [open, lesson]);

  if (!open || !lesson) return null;

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
          {lesson.description && (
            <p className="text-white/60 text-sm mt-2">{lesson.description}</p>
          )}

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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-[#7B2CBF]" />
              <span className="ml-2 text-sm text-[#6B7280]">Loading content...</span>
            </div>
          ) : (
            <>
              {/* Lesson Content (rendered HTML) */}
              {content ? (
                <div>
                  <h4 className="text-sm font-semibold text-[#374151] dark:text-[#D1D5DB] mb-3">Lesson Content</h4>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-[#374151] dark:text-[#D1D5DB]"
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-8 h-8 text-[#D1D5DB] mx-auto mb-2" />
                  <p className="text-sm text-[#6B7280]">No content added yet.</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">Use the content editor to add lesson material.</p>
                </div>
              )}

              {/* Quiz Preview */}
              {quiz && quiz.questions && quiz.questions.length > 0 && (
                <div className="p-4 rounded-xl bg-[#F6EEFF] dark:bg-[#1E1030] border border-[#C77DFF]/20">
                  <h4 className="text-sm font-semibold text-[#7B2CBF] dark:text-[#C77DFF] mb-3 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Quiz: {quiz.title || "Assessment"}
                  </h4>
                  <div className="space-y-3">
                    {quiz.questions.map((q: any, i: number) => (
                      <div key={q.id ?? i} className="p-3 rounded-lg bg-white dark:bg-[#160D20] border border-[#ECECEC] dark:border-[#2D2040]">
                        <p className="text-sm font-medium text-[#111827] dark:text-[#F9FAFB] mb-2">
                          {i + 1}. {q.question}
                        </p>
                        <div className="space-y-1 ml-4">
                          {(q.options ?? []).map((opt: any) => (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-2 text-xs py-1 ${
                                opt.id === q.correct_option_id
                                  ? "text-[#22C55E] font-medium"
                                  : "text-[#6B7280] dark:text-[#9CA3AF]"
                              }`}
                            >
                              <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                opt.id === q.correct_option_id
                                  ? "border-[#22C55E] bg-[#22C55E]"
                                  : "border-[#D1D5DB] dark:border-[#4B5563]"
                              }`}>
                                {opt.id === q.correct_option_id && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </span>
                              {opt.text}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <p className="text-xs text-[#6B7280] italic mt-2 ml-4">Explanation: {q.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#7B2CBF] mt-3">
                    {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""} · Passing score: {quiz.passing_score}%
                  </p>
                </div>
              )}
            </>
          )}
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
