import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.error(
    '.env.local에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY가 설정되어 있는지 확인하세요.',
  )
}

// 값이 비어 있으면 createClient가 즉시 예외를 던져 화면이 통째로 비어 보이므로,
// 설정 전에는 더미 값으로 클라이언트를 만들고 isSupabaseConfigured로 상태를 구분한다.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
