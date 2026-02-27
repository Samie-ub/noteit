<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import { useNotes } from './composables/useNotes'
import { useTheme } from './composables/useTheme'

const currentNoteId = ref<string | null>(null)
const { getNote, getRecentNotes, addToRecent } = useNotes()
const { theme } = useTheme()

const currentNote = computed(() => getNote(currentNoteId.value))

// If user lands with no notes, show empty state; they can click "New note" in sidebar.
// If they have notes but none selected, auto-select most recent.
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
    <Toaster position="top-right" richColors closeButton />
  </div>
</template>
