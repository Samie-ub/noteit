export interface Note {
  id: string
  title: string
  content: string
  updatedAt: number
  createdAt: number
}

export type NoteCreateInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & {
  content?: string
}
