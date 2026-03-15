<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { Note } from '../types/note'
import { useNotes } from '../composables/useNotes'
import { toast } from 'vue-sonner'
import {
  PhTextB,
  PhTextItalic,
  PhTextStrikethrough,
  PhCode,
  PhListBullets,
  PhListNumbers,
  PhQuotes,
  PhCodeBlock,
  PhParagraph,
  PhTextHOne,
  PhTextHTwo,
  PhTextHThree,
  PhMoon,
  PhSun,
  PhCopy,
  PhX,
  PhSidebarSimple,
} from '@phosphor-icons/vue'
import { useTheme } from '../composables/useTheme'

const { theme, toggleTheme } = useTheme()

const props = defineProps<{
  note: Note | null
  showSidebarToggle?: boolean
}>()

const emit = defineEmits<{
  'update:title': [value: string]
  'open-sidebar': []
}>()

const { updateNote, getActiveNotes } = useNotes()

const editor = ref<InstanceType<typeof Editor> | null>(null)

const editorContent = computed({
  get: () => props.note?.content ?? '<p></p>',
  set: () => {},
})

onMounted(() => {
  if (import.meta.server) return
  editor.value = new Editor({
    content: editorContent.value,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write your note here…',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none min-h-full focus:outline-none px-4 py-3',
      },
    },
    onUpdate: ({ editor: e }) => {
      if (!props.note) return
      const html = e.getHTML()
      const text = e.getText()
      const title = text.slice(0, 50).trim() || 'Untitled note'
      updateNote(props.note.id, { content: html, title })
      emit('update:title', title)
    },
  })
})

watch(
  () => props.note?.id,
  (newId, oldId) => {
    if (!editor.value || import.meta.server) return
    if (newId !== oldId && props.note) {
      editor.value.commands.setContent(props.note.content, { emitUpdate: false })
    }
  }
)

watch(
  () => props.note?.content,
  (content) => {
    if (!editor.value || !content || import.meta.server) return
    if (editor.value.getHTML() !== content) {
      editor.value.commands.setContent(content, { emitUpdate: false })
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
  editor.value = null
})

function isActive(name: string, attrs?: Record<string, unknown>) {
  return editor.value?.isActive(name, attrs) ?? false
}

async function copyNoteContent() {
  if (!editor.value || !props.note) return
  const text = editor.value.getText()
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  } catch {
    toast.error('Failed to copy')
  }
}

const infoMenuOpen = ref(false)

const storageInfo = computed(() => {
  if (import.meta.server) return { usedBytes: 0, noteCount: 0 }
  const noteCount = getActiveNotes().length
  try {
    let used = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const val = localStorage.getItem(key)
        if (val) used += (key.length + val.length) * 2
      }
    }
    return { usedBytes: used, noteCount }
  } catch {
    return { usedBytes: 0, noteCount }
  }
})

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const shortcutKeys = [
  { keys: 'Ctrl/Cmd + N', action: 'New note' },
  { keys: 'Ctrl/Cmd + ]', action: 'Next note' },
  { keys: 'Ctrl/Cmd + [', action: 'Previous note' },
  { keys: 'Ctrl + B', action: 'Bold' },
  { keys: 'Ctrl + I', action: 'Italic' },
  { keys: 'Ctrl + Shift + S', action: 'Strikethrough' },
  { keys: 'Ctrl + E', action: 'Inline code' },
  { keys: 'Ctrl + Shift + 7', action: 'Blockquote' },
  { keys: 'Ctrl + Shift + 8', action: 'Bullet list' },
  { keys: 'Ctrl + Shift + 9', action: 'Numbered list' },
  { keys: 'Ctrl + Alt + C', action: 'Code block' },
  { keys: 'Ctrl + Shift + 1', action: 'Heading 1' },
  { keys: 'Ctrl + Shift + 2', action: 'Heading 2' },
  { keys: 'Ctrl + Shift + 3', action: 'Heading 3' },
]
</script>

<template>
  <div class="flex h-full w-full min-h-0 flex-col">
    <div
      v-if="editor"
      class="flex shrink-0 items-center gap-0 border-b border-neutral-200 bg-neutral-50 px-1 py-1.5 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <!-- Left: sidebar toggle (fixed) -->
      <div class="flex shrink-0 items-center gap-0.5">
        <button
          v-if="props.showSidebarToggle"
          type="button"
          class="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 md:hidden"
          aria-label="Open sidebar"
          title="Open sidebar"
          @click="emit('open-sidebar')"
        >
          <PhSidebarSimple class="h-5 w-5" weight="regular" />
        </button>
        <span
          v-if="props.showSidebarToggle"
          class="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-600 md:hidden"
          aria-hidden="true"
        />
      </div>

      <!-- Middle: scrollable formatting buttons (no scrollbar) -->
      <div class="control-bar-scroll flex min-w-0 flex-1 flex-nowrap items-center gap-0.5 overflow-x-auto overflow-y-hidden">
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('bold')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Bold"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <PhTextB class="h-4 w-4" :weight="isActive('bold') ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('italic')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Italic"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <PhTextItalic class="h-4 w-4" :weight="isActive('italic') ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('strike')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Strikethrough"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <PhTextStrikethrough class="h-4 w-4" :weight="isActive('strike') ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('code')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Inline code"
        @click="editor.chain().focus().toggleCode().run()"
      >
        <PhCode class="h-4 w-4" :weight="isActive('code') ? 'fill' : 'regular'" />
      </button>

      <span class="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-600" aria-hidden="true" />

      <button
        type="button"
        class="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
        title="Copy note"
        aria-label="Copy note"
        @click="copyNoteContent"
      >
        <PhCopy class="h-4 w-4" weight="regular" />
      </button>

      <span class="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-600" aria-hidden="true" />

      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('paragraph')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Paragraph"
        @click="editor.chain().focus().setParagraph().run()"
      >
        <PhParagraph class="h-4 w-4" :weight="isActive('paragraph') ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('heading', { level: 1 })
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Heading 1"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >
        <PhTextHOne class="h-4 w-4" :weight="isActive('heading', { level: 1 }) ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('heading', { level: 2 })
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Heading 2"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >
        <PhTextHTwo class="h-4 w-4" :weight="isActive('heading', { level: 2 }) ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('heading', { level: 3 })
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Heading 3"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <PhTextHThree class="h-4 w-4" :weight="isActive('heading', { level: 3 }) ? 'fill' : 'regular'" />
      </button>

      <span class="mx-1 h-4 w-px bg-neutral-300 dark:bg-neutral-600" aria-hidden="true" />

      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('bulletList')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Bullet list"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <PhListBullets class="h-4 w-4" :weight="isActive('bulletList') ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('orderedList')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Numbered list"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <PhListNumbers class="h-4 w-4" :weight="isActive('orderedList') ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('blockquote')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Blockquote"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <PhQuotes class="h-4 w-4" :weight="isActive('blockquote') ? 'fill' : 'regular'" />
      </button>
      <button
        type="button"
        :class="[
          'rounded p-1.5 transition-colors',
          isActive('codeBlock')
            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-600 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100',
        ]"
        title="Code block"
        @click="editor.chain().focus().toggleCodeBlock().run()"
      >
        <PhCodeBlock class="h-4 w-4" :weight="isActive('codeBlock') ? 'fill' : 'regular'" />
      </button>
      </div>

      <!-- Right: theme toggle (fixed) -->
      <div class="flex shrink-0 items-center">
      <button
        type="button"
        class="rounded p-1.5 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
        :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
        title="Toggle theme"
        @click="toggleTheme"
      >
        <PhMoon v-if="theme === 'light'" class="h-4 w-4" weight="regular" />
        <PhSun v-else class="h-4 w-4" weight="regular" />
      </button>
      </div>
    </div>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-auto">
      <EditorContent v-if="editor" :editor="editor" class="note-editor-content h-full min-h-full" />
      <div
        v-else
        class="h-full min-h-[320px] animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
      />

      <!-- Info menu trigger (desktop only; fixed to viewport so it stays visible when content scrolls) -->
      <button
        type="button"
        class="fixed bottom-4 right-4 z-20 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-lg font-semibold text-neutral-600 shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100 md:flex"
        :class="{ 'bg-neutral-200 dark:bg-neutral-600': infoMenuOpen }"
        aria-label="App info & shortcuts"
        title="App info & shortcuts"
        @click="infoMenuOpen = !infoMenuOpen"
      >
        !
      </button>

      <!-- Info panel (fixed to viewport so it stays visible when content has scrolled) -->
      <Transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-150 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-show="infoMenuOpen"
          class="fixed inset-y-0 right-0 z-30 flex w-72 flex-col border-l border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div class="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
            <h3 class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Info & shortcuts
            </h3>
            <button
              type="button"
              class="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
              aria-label="Close"
              @click="infoMenuOpen = false"
            >
              <PhX class="h-4 w-4" weight="bold" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-4 py-3 text-sm">
            <section class="mb-4">
              <h4 class="mb-2 font-medium text-neutral-700 dark:text-neutral-300">
                Storage
              </h4>
              <div class="space-y-1 text-neutral-600 dark:text-neutral-400">
                <p>Used: {{ formatBytes(storageInfo.usedBytes) }}</p>
                <p>Notes: {{ storageInfo.noteCount }}</p>
                <p class="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                  Data is stored in your browser (localStorage). No server or account required.
                </p>
              </div>
            </section>
            <section>
              <h4 class="mb-2 font-medium text-neutral-700 dark:text-neutral-300">
                Shortcut keys
              </h4>
              <ul class="space-y-2 text-neutral-600 dark:text-neutral-400">
                <li
                  v-for="item in shortcutKeys"
                  :key="item.keys"
                  class="flex items-center justify-between gap-2"
                >
                  <kbd class="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:border-neutral-600 dark:bg-neutral-800">
                    {{ item.keys }}
                  </kbd>
                  <span class="text-right text-xs">{{ item.action }}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.control-bar-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.control-bar-scroll::-webkit-scrollbar {
  display: none;
}

.note-editor-content :deep(> *),
.note-editor-content :deep(.ProseMirror) {
  min-height: 100%;
  height: 100%;
}
.note-editor-content :deep(.ProseMirror) {
  cursor: text;
}
.note-editor-content :deep(.ProseMirror .is-editor-empty::before) {
  color: #a3a3a3;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.dark .note-editor-content :deep(.ProseMirror .is-editor-empty::before) {
  color: #525252;
}
</style>
