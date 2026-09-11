import { useState, type FormEvent } from 'react'

interface QuestionFormProps {
  disabled: boolean
  onSubmit: (text: string) => Promise<void>
}

export default function QuestionForm({ disabled, onSubmit }: QuestionFormProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (disabled || submitting || text.trim().length === 0) return

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(text.trim())
      setText('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '질문 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2 lg:mb-8 lg:gap-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 200))}
        disabled={disabled}
        maxLength={200}
        rows={3}
        placeholder={disabled ? '이름을 먼저 입력해주세요' : '질문을 입력하세요'}
        className="w-full rounded-lg border border-gray-300 p-3 text-sm disabled:bg-gray-100 lg:p-4 lg:text-lg"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 lg:text-sm">{text.length}/200</span>
        <button
          type="submit"
          disabled={disabled || submitting || text.trim().length === 0}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 lg:px-6 lg:py-3 lg:text-lg"
        >
          질문 등록
        </button>
      </div>
      {error && <p className="text-sm text-red-500 lg:text-base">{error}</p>}
    </form>
  )
}
