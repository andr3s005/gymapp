import { create } from 'zustand'

function getInitialTheme() {
  const saved = localStorage.getItem('theme')
  return saved || 'dark'
}

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('light', newTheme === 'light')
      return { theme: newTheme }
    })
  },

  applyStoredTheme: () => {
    const saved = getInitialTheme()
    document.documentElement.classList.toggle('light', saved === 'light')
  },
}))