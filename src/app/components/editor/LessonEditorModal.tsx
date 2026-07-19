import { useState, useEffect } from 'react'
import { X, BookOpen, FileText, HelpCircle, Loader2, Save } from 'lucide-react'
import { Button } from '../ui/button'
import RichTextEditor from './RichTextEditor'
import QuizBuilder, { type QuizData, type QuizQuestion } from './QuizBuilder'
import ErrorDialog from '../modals/ErrorDialog'
import { adminApi } from '../../api'

interface LessonEditorModalProps {
  open: boolean
  lessonId: string | null
  lessonTitle?: string
  onClose: () => void
  onSaved?: () => void
}

export default function LessonEditorModal({ open, lessonId, lessonTitle, onClose, onSaved }: LessonEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz'>('content')
  const [content, setContent] = useState('')
  const [quiz, setQuiz] = useState<QuizData>({ title: '', questions: [], passing_score: 70 })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasExistingQuiz, setHasExistingQuiz] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load lesson content and quiz when modal opens
  useEffect(() => {
    if (!open || !lessonId) return

    setLoading(true)
    Promise.all([
      adminApi.getLesson(lessonId).catch(() => null),
      adminApi.getLessonQuiz(lessonId).catch(() => null),
    ]).then(([lessonData, quizData]) => {
      if (lessonData) {
        setContent(lessonData.content ?? '')
      }
      if (quizData) {
        setHasExistingQuiz(true)
        setQuiz({
          title: quizData.title ?? '',
          questions: (quizData.questions ?? []).map((q: any) => ({
            id: q.id ?? Math.random().toString(36).substring(2, 10),
            question: q.question ?? '',
            options: (q.options ?? []).map((o: any) => ({
              id: o.id ?? Math.random().toString(36).substring(2, 10),
              text: o.text ?? '',
            })),
            correct_option_id: q.correct_option_id ?? '',
            explanation: q.explanation ?? '',
          })),
          passing_score: quizData.passing_score ?? 70,
        })
      } else {
        setHasExistingQuiz(false)
        setQuiz({ title: '', questions: [], passing_score: 70 })
      }
    }).finally(() => setLoading(false))
  }, [open, lessonId])

  const handleSave = async () => {
    if (!lessonId) return
    setSaving(true)

    try {
      // Save lesson content
      await adminApi.updateLesson(lessonId, { content })

      // Save quiz (create or update)
      if (quiz.questions.length > 0) {
        const quizPayload = {
          title: quiz.title || `${lessonTitle ?? 'Lesson'} Quiz`,
          questions: quiz.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correct_option_id: q.correct_option_id,
            explanation: q.explanation || undefined,
          })),
          passing_score: quiz.passing_score,
        }

        if (hasExistingQuiz) {
          await adminApi.updateLessonQuiz(lessonId, quizPayload)
        } else {
          await adminApi.createLessonQuiz(lessonId, quizPayload)
          setHasExistingQuiz(true)
        }
      } else if (hasExistingQuiz) {
        // User removed all questions — delete the quiz
        await adminApi.deleteLessonQuiz(lessonId)
        setHasExistingQuiz(false)
      }

      onSaved?.()
      onClose()
    } catch (err: any) {
      setErrorMsg(`Failed to save: ${err.message ?? 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <>
    <ErrorDialog open={!!errorMsg} onClose={() => setErrorMsg(null)} message={errorMsg ?? ""} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#160D20] rounded-2xl shadow-2xl w-full max-w-4xl border border-[#ECECEC] dark:border-[#2D2040] animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#7B2CBF]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#111827] dark:text-[#F9FAFB]">
                {lessonTitle ?? 'Lesson Editor'}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Edit content and quiz</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#ECECEC] dark:border-[#2D2040] shrink-0 px-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-[#7B2CBF] text-[#7B2CBF] dark:text-[#C77DFF]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Content
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'quiz'
                ? 'border-[#7B2CBF] text-[#7B2CBF] dark:text-[#C77DFF]'
                : 'border-transparent text-[#6B7280] hover:text-[#111827] dark:hover:text-[#F9FAFB]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Quiz
            {quiz.questions.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#7B2CBF] text-white">
                {quiz.questions.length}
              </span>
            )}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#7B2CBF]" />
              <span className="ml-3 text-sm text-[#6B7280]">Loading lesson data...</span>
            </div>
          ) : activeTab === 'content' ? (
            <div className="space-y-3">
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Write the lesson content below. Use the toolbar to format text, add headings, lists, code blocks, images, and more.
              </p>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Start writing your lesson content..."
                minHeight="350px"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Build a quiz to test learner understanding. Add questions, define answer options, and mark the correct answer.
              </p>
              <QuizBuilder quiz={quiz} onChange={setQuiz} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#ECECEC] dark:border-[#2D2040] shrink-0">
          <div className="text-xs text-[#9CA3AF]">
            {content.length > 10 && <span className="mr-4">Content: ready</span>}
            {quiz.questions.length > 0 && <span>Quiz: {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="border-[#ECECEC] dark:border-[#2D2040] text-[#6B7280]">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#7B2CBF] hover:bg-[#6A24A8] text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Lesson
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
