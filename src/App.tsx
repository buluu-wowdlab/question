import { useEffect, useMemo, useState } from 'react'
import {
  fetchTodayQuestions,
  insertQuestion,
  voteQuestion,
  sortByVotes,
  sortChronological,
  subscribeToTodayQuestions,
  type Question,
} from './lib/questions'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { getStoredName } from './lib/name'
import { getVotedIds, addVotedId, removeVotedId } from './lib/votes'
import { DISPLAY_PIN } from './lib/displayMode'
import NameEntry from './components/NameEntry'
import QuestionForm from './components/QuestionForm'
import QuestionList from './components/QuestionList'

export default function App() {
  const [displayMode, setDisplayMode] = useState(false)
  const [name, setName] = useState<string | null>(() => getStoredName())
  const [questions, setQuestions] = useState<Question[]>([])
  const [votedIds, setVotedIds] = useState<Set<number>>(() => new Set(getVotedIds()))
  const [votingIds, setVotingIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function loadQuestions() {
    fetchTodayQuestions()
      .then(setQuestions)
      .catch((e: Error) =>
        setError(e.message || '질문을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'),
      )
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadQuestions()

    if (!isSupabaseConfigured) return

    const channel = subscribeToTodayQuestions(
      (inserted) => {
        setQuestions((prev) => (prev.some((q) => q.id === inserted.id) ? prev : [...prev, inserted]))
      },
      (updated) => {
        setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
      },
    )

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') loadQuestions()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      channel.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function handleAddQuestion(text: string) {
    if (!name) return
    const newQuestion = await insertQuestion(name, text)
    setQuestions((prev) =>
      prev.some((q) => q.id === newQuestion.id) ? prev : [...prev, newQuestion],
    )
  }

  async function handleVote(id: number) {
    if (displayMode || votingIds.has(id)) return

    const alreadyVoted = votedIds.has(id)
    const delta: 1 | -1 = alreadyVoted ? -1 : 1

    setVotingIds((prev) => new Set(prev).add(id))
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, voteCount: Math.max(q.voteCount + delta, 0) } : q)),
    )
    setVotedIds((prev) => {
      const next = new Set(prev)
      if (alreadyVoted) next.delete(id)
      else next.add(id)
      return next
    })
    if (alreadyVoted) removeVotedId(id)
    else addVotedId(id)

    try {
      const confirmedCount = await voteQuestion(id, delta)
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, voteCount: confirmedCount } : q)),
      )
    } catch {
      // 실패 시 낙관적 업데이트 롤백
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, voteCount: Math.max(q.voteCount - delta, 0) } : q)),
      )
      setVotedIds((prev) => {
        const next = new Set(prev)
        if (alreadyVoted) next.add(id)
        else next.delete(id)
        return next
      })
      if (alreadyVoted) addVotedId(id)
      else removeVotedId(id)
      setError('공감 처리에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setVotingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  function handleToggleDisplayMode() {
    if (displayMode) {
      setDisplayMode(false)
      return
    }
    const input = window.prompt('교수님 확인용 PIN을 입력하세요')
    if (input === null) return
    if (input === DISPLAY_PIN) {
      setDisplayMode(true)
    } else {
      window.alert('PIN이 올바르지 않습니다.')
    }
  }

  // 학생 화면: 공감 수를 숨기므로 등록 순서 유지. 교수님 화면(질문만 보기): 공감 수 공개 + 공감순 정렬.
  const visibleQuestions = useMemo(
    () => (displayMode ? sortByVotes(questions) : sortChronological(questions)),
    [questions, displayMode],
  )

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-gray-50 px-4 py-6 lg:max-w-3xl lg:px-10 lg:py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 lg:mb-6">
        <h1 className="text-lg font-bold text-gray-900 lg:text-3xl">Question Vote</h1>
        <button
          type="button"
          onClick={handleToggleDisplayMode}
          className="shrink-0 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-600 lg:px-4 lg:py-2 lg:text-sm"
        >
          {displayMode ? '전체 화면으로' : '질문만 보기'}
        </button>
      </div>

      {!displayMode && (
        <>
          <NameEntry name={name} onNameChange={setName} />
          <QuestionForm disabled={!name} onSubmit={handleAddQuestion} />
        </>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-500 lg:mb-3 lg:text-lg">오늘의 질문</h2>

        {loading && <p className="text-sm text-gray-400 lg:text-lg">불러오는 중...</p>}
        {error && <p className="mb-2 text-sm text-red-500 lg:text-lg">{error}</p>}

        {!loading && (
          <QuestionList
            questions={visibleQuestions}
            votedIds={votedIds}
            votingIds={votingIds}
            interactive={!displayMode}
            onVote={handleVote}
          />
        )}
      </section>
    </div>
  )
}
