import { ref, reactive } from 'vue'

const API_BASE_URL = 'https://kpl.qq.com'

const scheduleService = reactive({
  loading: false,
  error: null,
  upcomingMatches: [],
  finishedMatches: [],
  currentTournament: null
})

export const useScheduleAPI = () => {
  
  const fetchScheduleData = async (params = {}) => {
    scheduleService.loading = true
    scheduleService.error = null
    
    try {
      const { year, stage, team } = params
      
      const response = await fetch(`${API_BASE_URL}/api/schedule`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      scheduleService.upcomingMatches = data.upcoming || []
      scheduleService.finishedMatches = data.finished || []
      scheduleService.currentTournament = data.currentTournament
      
      return data
    } catch (error) {
      console.error('Failed to fetch schedule data:', error)
      scheduleService.error = error.message
      
      throw error
    } finally {
      scheduleService.loading = false
    }
  }

  const getMatchById = async (matchId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/match/${matchId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch match details:', error)
      throw error
    }
  }

  const getLiveMatches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/live`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch live matches:', error)
      throw error
    }
  }

  return {
    scheduleService,
    fetchScheduleData,
    getMatchById,
    getLiveMatches
  }
}

export default useScheduleAPI
