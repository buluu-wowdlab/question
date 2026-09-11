import type { Question } from '../lib/questions'

interface QuestionCardProps {
  question: Question
  voted: boolean
  voting: boolean
  interactive: boolean
  onVote: () => void
}

export default function QuestionCard({ question, voted, voting, interactive, onVote }: QuestionCardProps) {
  const badgeClass = `flex items-center gap-1 rounded-full border px-3 py-1 text-sm lg:gap-2 lg:px-4 lg:py-2 lg:text-base ${
    voted ? 'border-pink-400 bg-pink-50 text-pink-600' : 'border-gray-300 bg-white text-gray-500'
  }`

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm lg:rounded-xl lg:p-5">
      <p className="break-words text-gray-900 lg:text-xl">{question.questionText}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500 lg:mt-3 lg:text-base">
        <span className="break-words">작성자: {question.authorName}</span>
        {interactive ? (
          // 학생 화면: 공감 수는 숨기고, 내가 공감했는지 여부만 보여준다.
          <button
            type="button"
            onClick={onVote}
            disabled={voting}
            className={`${badgeClass} transition-colors disabled:opacity-50`}
          >
            <span>{voted ? '❤️' : '🤍'}</span>
            <span>{voted ? '공감함' : '공감하기'}</span>
          </button>
        ) : (
          // 교수님 화면(질문만 보기): 공감 수를 공개한다.
          <span className={badgeClass}>
            <span>{voted ? '❤️' : '🤍'}</span>
            <span>공감 {question.voteCount}</span>
          </span>
        )}
      </div>
    </li>
  )
}
