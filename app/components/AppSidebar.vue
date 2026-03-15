<script setup lang="ts">
import { toast } from 'vue-sonner'
import { PhTrashSimple, PhNotePencil, PhArrowCounterClockwise, PhArrowCircleDown, PhX, PhCaretCircleLeft } from '@phosphor-icons/vue'
import type { Note } from '../types/note'
import { useNotes } from '../composables/useNotes'

const { createNote, getRecentNotes, getActiveNotes, getTrashedNotes, deleteNote, restoreNote, permanentlyDeleteNote, emptyTrash } = useNotes()

const currentNoteId = defineModel<string | null>('currentNoteId', { default: null })
const open = defineModel<boolean>('open', { default: true })
const recentNotes = computed(() => getRecentNotes())
const trashedNotes = computed(() => getTrashedNotes())
const activeNotes = computed(() => getActiveNotes())

const sidebarScrollRef = ref<HTMLElement | null>(null)
const canScrollDown = ref(false)

function updateScrollHint() {
  const el = sidebarScrollRef.value
  if (!el) return
  const { scrollTop, scrollHeight, clientHeight } = el
  canScrollDown.value = scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 2
}

function scrollDown() {
  sidebarScrollRef.value?.scrollBy({ top: 80, behavior: 'smooth' })
}

onMounted(() => {
  updateScrollHint()
  window.addEventListener('resize', updateScrollHint)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScrollHint)
})

const showRecentSection = computed(() => activeNotes.value.length >= 2 && recentNotes.value.length >= 1)

const sidebarNoteList = computed(() =>
  showRecentSection.value ? recentNotes.value : (activeNotes.value.length === 1 ? activeNotes.value : [])
)

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
  toast('Note moved to trash')
}

function handleRestore(e: Event, id: string) {
  e.stopPropagation()
  restoreNote(id)
  toast.success('Note restored')
}

function handlePermanentDelete(e: Event, id: string) {
  e.stopPropagation()
  if (currentNoteId.value === id) currentNoteId.value = null
  permanentlyDeleteNote(id)
  toast('Note deleted permanently')
}

function handleEmptyTrash() {
  if (currentNoteId.value && trashedNotes.value.some((n) => n.id === currentNoteId.value)) currentNoteId.value = null
  emptyTrash()
  toast('Trash emptied')
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

const TIME_OPTS_24H = { hour: '2-digit' as const, minute: '2-digit' as const, hour12: false }

function formatNoteTimestamp(note: { createdAt: number; updatedAt: number }) {
  const isCreated = note.updatedAt - note.createdAt < 1000 // within 1s = never edited
  const ts = isCreated ? note.createdAt : note.updatedAt
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString([], TIME_OPTS_24H)
  const prefix = isCreated ? 'Created' : 'Updated'
  if (isToday) return `${prefix} today at ${time}`
  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  return `${prefix} on ${date} at ${time}`
}

function formatDeletedTimestamp(deletedAt: number) {
  const d = new Date(deletedAt)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString([], TIME_OPTS_24H)
  if (isToday) return `Deleted today at ${time}`
  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  return `Deleted on ${date} at ${time}`
}

watch([sidebarNoteList, trashedNotes], () => {
  nextTick(updateScrollHint)
})
</script>

<template>
  <!-- Mobile: backdrop when sidebar is open -->
  <div
    v-show="open"
    class="fixed inset-0 z-30 bg-black/40 md:hidden"
    aria-hidden="true"
    @click="open = false"
  />

  <aside
    class="flex h-full min-w-[16rem] w-64 flex-shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 pb-4 fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-out md:relative md:z-auto md:translate-x-0 md:transition-none"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 dark:border-neutral-700">
      <h1 class="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
        <PhNotePencil :size="16" weight="regular" class="text-neutral-600 dark:text-neutral-400" />
        Noteit
      </h1>
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 md:hidden"
        aria-label="Close sidebar"
        @click="open = false"
      >
        <PhCaretCircleLeft :size="20" weight="bold" />
      </button>
    </div>

  

    <div class="relative mt-2 flex min-h-0 flex-1 flex-col">
      <div
        ref="sidebarScrollRef"
        class="sidebar-scroll flex-1 overflow-y-auto px-2 pb-20 space-y-4"
        @scroll="updateScrollHint"
      >
        <!-- Notes -->
      <section v-if="sidebarNoteList.length">
        <p class="mb-1 flex items-center gap-1.5 px-2 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          <PhNotePencil :size="14" weight="regular" />
          Notes
        </p>
        <ul class="space-y-0.5">
          <li
            v-for="note in sidebarNoteList"
            :key="note.id"
            class="group flex items-center gap-2 rounded-md px-2 py-2 transition"
            :class="currentNoteId === note.id
              ? 'bg-neutral-200 dark:bg-neutral-700'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'"
          >
            <button
              type="button"
              class="min-w-0 flex-1 text-left"
              @click="selectNote(note)"
            >
              <span class="block truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                {{ note.title || 'Untitled' }}
              </span>
              <span class="block truncate text-xs text-neutral-500 dark:text-neutral-400">
                {{ formatNoteTimestamp(note) }}
              </span>
            </button>
            <button
              type="button"
              class="flex-shrink-0 rounded p-1 text-neutral-400 opacity-0 transition hover:bg-neutral-200 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-neutral-600 dark:hover:text-red-400"
              aria-label="Move to trash"
              @click="handleDelete($event, note.id)"
            >
              <PhTrashSimple :size="16" weight="regular" class="text-current" />
            </button>
          </li>
        </ul>
      </section>

      <p v-else-if="activeNotes.length === 0 && trashedNotes.length === 0" class="px-2 text-sm text-neutral-500 dark:text-neutral-400">
        No notes yet. Create one below.
      </p>

      <!-- Trash -->
      <section v-if="trashedNotes.length">
        <div class="mb-1 flex items-center justify-between gap-2 px-2">
          <p class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            <PhTrashSimple :size="14" weight="regular" />
            Trash
          </p>
          <button
            type="button"
            class="rounded px-1.5 py-0.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
            @click="handleEmptyTrash"
          >
            Empty trash
          </button>
        </div>
        <ul class="space-y-0.5">
          <li
            v-for="note in trashedNotes"
            :key="note.id"
            class="group flex items-center gap-2 rounded-md px-2 py-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <div class="min-w-0 flex-1 text-left">
              <span class="block truncate text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {{ note.title || 'Untitled' }}
              </span>
              <span v-if="note.deletedAt != null" class="block truncate text-xs text-neutral-500 dark:text-neutral-500">
                {{ formatDeletedTimestamp(note.deletedAt) }}
              </span>
            </div>
            <div class="flex flex-shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
              <button
                type="button"
                class="rounded p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800 dark:hover:bg-neutral-600 dark:hover:text-neutral-200"
                aria-label="Restore note"
                title="Restore"
                @click="handleRestore($event, note.id)"
              >
                <PhArrowCounterClockwise :size="16" weight="regular" class="text-current" />
              </button>
              <button
                type="button"
                class="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-red-600 dark:hover:bg-neutral-600 dark:hover:text-red-400"
                aria-label="Delete permanently"
                title="Delete permanently"
                @click="handlePermanentDelete($event, note.id)"
              >
                <PhTrashSimple :size="16" weight="regular" class="text-current" />
              </button>
            </div>
          </li>
        </ul>
      </section>
      </div>

      <div
        class="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neutral-50 to-transparent dark:from-neutral-900"
        aria-hidden="true"
      />

      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-1"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 translate-y-1"
      >
        <button
          v-show="canScrollDown"
          type="button"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-neutral-200/90 p-1.5 text-neutral-600 shadow-sm backdrop-blur-sm hover:bg-neutral-300 hover:text-neutral-800 dark:bg-neutral-600/90 dark:text-neutral-300 dark:hover:bg-neutral-500 dark:hover:text-neutral-100"
          aria-label="Scroll down"
          @click="scrollDown"
        >
          <PhArrowCircleDown :size="24" weight="fill" />
        </button>
      </Transition>
    </div>
    <button
      type="button"
      class="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm justify-center font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:bg-neutral-800"
      @click="handleNewNote"
    >
     
      New note
    </button>
  </aside>
</template>

<style scoped>
.sidebar-scroll {
  scrollbar-width: none; 
  -ms-overflow-style: none; 
}
.sidebar-scroll::-webkit-scrollbar {
  display: none; 
}
</style>
