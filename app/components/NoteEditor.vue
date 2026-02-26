<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import type { Note } from '../types/note'
import { useNotes } from '../composables/useNotes'

const props = defineProps<{
  note: Note | null
}>()

const emit = defineEmits<{
  'update:title': [value: string]
}>()

const { updateNote } = useNotes()

let editor: InstanceType<typeof Editor> | null = null

const editorContent = computed({
  get: () => props.note?.content ?? '<p></p>',
  set: () => {},
})

onMounted(() => {
  if (import.meta.server) return
  editor = new Editor({
    content: editorContent.value,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'prose prose-neutral dark:prose-invert max-w-none min-h-[320px] focus:outline-none px-4 py-3',
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
    if (!editor || import.meta.server) return
    if (newId !== oldId && props.note) {
      editor.commands.setContent(props.note.content, false)
    }
  }
)

watch(
  () => props.note?.content,
  (content) => {
    if (!editor || !content || import.meta.server) return
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, false)
    }
  }
)

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})
</script>

<template>
  <div class="h-full w-full">
    <EditorContent v-if="editor" :editor="editor" />
    <div
      v-else
      class="min-h-[320px] animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
    />
  </div>
</template>
