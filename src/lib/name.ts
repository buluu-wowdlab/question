const NAME_STORAGE_KEY = 'qv:name'

export function getStoredName(): string | null {
  return localStorage.getItem(NAME_STORAGE_KEY)
}

export function setStoredName(name: string): void {
  localStorage.setItem(NAME_STORAGE_KEY, name)
}
