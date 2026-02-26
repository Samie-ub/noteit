<script setup lang="ts">
import { PhMoon, PhSun, PhPlus, PhTrashSimple, PhNotePencil, PhClockCounterClockwise } from '@phosphor-icons/vue'
import type { Note } from '../types/note'
import { useNotes } from '../composables/useNotes'
import { useTheme } from '../composables/useTheme'

const { createNote, getRecentNotes, deleteNote } = useNotes()
const { theme, toggleTheme } = useTheme()

const currentNoteId = defineModel<string | null>('currentNoteId', { default: null })
const recentNotes = computed(() => getRecentNotes())

function handleNewNote() {
  const note = createNote()
  currentNoteId.value = note.id
}

function selectNote(note: Note) {
  currentNoteId.value = note.id
}

function handleDelete(e: Event, id: string) {
  e.stopPropagation()
  if (currentNoteId.value === id) currentNoteId.value = null
  deleteNote(id)
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}
</script>

<template>
  <aside
    class="flex h-full min-w-[16rem] w-64 flex-shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900"
  >
    <div class="flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-neutral-700">
      <h1 class="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        <PhNotePencil :size="20" weight="regular" class="text-neutral-600 dark:text-neutral-400" />
        Noteit
      </h1>
      <button
        type="button"
        class="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
        :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        @click="toggleTheme"
      >
        <PhMoon v-if="theme === 'light'" :size="20" weight="regular" class="text-current" />
        <PhSun v-else :size="20" weight="regular" class="text-current" />
      </button>
    </div>

    <button
      type="button"
      class="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
      @click="handleNewNote"
    >
      <PhPlus :size="18" weight="bold" class="flex-shrink-0 text-current" />
      New note
    </button>

    <div class="mt-2 flex-1 overflow-y-auto px-2 pb-4">
      <p class="mb-1 flex items-center gap-1.5 px-2 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        <PhClockCounterClockwise :size="14" weight="regular" />
        Recent
      </p>
      <ul v-if="recentNotes.length" class="space-y-0.5">
        <li
          v-for="note in recentNotes"
          :key="note.id"
          class="group flex items-center gap-2 rounded-lg px-2 py-2 transition"
          :class="currentNoteId === note.id
            ? 'bg-neutral-200 dark:bg-neutral-700'
            : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'"
        >
          <button
            type="button"
            class="min-w-0 flex-1 truncate text-left text-sm text-neutral-800 dark:text-neutral-200"
            @click="selectNote(note)"
          >
            {{ note.title || 'Untitled' }}
          </button>
          <button
            type="button"
            class="rounded p-1 text-neutral-400 opacity-0 transition hover:bg-neutral-200 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-neutral-600 dark:hover:text-red-400"
            aria-label="Delete note"
            @click="handleDelete($event, note.id)"
          >
            <PhTrashSimple :size="16" weight="regular" class="text-current" />
          </button>
        </li>
      </ul>
      <p v-else class="px-2 text-sm text-neutral-500 dark:text-neutral-400">
        No notes yet. Create one above.
      </p>
    </div>
  </aside>
</template>
