import { matchesDB } from '../data/matches'

export function calculateTeamStats(teamId) {
  const teamMatches = matchesDB.filter(m => 
    m.teamA.id === teamId || m.teamB.id === teamId
  )

  let wins = 0
  let losses = 0
  let totalKills = 0
  let totalDeaths = 0
  let totalAssists = 0
  const recentForm = []

  teamMatches.forEach(match => {
    const isTeamA = match.teamA.id === teamId
    const teamScore = isTeamA ? match.teamA.score : match.teamB.score
    const opponentScore = isTeamA ? match.teamB.score : match.teamA.score
    const won = teamScore > opponentScore

    if (won) {
      wins++
    } else {
      losses++
    }

    recentForm.push({
      date: match.date,
      result: won ? 'W' : 'L',
      score: `${teamScore}:${opponentScore}`,
      opponent: isTeamA ? match.teamB.name : match.teamA.name,
      tournament: match.tournament
    })
  })

  const totalGames = wins + losses
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0

  return {
    teamId,
    totalMatches: totalGames,
    wins,
    losses,
    winRate: parseFloat(winRate),
    recentForm: recentForm.slice(-10).reverse(),
    formString: recentForm.slice(-10).reverse().map(m => m.result).join('')
  }
}

export function calculateTeamRadarData(teamData, matchesHistory = []) {
  const stats = calculateTeamStats(teamData.id)
  
  const roster = teamData.roster || []
  
  const avgKDA = roster.length > 0 
    ? (roster.reduce((sum, p) => sum + (parseFloat(p.kd) || 0), 0) / roster.length).toFixed(1)
    : 0
  
  const avgMVP = roster.length > 0
    ? (roster.reduce((sum, p) => sum + (p.mvpCount || p.mvp || 0), 0) / roster.length).toFixed(1)
    : 0
  
  const attackScore = Math.min(100, Math.max(20, (
    parseFloat(stats.winRate) * 0.4 +
    avgKDA * 8 +
    (avgMVP * 5) +
    (teamData.achievements && teamData.achievements.length || 0) * 3
  )))

  const defenseScore = Math.min(100, Math.max(20, (
    parseFloat(stats.winRate) * 0.35 +
    (100 - avgKDA * 2) * 0.3 +
    60
  )))

  const teamworkScore = Math.min(100, Math.max(30, (
    parseFloat(stats.winRate) * 0.45 +
    (roster.filter(p => p.position === '游走').length > 0 ? 15 : 0) +
    55
  )))

  const economyScore = Math.min(100, Math.max(25, (
    parseFloat(stats.winRate) * 0.38 +
    avgKDA * 6 +
    (stats.wins > stats.losses ? 15 : -10) + 50
  )))

  const stabilityScore = Math.min(100, Math.max(20, (
    100 - (Math.abs(stats.wins - stats.losses) / Math.max(stats.totalMatches, 1) * 50) +
    (stats.totalMatches > 20 ? 10 : 0)
  )))

  return [
    Math.round(attackScore),
    Math.round(defenseScore),
    Math.round(teamworkScore),
    Math.round(economyScore),
    Math.round(stabilityScore)
  ]
}

export function getTeamHeroPool(teamData) {
  const allHeroes = {}
  const roster = teamData.roster || []
  
  for (let i = 0; i < roster.length; i++) {
    const player = roster[i]
    const heroPool = player.heroPool || []
    
    for (let j = 0; j < heroPool.length; j++) {
      const hero = heroPool[j]
      
      if (allHeroes[hero]) {
        allHeroes[hero].players.push(player.name)
        allHeroes[hero].count++
      } else {
        allHeroes[hero] = {
          name: hero,
          players: [player.name],
          count: 1,
          positions: [player.position]
        }
      }
    }
  }

  const heroesArray = Object.keys(allHeroes).map(key => allHeroes[key])
  
  return heroesArray
    .sort(function(a, b) { return b.count - a.count })
    .map(function(hero) {
      return {
        name: hero.name,
        players: hero.players,
        count: hero.count,
        positions: hero.positions,
        usageRate: ((hero.count / (roster.length || 1)) * 100).toFixed(1)
      }
    })
}

export function getMatchHeroPool(matchData, teamsDB) {
  const teamA = teamsDB.find(t => t.id === matchData.teamA.id)
  const teamB = teamsDB.find(t => t.id === matchData.teamB.id)

  const poolA = teamA ? getTeamHeroPool(teamA) : []
  const poolB = teamB ? getTeamHeroPool(teamB) : []

  return {
    teamA: {
      id: matchData.teamA.id,
      name: matchData.teamA.name,
      heroes: poolA
    },
    teamB: {
      id: matchData.teamB.id,
      name: matchData.teamB.name,
      heroes: poolB
    },
    combined: [...poolA, ...poolB]
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }
}

export function generatePerformancePrediction(teamAData, teamBData) {
  const statsA = calculateTeamStats(teamAData.id)
  const statsB = calculateTeamStats(teamBData.id)

  const radarA = calculateTeamRadarData(teamAData)
  const radarB = calculateTeamRadarData(teamBData)

  const overallStrengthA = radarA.reduce((a, b) => a + b, 0) / 5
  const overallStrengthB = radarB.reduce((a, b) => a + b, 0) / 5

  const baseProbA = (overallStrengthA / (overallStrengthA + overallStrengthB)) * 100
  const homeAdvantage = 5
  const formFactor = (parseFloat(statsA.winRate) - parseFloat(statsB.winRate)) * 0.2

  let probA = Math.min(85, Math.max(15, baseProbA + homeAdvantage + formFactor))
  let probB = 100 - probA

  probA = Math.round(probA)
  probB = Math.round(probB)

  const predictedGames = probA > 65 || probB > 65 
    ? '3-4局' 
    : probA > 55 || probB > 55 
      ? '4-5局' 
      : '可能打满7局'

  const confidence = Math.abs(probA - probB) > 20 ? '高' : 
                    Math.abs(probA - probB) > 10 ? '中' : '低'

  return {
    probA,
    probB,
    predictedGames,
    confidence,
    favorite: probA > probB ? teamAData.name : teamBData.name,
    analysis: `${probA > probB ? teamAData.name : teamBData.name}略占优势，预测${predictedGames}结束战斗，置信度：${confidence}`
  }
}

export default {
  calculateTeamStats,
  calculateTeamRadarData,
  getTeamHeroPool,
  getMatchHeroPool,
  generatePerformancePrediction
}
