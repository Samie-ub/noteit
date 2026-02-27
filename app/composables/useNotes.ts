import type { Note } from '../types/note'

const STORAGE_KEY = 'nuxt-notepad-notes'
const RECENT_KEY = 'nuxt-notepad-recent'
const MAX_RECENT = 20

function getStoredNotes(): Note[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Note[]
  } catch {
    return []
  }
}

function setStoredNotes(notes: Note[]) {
  if (import.meta.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

function getRecentIds(): string[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function setRecentIds(ids: string[]) {
  if (import.meta.server) return
  localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, MAX_RECENT)))
}

export function useNotes() {
  const notes = useState<Note[]>('notes', () => [])

  onMounted(() => {
    if (import.meta.client) {
      const stored = getStoredNotes()
      if (stored.length) {
        notes.value = stored
      } else {
        // New user: create one default note
        createNote('Untitled note', '<p></p>')
      }
    }
  })

  function persist() {
    setStoredNotes(notes.value)
  }

  function addToRecent(id: string) {
    const recent = getRecentIds().filter((x) => x !== id)
    recent.unshift(id)
    setRecentIds(recent)
  }

  function createNote(title = 'Untitled note', content = '<p></p>'): Note {
    const now = Date.now()
    const note: Note = {
      id: crypto.randomUUID(),
      title: title || 'Untitled note',
      content: content || '<p></p>',
      createdAt: now,
      updatedAt: now,
    }
    notes.value = [note, ...notes.value]
    persist()
    addToRecent(note.id)
    return note
  }

  function getNote(id: string | null): Note | undefined {
    if (!id) return undefined
    const note = notes.value.find((n) => n.id === id)
    return note && !note.deletedAt ? note : undefined
  }

  function getActiveNotes(): Note[] {
    return notes.value.filter((n) => !n.deletedAt)
  }

  function getTrashedNotes(): Note[] {
    return notes.value
      .filter((n) => n.deletedAt != null)
      .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0))
  }

  function deleteNote(id: string) {
    const note = notes.value.find((n) => n.id === id)
    if (!note) return
    note.deletedAt = Date.now()
    persist()
    const recent = getRecentIds().filter((x) => x !== id)
    setRecentIds(recent)
  }

  function restoreNote(id: string) {
    const note = notes.value.find((n) => n.id === id)
    if (!note) return
    delete note.deletedAt
    persist()
  }

  function permanentlyDeleteNote(id: string) {
    notes.value = notes.value.filter((n) => n.id !== id)
    persist()
    const recent = getRecentIds().filter((x) => x !== id)
    setRecentIds(recent)
  }

  function emptyTrash() {
    const trashedIds = notes.value.filter((n) => n.deletedAt != null).map((n) => n.id)
    notes.value = notes.value.filter((n) => n.deletedAt == null)
    persist()
    const recent = getRecentIds().filter((id) => !trashedIds.includes(id))
    setRecentIds(recent)
  }

  function updateNote(
    id: string,
    updates: { title?: string; content?: string }
  ) {
    const note = notes.value.find((n) => n.id === id)
    if (!note) return
    if (updates.title !== undefined) note.title = updates.title
    if (updates.content !== undefined) note.content = updates.content
    note.updatedAt = Date.now()
    persist()
    addToRecent(id)
  }

  function getRecentNotes(): Note[] {
    const recentIds = getRecentIds()
    const activeById = new Map(
      notes.value.filter((n) => !n.deletedAt).map((n) => [n.id, n])
    )
    return recentIds.map((id) => activeById.get(id)).filter(Boolean) as Note[]
  }

  return {
    notes,
    createNote,
    getNote,
    getActiveNotes,
    getTrashedNotes,
    updateNote,
    deleteNote,
    restoreNote,
    permanentlyDeleteNote,
    emptyTrash,
    getRecentNotes,
    addToRecent,
    persist,
  }
}
