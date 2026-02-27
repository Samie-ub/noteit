# Noteit

A modern, client-side note-taking app built with Nuxt and TipTap. Create, edit, and organize notes with rich-text formatting. Data is stored locally in your browser—no account or backend required.

![Noteit](https://img.shields.io/badge/Nuxt-4-00DC82?style=flat-square&logo=nuxt.js)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat-square&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwind-css)

---

## Features

- **Rich text editing** — Bold, italic, strikethrough, inline code, headings (H1–H3), bullet/numbered lists, blockquotes, code blocks
- **Notes & trash** — Move notes to trash; restore or permanently delete; empty trash; drag-and-drop notes into trash
- **Recent notes** — Quick access to recently viewed notes (shown when you have multiple notes)
- **Created/updated timestamps** — Each note shows "Created" or "Updated" with date and 24-hour time
- **Dark / light theme** — Theme toggle in the editor toolbar
- **Copy to clipboard** — Copy note content as plain text from the toolbar
- **Local persistence** — All data stored in `localStorage`; no server or account needed
- **Responsive sidebar** — Scrollable notes list with hidden scrollbar, fade overlay, and scroll-down indicator

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Nuxt 4](https://nuxt.com) |
| UI | [Vue 3](https://vuejs.org) |
| Styling | [Tailwind CSS](https://tailwindcss.com) + [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) |
| Editor | [TipTap](https://tiptap.dev) (Vue 3, StarterKit, Placeholder) |
| Icons | [Phosphor Icons](https://phosphoricons.com) (Vue) |
| Notifications | [Vue Sonner](https://github.com/nicepkg/vue-sonner) |

---

## Project Structure

```
noteit/
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Global styles (e.g. font)
│   ├── components/
│   │   ├── AppSidebar.vue        # Sidebar: notes list, trash, new note, theme
│   │   └── NoteEditor.vue        # TipTap toolbar + editor
│   ├── composables/
│   │   ├── useNotes.ts           # Notes state, CRUD, trash, persistence
│   │   └── useTheme.ts           # Dark/light theme
│   ├── types/
│   │   └── note.ts               # Note interface
│   └── app.vue                   # Root layout, Toaster
├── nuxt.config.ts
├── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** 18.x or 20.x (LTS recommended)
- **npm**, **pnpm**, **yarn**, or **bun**

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Samie-ub/noteit.git
cd noteit
```

### Install dependencies

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### Run the development server

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
```

### Preview production build locally

```bash
npm run preview
```

### Generate static site (optional)

```bash
npm run generate
```

---

## Data & Storage

- **Notes** and **recent note IDs** are stored in the browser’s `localStorage`.
- Keys: `nuxt-notepad-notes`, `nuxt-notepad-recent`.
- No data is sent to any server; the app runs entirely in the client.

---

## Contributing

We welcome contributions from the community. Please follow these steps:

### 1. Fork and clone

Fork the repository on GitHub, then clone your fork locally:

```bash
git clone https://github.com/Samie-ub/noteit.git
cd noteit
```

### 2. Create a branch

Create a branch for your work (use a short, descriptive name):

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make your changes

- Follow the existing code style (Vue 3 Composition API, TypeScript, Tailwind).
- Keep commits focused and messages clear (e.g. `feat: add export to Markdown`, `fix: restore note persistence`).

### 4. Test locally

- Run `npm run dev` and verify the app works as expected.
- Run `npm run build` to ensure the project builds.

### 5. Push and open a Pull Request

```bash
git add .
git commit -m "feat: your change description"
git push origin feature/your-feature-name
```

Then open a **Pull Request** on GitHub from your branch to `main` (or the default branch). Describe what you changed and why. Maintainers will review and may suggest edits.

### Code style

- Use **TypeScript** for type safety.
- Prefer **Composition API** with `<script setup>` in Vue components.
- Use **Tailwind** utility classes for layout and styling.
- Keep components and composables focused and readable.

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run generate` | Generate static site (SSG) |

---

## License

This project is available under the [MIT License](LICENSE). If no `LICENSE` file is present, assume MIT for open-source use and modification.

---

## Acknowledgments

- [Nuxt](https://nuxt.com) and [Vue](https://vuejs.org) teams
- [TipTap](https://tiptap.dev) for the rich text editor
- [Phosphor Icons](https://phosphoricons.com) for the icon set
