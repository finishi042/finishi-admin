import { useState } from 'react'
import { Plus, Trash2, GripVertical, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

export interface QuizQuestion {
  id: string
  question: string
  options: { id: string; text: string }[]
  correct_option_id: string
  explanation?: string
}

export interface QuizData {
  title: string
  questions: QuizQuestion[]
  passing_score: number
}

interface QuizBuilderProps {
  quiz: QuizData
  onChange: (quiz: QuizData) => void
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

export default function QuizBuilder({ quiz, onChange }: QuizBuilderProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(
    quiz.questions.length > 0 ? quiz.questions[0].id : null
  )

  const updateTitle = (title: string) => {
    onChange({ ...quiz, title })
  }

  const updatePassingScore = (score: number) => {
    onChange({ ...quiz, passing_score: Math.min(100, Math.max(0, score)) })
  }

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: generateId(),
      question: '',
      options: [
        { id: generateId(), text: '' },
        { id: generateId(), text: '' },
      ],
      correct_option_id: '',
      explanation: '',
    }
    const updated = { ...quiz, questions: [...quiz.questions, newQ] }
    onChange(updated)
    setExpandedQuestion(newQ.id)
  }

  const removeQuestion = (questionId: string) => {
    onChange({ ...quiz, questions: quiz.questions.filter(q => q.id !== questionId) })
    if (expandedQuestion === questionId) setExpandedQuestion(null)
  }

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    onChange({
      ...quiz,
      questions: quiz.questions.map(q => q.id === questionId ? { ...q, ...updates } : q),
    })
  }

  const addOption = (questionId: string) => {
    const q = quiz.questions.find(q => q.id === questionId)
    if (!q || q.options.length >= 6) return
    updateQuestion(questionId, {
      options: [...q.options, { id: generateId(), text: '' }],
    })
  }

  const removeOption = (questionId: string, optionId: string) => {
    const q = quiz.questions.find(q => q.id === questionId)
    if (!q || q.options.length <= 2) return
    const newOptions = q.options.filter(o => o.id !== optionId)
    const updates: Partial<QuizQuestion> = { options: newOptions }
    if (q.correct_option_id === optionId) updates.correct_option_id = ''
    updateQuestion(questionId, updates)
  }

  const updateOptionText = (questionId: string, optionId: string, text: string) => {
    const q = quiz.questions.find(q => q.id === questionId)
    if (!q) return
    updateQuestion(questionId, {
      options: q.options.map(o => o.id === optionId ? { ...o, text } : o),
    })
  }

  const setCorrectOption = (questionId: string, optionId: string) => {
    updateQuestion(questionId, { correct_option_id: optionId })
  }

  const isValid = quiz.questions.length > 0 && quiz.questions.every(
    q => q.question.trim() && q.options.every(o => o.text.trim()) && q.correct_option_id
  )

  return (
    <div className="space-y-4">
      {/* Quiz header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Quiz Title</Label>
          <Input
            value={quiz.title}
            onChange={e => updateTitle(e.target.value)}
            placeholder="e.g. Module 1 Assessment"
            className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1228] dark:text-[#F9FAFB]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-[#374151] dark:text-[#D1D5DB]">Passing Score (%)</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={quiz.passing_score}
            onChange={e => updatePassingScore(parseInt(e.target.value) || 0)}
            className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1228] dark:text-[#F9FAFB]"
          />
        </div>
      </div>

      {/* Validation hint */}
      {quiz.questions.length > 0 && !isValid && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400">Each question needs text, all options filled, and a correct answer selected.</p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        {quiz.questions.map((question, qIndex) => {
          const isExpanded = expandedQuestion === question.id
          const hasError = !question.question.trim() || !question.correct_option_id || question.options.some(o => !o.text.trim())

          return (
            <div
              key={question.id}
              className={`border rounded-xl overflow-hidden transition-colors ${
                isExpanded
                  ? 'border-[#7B2CBF]/30 dark:border-[#7B2CBF]/20'
                  : hasError
                  ? 'border-amber-300 dark:border-amber-700/30'
                  : 'border-[#ECECEC] dark:border-[#2D2040]'
              }`}
            >
              {/* Question header (collapsed view) */}
              <button
                type="button"
                onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAFAFC] dark:hover:bg-[#1A1228] transition-colors"
              >
                <GripVertical className="w-4 h-4 text-[#D1D5DB] shrink-0" />
                <span className="text-xs font-bold text-[#7B2CBF] w-6 shrink-0">Q{qIndex + 1}</span>
                <span className="text-sm text-[#111827] dark:text-[#F9FAFB] flex-1 truncate">
                  {question.question || <span className="text-[#9CA3AF] italic">Untitled question</span>}
                </span>
                {question.correct_option_id && (
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                )}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeQuestion(question.id) }}
                  className="p-1 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                </button>
              </button>

              {/* Expanded editor */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-[#ECECEC] dark:border-[#2D2040]">
                  {/* Question text */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Question</Label>
                    <Input
                      value={question.question}
                      onChange={e => updateQuestion(question.id, { question: e.target.value })}
                      placeholder="What is the correct answer?"
                      className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1228] dark:text-[#F9FAFB]"
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">
                      Options <span className="text-[#9CA3AF]">(click circle to mark correct)</span>
                    </Label>
                    {question.options.map((option, oIndex) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCorrectOption(question.id, option.id)}
                          className="shrink-0 p-0.5"
                          title="Mark as correct answer"
                        >
                          {question.correct_option_id === option.id ? (
                            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#D1D5DB] dark:text-[#4B5563] hover:text-[#22C55E]" />
                          )}
                        </button>
                        <span className="text-xs font-medium text-[#9CA3AF] w-5 shrink-0">{String.fromCharCode(65 + oIndex)}</span>
                        <Input
                          value={option.text}
                          onChange={e => updateOptionText(question.id, option.id, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          className={`flex-1 h-9 text-sm border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1228] dark:text-[#F9FAFB] ${
                            question.correct_option_id === option.id ? 'border-[#22C55E] dark:border-[#22C55E]/50 bg-[#F0FDF4] dark:bg-[#052e16]/20' : ''
                          }`}
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(question.id, option.id)}
                            className="p-1 hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 rounded-md shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                          </button>
                        )}
                      </div>
                    ))}
                    {question.options.length < 6 && (
                      <button
                        type="button"
                        onClick={() => addOption(question.id)}
                        className="flex items-center gap-1.5 text-xs text-[#7B2CBF] hover:text-[#6A24A8] font-medium mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add option
                      </button>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF]">Explanation (shown after answering)</Label>
                    <Input
                      value={question.explanation ?? ''}
                      onChange={e => updateQuestion(question.id, { explanation: e.target.value })}
                      placeholder="Why is this the correct answer? (optional)"
                      className="border-[#ECECEC] dark:border-[#2D2040] dark:bg-[#1A1228] dark:text-[#F9FAFB] text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add question button */}
      <Button
        type="button"
        variant="outline"
        onClick={addQuestion}
        className="w-full border-dashed border-[#ECECEC] dark:border-[#2D2040] text-[#7B2CBF] hover:bg-[#F6EEFF] dark:hover:bg-[#1E1030] hover:border-[#7B2CBF]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Question
      </Button>

      {/* Summary */}
      {quiz.questions.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#F6EEFF] dark:bg-[#1E1030] text-xs">
          <span className="text-[#7B2CBF] dark:text-[#C77DFF] font-medium">
            {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''} · Passing: {quiz.passing_score}%
          </span>
          {isValid && (
            <span className="flex items-center gap-1 text-[#22C55E]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          )}
        </div>
      )}
    </div>
  )
}
