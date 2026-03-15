<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'
import { PhSidebarSimple } from '@phosphor-icons/vue'
import { useNotes } from './composables/useNotes'
import { useTheme } from './composables/useTheme'
import { useBreakpoint } from './composables/useBreakpoint'

const currentNoteId = ref<string | null>(null)
const { isMobile } = useBreakpoint()
const sidebarOpen = ref(true)

// On mobile, start with sidebar closed
onMounted(() => {
  if (import.meta.client && window.innerWidth < 768) {
    sidebarOpen.value = false
  }
})

// When selecting a note on mobile, close the sidebar
watch(currentNoteId, () => {
  if (isMobile.value) sidebarOpen.value = false
})
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
    <AppSidebar v-model:current-note-id="currentNoteId" v-model:open="sidebarOpen" />

    <main class="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ClientOnly>
          <NoteEditor
            v-if="currentNote"
            :note="currentNote"
            :show-sidebar-toggle="isMobile && !sidebarOpen"
            @open-sidebar="sidebarOpen = true"
          />
          <template v-else>
            <!-- Mobile: bar with sidebar toggle when no note selected -->
            <div
              v-if="isMobile && !sidebarOpen"
              class="flex shrink-0 items-center border-b border-neutral-200 bg-neutral-50 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <button
                type="button"
                class="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                aria-label="Open sidebar"
                @click="sidebarOpen = true"
              >
                <PhSidebarSimple class="h-5 w-5" weight="regular" />
              </button>
            </div>
            <div
              class="flex flex-1 items-center justify-center px-4 text-neutral-500 dark:text-neutral-400"
            >
              <p class="text-center text-sm">
                Create a new note from the sidebar, or select one from your recent list.
              </p>
            </div>
          </template>
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
