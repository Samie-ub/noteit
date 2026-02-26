const STORAGE_KEY = 'nuxt-notepad-theme'
type Theme = 'light' | 'dark'

function getStoredTheme(): Theme {
  if (import.meta.server) return 'light'
  try {
    const raw = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (raw === 'dark' || raw === 'light') return raw
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
    return 'light'
  } catch {
    return 'light'
  }
}

function applyTheme(theme: Theme) {
  if (import.meta.server) return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.setAttribute('data-theme', theme)
}

export function useTheme() {
  const theme = useState<Theme>('theme', () => getStoredTheme())

  function setTheme(value: Theme) {
    theme.value = value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, value)
      applyTheme(value)
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  onMounted(() => {
    applyTheme(theme.value)
  })

  watch(theme, (val) => {
    if (import.meta.client) applyTheme(val)
  }, { immediate: false })

  return { theme, setTheme, toggleTheme }
}
