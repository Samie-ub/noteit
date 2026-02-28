<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import { useNotes } from './composables/useNotes'
import { useTheme } from './composables/useTheme'

const currentNoteId = ref<string | null>(null)
const { getNote, getRecentNotes, addToRecent, createNote } = useNotes()
const { theme } = useTheme()

const currentNote = computed(() => getNote(currentNoteId.value))

watch(
  [currentNoteId, () => getRecentNotes().length],
  () => {
    if (currentNoteId.value) return
    const recent = getRecentNotes()
    if (recent.length) {
      currentNoteId.value = recent[0].id
      addToRecent(recent[0].id)
    }
  },
  { immediate: true }
)

function handleNewNote() {
  const note = createNote()
  currentNoteId.value = note.id
}

function goToPreviousNote() {
  const recent = getRecentNotes()
  if (recent.length === 0) return
  const idx = currentNoteId.value
    ? recent.findIndex((n) => n.id === currentNoteId.value)
    : -1
  const prevIdx = idx <= 0 ? recent.length - 1 : idx - 1
  currentNoteId.value = recent[prevIdx].id
  addToRecent(recent[prevIdx].id)
}

function goToNextNote() {
  const recent = getRecentNotes()
  if (recent.length === 0) return
  const idx = currentNoteId.value
    ? recent.findIndex((n) => n.id === currentNoteId.value)
    : -1
  const nextIdx = idx < 0 ? 0 : idx >= recent.length - 1 ? 0 : idx + 1
  currentNoteId.value = recent[nextIdx].id
  addToRecent(recent[nextIdx].id)
}

function onKeydown(e: KeyboardEvent) {
  const mod = e.ctrlKey || e.metaKey
  if (!mod) return
  if (e.key === 'n') {
    e.preventDefault()
    handleNewNote()
    return
  }
  if (e.key === ']') {
    e.preventDefault()
    goToNextNote()
    return
  }
  if (e.key === '[') {
    e.preventDefault()
    goToPreviousNote()
    return
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', onKeydown)
  }
})
onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <div
    class="flex h-screen w-full overflow-hidden bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
  >
    <AppSidebar v-model:current-note-id="currentNoteId" />

    <main class="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ClientOnly>
          <NoteEditor
            v-if="currentNote"
            :note="currentNote"
          />
          <div
            v-else
            class="flex h-full items-center justify-center px-4 text-neutral-500 dark:text-neutral-400"
          >
            <p class="text-center text-sm">
              Create a new note from the sidebar, or select one from your recent list.
            </p>
          </div>
          <template #fallback>
            <div class="flex h-64 items-center justify-center">
              <div class="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 dark:border-neutral-600 dark:border-t-neutral-400" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </main>
    <Toaster position="bottom-right" richColors closeButton />
  </div>
</template>
