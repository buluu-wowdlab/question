import type { Question } from '../lib/questions'
import QuestionCard from './QuestionCard'

interface QuestionListProps {
  questions: Question[]
  votedIds: Set<number>
  votingIds: Set<number>
  interactive: boolean
  onVote: (id: number) => void
}

export default function QuestionList({
  questions,
  votedIds,
  votingIds,
  interactive,
  onVote,
}: QuestionListProps) {
  if (questions.length === 0) {
    return <p className="text-sm text-gray-400 lg:text-lg">아직 등록된 질문이 없어요</p>
  }

  return (
    <ul className="flex flex-col gap-2 lg:gap-3">
      {questions.map((q) => (
        <QuestionCard
          key={q.id}
          question={q}
          voted={votedIds.has(q.id)}
          voting={votingIds.has(q.id)}
          interactive={interactive}
          onVote={() => onVote(q.id)}
        />
      ))}
    </ul>
  )
}
