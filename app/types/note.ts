export interface Note {
  id: string
  title: string
  content: string
  updatedAt: number
  createdAt: number
  /** Set when note is moved to trash; undefined when active */
  deletedAt?: number
}

export type NoteCreateInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & {
  content?: string
}
