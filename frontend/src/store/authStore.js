import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: (profile, token) => {
    localStorage.setItem('access_token', token)
    set({ user: profile, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, isAuthenticated: false })
  },

  setUser: (profile) => {
    set({ user: profile, isAuthenticated: true })
  },
}))