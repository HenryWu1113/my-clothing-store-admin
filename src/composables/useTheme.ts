import { ref, watchEffect, computed } from 'vue'
type Theme = 'light' | 'dark'
const LOCAL_KEY = '__theme__'
const theme = ref<Theme>((localStorage.getItem(LOCAL_KEY) as Theme) || 'light')

const isLight = computed(() => {
  return theme.value === 'light'
})

watchEffect(() => {
  localStorage.setItem(LOCAL_KEY, theme.value)
  document.documentElement.dataset.theme = theme.value
})

export default function useTheme() {
  return {
    theme,
    isLight
  }
}
