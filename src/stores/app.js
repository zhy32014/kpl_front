import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    currentSeason: '2024KPL春季赛',
    isLoading: false,
    theme: 'dark'
  }),
  actions: {
    setLoading(status) {
      this.isLoading = status
    },
    setTheme(theme) {
      this.theme = theme
    }
  }
})
