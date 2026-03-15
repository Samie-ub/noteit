const MOBILE_MAX_WIDTH = 768

export function useBreakpoint() {
  const isMobile = ref(false)

  function update() {
    if (import.meta.client) {
      isMobile.value = window.innerWidth < MOBILE_MAX_WIDTH
    }
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('resize', update)
  })

  return { isMobile }
}
