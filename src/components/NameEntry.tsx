import { useState, type FormEvent } from 'react'
import { setStoredName } from '../lib/name'

interface NameEntryProps {
  name: string | null
  onNameChange: (name: string) => void
}

export default function NameEntry({ name, onNameChange }: NameEntryProps) {
  const [editing, setEditing] = useState(name === null)
  const [input, setInput] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed.length < 1 || trimmed.length > 20) return

    setStoredName(trimmed)
    onNameChange(trimmed)
    setEditing(false)
    setInput('')
  }

  if (!editing && name) {
    return (
      <div className="mb-4 flex items-center justify-between text-sm text-gray-700 md:mb-5 md:text-base lg:mb-6 lg:text-lg">
        <span>{name} 님</span>
        <button
          type="button"
          onClick={() => {
            setInput(name)
            setEditing(true)
          }}
          className="text-blue-500 underline"
        >
          이름 변경
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex gap-2 md:mb-5 lg:mb-6">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        maxLength={20}
        placeholder="이름을 입력하세요"
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm md:px-3.5 md:py-2.5 md:text-base lg:px-4 lg:py-3 lg:text-lg"
      />
      <button
        type="submit"
        disabled={input.trim().length === 0}
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 md:px-5 md:py-2.5 md:text-base lg:px-6 lg:py-3 lg:text-lg"
      >
        입장
      </button>
    </form>
  )
}
