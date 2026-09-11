import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabaseClient'

// DB 컬럼(snake_case) ↔ 앱 타입(camelCase) 변환은 이 파일에서만 한다.
interface QuestionRow {
  id: number
  session_date: string
  question_text: string
  author_name: string
  vote_count: number
  created_at: string
}

export interface Question {
  id: number
  sessionDate: string
  questionText: string
  authorName: string
  voteCount: number
  createdAt: string
}

function toQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    sessionDate: row.session_date,
    questionText: row.question_text,
    authorName: row.author_name,
    voteCount: row.vote_count,
    createdAt: row.created_at,
  }
}

// 한국 시간(Asia/Seoul) 기준 오늘 날짜를 'YYYY-MM-DD' 형식으로 반환한다.
export function getTodaySessionDate(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}

// 교수님 화면(공감 수 공개): 공감 수 높은 순 → 동점이면 최신 등록 순
export function sortByVotes(questions: Question[]): Question[] {
  return [...questions].sort((a, b) => {
    if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

// 학생 화면(공감 수 비공개): 등록 순서 그대로. 공감 수로 재정렬하면 수치를 몰라도
// 순위 변화로 유추할 수 있으므로 등록 순을 그대로 유지한다.
export function sortChronological(questions: Question[]): Question[] {
  return [...questions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export async function fetchTodayQuestions(): Promise<Question[]> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase 연결 정보가 없습니다. .env.local에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 입력해주세요.',
    )
  }

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('session_date', getTodaySessionDate())
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data as QuestionRow[]).map(toQuestion)
}

export async function insertQuestion(authorName: string, questionText: string): Promise<Question> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase 연결 정보가 없습니다. .env.local에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 입력해주세요.',
    )
  }

  const trimmedText = questionText.trim()
  const trimmedName = authorName.trim()

  if (trimmedText.length < 1 || trimmedText.length > 200) {
    throw new Error('질문은 1~200자로 입력해주세요.')
  }
  if (trimmedName.length < 1 || trimmedName.length > 20) {
    throw new Error('이름은 1~20자로 입력해주세요.')
  }

  const { data, error } = await supabase
    .from('questions')
    .insert({ author_name: trimmedName, question_text: trimmedText })
    .select()
    .single()

  if (error) throw error

  return toQuestion(data as QuestionRow)
}

export async function voteQuestion(id: number, delta: 1 | -1): Promise<number> {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Supabase 연결 정보가 없습니다. .env.local에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 입력해주세요.',
    )
  }

  const { data, error } = await supabase.rpc('vote', { q_id: id, delta })

  if (error) throw error

  return data as number
}

// 오늘 질문의 등록(INSERT)·공감 변경(UPDATE)을 실시간으로 구독한다.
export function subscribeToTodayQuestions(
  onInsert: (question: Question) => void,
  onUpdate: (question: Question) => void,
): RealtimeChannel {
  const filter = `session_date=eq.${getTodaySessionDate()}`

  return supabase
    .channel('questions-today')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'questions', filter },
      (payload) => onInsert(toQuestion(payload.new as QuestionRow)),
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'questions', filter },
      (payload) => onUpdate(toQuestion(payload.new as QuestionRow)),
    )
    .subscribe()
}
