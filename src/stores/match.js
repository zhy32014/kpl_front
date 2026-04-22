import { defineStore } from 'pinia'
import { matchesDB } from '../data/matches'
import { matchApi } from '@/api/backend'

export const useMatchStore = defineStore('match', {
  state: () => ({
    currentTournament: '2026年KPL春季赛',
    tournamentStage: '已结束',
    matches: [],
    historyMatches: matchesDB,
    liveMatch: null
  }),
  actions: {
    async fetchAllMatches() {
      try {
        const res = await matchApi.getAll()
        if (res.success) {
          // 将从后端获取的数据按状态分发
          this.matches = res.data.filter(m => m.status !== 'finished')
          // 如果后端有完整历史，可以更新 historyMatches，或者合并
          const finished = res.data.filter(m => m.status === 'finished')
          if (finished.length > 0) {
            this.historyMatches = finished
          }
        }
      } catch (error) {
        console.error('Fetch matches failed:', error)
      }
    }
  },
  getters: {
    upcomingMatches: (state) => {
      if (!state.matches || !Array.isArray(state.matches)) return []
      return state.matches.filter(m => m.status === 'upcoming')
    },
    finishedMatches: (state) => {
      if (!state.historyMatches || !Array.isArray(state.historyMatches)) return []
      return state.historyMatches.filter(m => m.status === 'finished')
    },
    recentFinals: (state) => {
      if (!state.historyMatches || !Array.isArray(state.historyMatches)) return []
      return state.historyMatches.filter(m => m.stage === '总决赛').slice(0, 6)
    },
    liveMatch: (state) => {
      return state.liveMatch
    },
    matchesByGroup: (state) => {
      if (!state.matches || !Array.isArray(state.matches)) return {}
      return state.matches.reduce((groups, match) => {
        const group = match.group || '未分组'
        if (!groups[group]) groups[group] = []
        groups[group].push(match)
        return groups
      }, {})
    },
    getMatchById: (state) => (id) => {
      const allMatches = [...(state.historyMatches || []), ...(state.matches || [])]
      return allMatches.find(m => m.id === id)
    }
  }
})
