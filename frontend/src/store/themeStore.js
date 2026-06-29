import { create } from 'zustand';

function getInitialTheme() {
    const saved = localStorage.getItem('theme');
    return saved || 'dark'
}

export const useThemeStore = create ((set) => ({
    theme: getInitialTheme(),

    toogleTheme: () => {
        set((state) => {
            const newTheme = state.theme === 'dark' ? 'light' : 'dark'
            localStorage.setItem('theme', newTheme)
            document.documentElement.classList.toogle('light', newTheme === 'light')
            return { theme: newTheme }
        })
    },

    applyTheme: () => {
        const saved = getInitialTheme()
        document.documentElement.classList.toogle('light', saved === 'light')
    },
}))