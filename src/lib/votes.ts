const VOTED_STORAGE_KEY = 'qv:voted'

export function getVotedIds(): number[] {
  try {
    const raw = localStorage.getItem(VOTED_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function addVotedId(id: number): void {
  const ids = getVotedIds()
  if (!ids.includes(id)) {
    localStorage.setItem(VOTED_STORAGE_KEY, JSON.stringify([...ids, id]))
  }
}

export function removeVotedId(id: number): void {
  localStorage.setItem(VOTED_STORAGE_KEY, JSON.stringify(getVotedIds().filter((v) => v !== id)))
}
