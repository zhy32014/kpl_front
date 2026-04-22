import { teamsDB, getTeamById, getChampionTeam, getTeamsByGroup, getTopTeams } from '../data/teams'
import { matchesDB, upcomingMatches, getMatchById, getRecentMatches, getUpcomingByGroup } from '../data/matches'
import { videosDB, liveStreams, getVideoById, getVideosByTournament, getPopularVideos, getRecentVideos } from '../data/videos'
import { kplInfo } from '../data'

const api = {
  teams: {
    getAll: () => teamsDB,
    getById: (id) => getTeamById(id),
    getByName: (name) => teamsDB.find(team => team.name === name || team.shortName === name),
    getChampion: () => getChampionTeam(),
    getByGroup: () => getTeamsByGroup(),
    getTop: (count = 6) => getTopTeams(count),
    getPlayers: (teamId) => {
      const team = getTeamById(teamId)
      return team ? [...(team.roster || []), ...(team.substitutes || [])] : []
    },
    getPlayerById: (playerId) => {
      for (const team of teamsDB) {
        const allPlayers = [...(team.roster || []), ...(team.substitutes || [])]
        const player = allPlayers.find(p => p.id === playerId)
        if (player) return { ...player, teamId: team.id, teamName: team.name, teamColor: team.color }
      }
      return null
    },
    search: (query) => {
      const q = query.toLowerCase()
      return teamsDB.filter(team =>
        team.name.toLowerCase().includes(q) ||
        team.shortName.toLowerCase().includes(q) ||
        team.city.toLowerCase().includes(q)
      )
    }
  },

  matches: {
    getAll: () => matchesDB,
    getById: (id) => getMatchById(id),
    getByTournament: (tournament) => getMatchesByTournament(tournament),
    getRecent: (count = 10) => getRecentMatches(count),
    getUpcoming: () => upcomingMatches,
    getUpcomingByGroup: (group) => getUpcomingByGroup(group),
    getByTeam: (teamId) => {
      return matchesDB.filter(match =>
        match.teamA.id === teamId || match.teamB.id === teamId
      )
    },
    getFinals: () => matchesDB.filter(match => match.stage === '总决赛')
  },

  videos: {
    getAll: () => videosDB,
    getById: (id) => getVideoById(id),
    getByTournament: (tournament) => getVideosByTournament(tournament),
    getPopular: (count = 5) => getPopularVideos(count),
    getRecent: (count = 8) => getRecentVideos(count),
    getLiveStreams: () => liveStreams,
    search: (query) => {
      const q = query.toLowerCase()
      return videosDB.filter(video =>
        video.title.toLowerCase().includes(q) ||
        video.tournament.toLowerCase().includes(q) ||
        video.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }
  },

  info: {
    getAll: () => kplInfo,
    getCurrentSeason: () => kplInfo.currentSeason,
    getNextTournament: () => kplInfo.nextTournament,
    getChallengerCupInfo: () => kplInfo.challengerCup2026,
    getHistoricalChampions: () => kplInfo.historicalChampions,
    getRecords: () => kplInfo.records
  }
}

export default api
