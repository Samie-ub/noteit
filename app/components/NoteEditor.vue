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
} from '@phosphor-icons/vue'
import { useTheme } from '../composables/useTheme'

const { theme, toggleTheme } = useTheme()

const props = defineProps<{
  note: Note | null
}>()

const emit = defineEmits<{
  'update:title': [value: string]
}>()

const { updateNote } = useNotes()

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
</script>

<template>
  <div class="flex h-full w-full min-h-0 flex-col">
    <div
      v-if="editor"
      class="flex shrink-0 flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50 px-2 py-1.5 dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div class="flex flex-1 flex-wrap items-center gap-0.5   ">
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

      <!-- Theme toggle (right) -->
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

    <div class="flex min-h-0 flex-1 flex-col overflow-auto">
      <EditorContent v-if="editor" :editor="editor" class="note-editor-content h-full min-h-full" />
      <div
        v-else
        class="h-full min-h-[320px] animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
      />
    </div>
  </div>
</template>

<style scoped>
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
