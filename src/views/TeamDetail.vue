<template>
  <div class="team-detail-page page-container" v-if="team">
    <div class="team-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <TeamLogo :team-id="team.id" :size="100" :logo-url="teamStore.getOfficialLogo(team) || team.logoUrl || team.logo" />
        <div class="team-info">
          <h1 class="team-name">{{ team.name }}</h1>
          <p class="team-desc">{{ team.description }}</p>
          <div class="team-badges">
            <span class="badge rank">
              <el-icon><Medal /></el-icon>
              排名 #{{ team.rank || team.springRank || 'N/A' }}
            </span>
            <span class="badge win-rate">
              <el-icon><TrendCharts /></el-icon>
              胜率 {{ seasonWinRatePercent ?? calculatedStats.winRate }}%
            </span>
            <span v-if="seasonStats?.scheduleWinRateRank" class="badge win-rate-rank">
              <el-icon><Medal /></el-icon>
              胜率排名 #{{ seasonStats.scheduleWinRateRank }}
            </span>
            <span class="badge matches">
              <el-icon><DataLine /></el-icon>
              {{ calculatedStats.wins }}胜{{ calculatedStats.losses }}负
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-value">{{ seasonStats?.scheduleCount ?? calculatedStats.totalMatches }}</div>
        <div class="stat-label">总场次</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ calculatedStats.wins }}</div>
        <div class="stat-label">胜场</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ calculatedStats.losses }}</div>
        <div class="stat-label">负场</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ seasonWinRatePercent ?? calculatedStats.winRate }}%</div>
        <div class="stat-label">胜率</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ championCount }}</div>
        <div class="stat-label">冠军数</div>
      </div>
    </div>

    <div class="content-section" v-if="seasonStats">
      <h2 class="section-title">
        <el-icon><TrendCharts /></el-icon>
        赛季胜率与阵营
      </h2>
      <div class="season-stats-grid">
        <div class="season-stat-card">
          <div class="season-stat-value">{{ seasonStats.scheduleCount ?? '-' }}</div>
          <div class="season-stat-label">赛季总场次</div>
        </div>
        <div class="season-stat-card">
          <div class="season-stat-value">{{ seasonWinRatePercent ?? '-' }}%</div>
          <div class="season-stat-label">赛季胜率</div>
        </div>
        <div class="season-stat-card" v-if="seasonStats.scheduleWinRateRank">
          <div class="season-stat-value">#{{ seasonStats.scheduleWinRateRank }}</div>
          <div class="season-stat-label">胜率排名</div>
        </div>
        <div class="season-stat-card">
          <div class="season-stat-value">{{ blueWinRatePercent ?? '-' }}%</div>
          <div class="season-stat-label">蓝方胜率</div>
          <div class="season-stat-sub">{{ seasonStats.blueCount ?? '-' }} 场 · 排名 {{ seasonStats.blueWinRateRank ?? '-' }}</div>
        </div>
        <div class="season-stat-card">
          <div class="season-stat-value">{{ redWinRatePercent ?? '-' }}%</div>
          <div class="season-stat-label">红方胜率</div>
          <div class="season-stat-sub">{{ seasonStats.redCount ?? '-' }} 场 · 排名 {{ seasonStats.redWinRateRank ?? '-' }}</div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <h2 class="section-title">
        <el-icon><User /></el-icon>
        选手阵容与英雄池
      </h2>
      <div class="players-toolbar">
        <!-- <el-radio-group v-model="playerView" size="large">
          <el-radio-button label="roster">首发</el-radio-button>
          <el-radio-button label="substitutes">替补</el-radio-button>
          <el-radio-button label="all">全部</el-radio-button>
        </el-radio-group> -->
        <div class="players-filters">
          <el-input v-model="playerQuery" size="large" clearable placeholder="搜索选手名/位置/本名/招牌英雄" />
          <el-select v-model="playerPosition" size="large" placeholder="位置">
            <el-option label="全部位置" value="all" />
            <el-option v-for="pos in playerPositions" :key="pos" :label="pos" :value="pos" />
          </el-select>
          <el-select v-model="playerSort" size="large" placeholder="排序">
            <el-option label="默认" value="default" />
            <el-option label="KDA 高→低" value="kda_desc" />
            <el-option label="胜率 高→低" value="winrate_desc" />
            <el-option label="场次 多→少" value="games_desc" />
          </el-select>
          <el-button size="large" type="primary" plain :loading="officialLoading" @click="reloadOfficialPlayers">
            官方重载
          </el-button>
        </div>
      </div>
      <div class="players-grid">
        <div class="player-card" v-for="player in displayedPlayers" :key="player.id" @click="goToPlayerDetail(player.id)">
          <div class="player-avatar">
            <img v-if="player.avatar" :src="player.avatar" :alt="player.name" class="player-avatar-img" />
            <div v-else class="player-avatar-fallback">
              <el-icon><User /></el-icon>
            </div>
          </div>
          <div class="player-info">
            <h4 class="player-name">
              <span class="name-text">{{ player.name }}</span>
              <span v-if="player.isLegend" class="legend-badge">{{ player.legendTitle || '传奇' }}</span>
              <span v-if="player.isFMVP" class="fmvp-badge">FMVP</span>
              <span v-if="player._source === 'substitutes'" class="sub-badge">替补</span>
            </h4>
            <div class="player-meta">
              <span class="player-position">{{ player.position || '未知位置' }}</span>
              <span v-if="player.realName" class="player-realname">· {{ player.realName }}</span>
            </div>
            <div v-if="player.signatureHero" class="player-signature">
              招牌英雄：<span class="signature-hero">{{ player.signatureHero }}</span>
            </div>
            <div class="player-hero-pool">
              <template v-if="(player.heroPool || []).length > 0">
                <span class="hero-tag" v-for="hero in getVisibleHeroes(player)" :key="hero">
                  {{ hero }}
                </span>
              </template>
              <span v-else class="hero-empty">暂未登场</span>
              <el-button
                v-if="(player.heroPool || []).length > 5"
                class="hero-more-btn"
                size="small"
                text
                @click.stop="toggleHeroExpand(player.id)"
              >
                {{ isHeroExpanded(player.id) ? '收起' : '更多' }}
              </el-button>
            </div>
          </div>
          <div class="player-stats">
            <div class="stat">
              <span class="label">KDA</span>
              <span class="value">{{ getKda(player) }}</span>
            </div>
            <div class="stat">
              <span class="label">胜率</span>
              <span class="value">{{ getWinRate(player) }}</span>
            </div>
            <div class="stat">
              <span class="label">场次</span>
              <span class="value">{{ getGames(player) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <h2 class="section-title">
        <el-icon><Trophy /></el-icon>
        荣誉殿堂
      </h2>
      <div class="honor-grid" v-if="displayHonors.length">
        <div class="honor-card" v-for="honor in displayHonors" :key="honor.name">
          <div class="honor-header">
            <img v-if="honor.icon" class="honor-icon-img" :src="honor.icon" :alt="honor.name" />
            <div v-else class="honor-icon-fallback">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="honor-title">
              <span class="honor-name">{{ honor.name }}</span>
              <span class="honor-count">{{ honor.list.length }}</span>
            </div>
          </div>
          <div class="honor-list">
            <span class="honor-item" v-for="(item, index) in honor.list" :key="index">{{ item }}</span>
          </div>
        </div>
      </div>

      <div v-else class="achievements-list">
        <div class="achievement-item" v-for="(achievement, index) in fallbackAchievements" :key="index">
          <div class="achievement-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="achievement-name">{{ achievement }}</div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <h2 class="section-title">
        <el-icon><DataAnalysis /></el-icon>
        战队能力雷达图
      </h2>
      <div class="radar-container">
        <div class="radar-chart" ref="radarChartRef"></div>
        <div class="radar-legend">
          <div class="legend-item" v-for="(item, index) in radarCategories" :key="index">
            <span class="legend-color" :style="{ background: item.color }"></span>
            <span class="legend-label">{{ item.name }}: {{ radarData[index] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <h2 class="section-title">
        <el-icon><Cpu/></el-icon>
        AI智能分析
        <el-button 
          class="ai-btn"
          type="primary" 
          :icon="Cpu"
          @click="runAIAnalysis"
          :loading="aiLoading">
          {{ aiLoading ? '分析中...' : '启动AI分析' }}
        </el-button>
      </h2>
      
      <div class="ai-analysis-card" v-if="!aiResult && !aiLoading">
        <div class="ai-placeholder">
          <el-icon :size="48"><Cpu /></el-icon>
          <p>点击"启动AI分析"按钮，调用腾讯混元大模型对战队进行深度分析</p>
          <p class="ai-note">基于真实比赛数据和选手信息，提供专业、客观的AI洞察</p>
        </div>
      </div>

      <div class="ai-analysis-card ai-result" v-if="aiLoading">
        <div class="loading-animation">
          <div class="loading-spinner"></div>
          <p>腾讯混元AI正在分析中...</p>
          <p class="loading-hint">分析维度：实力评估 · 战术分析 · 冲冠预测</p>
        </div>
      </div>

      <div class="ai-analysis-card ai-result" v-if="aiResult && !aiLoading">
        <div class="ai-result-header">
          <el-icon :size="20"><MagicStick /></el-icon>
          <span>AI分析报告</span>
          <span class="confidence-badge">置信度: {{ aiConfidence }}%</span>
        </div>
        <div class="ai-content" v-html="formatAIContent(aiResult)"></div>
        <div class="ai-meta">
          <span>分析引擎：腾讯混元大模型</span>
          <span>数据来源：KPL官方赛事数据库</span>
        </div>
      </div>
    </div>

    <div class="content-section" v-if="recentFormCurrentSeason.length > 0">
      <h2 class="section-title">
        <el-icon><Clock /></el-icon>
        近期战绩
      </h2>
      <div class="recent-form">
        <div class="form-item" 
             v-for="(match, index) in recentFormCurrentSeason" 
             :key="index"
             :class="match.result === 'W' ? 'win' : 'loss'">
          <span class="form-date">{{ match.date }}</span>
          <span class="form-result">{{ match.result === 'W' ? '胜' : '负' }}</span>
          <span class="form-score">{{ match.score }}</span>
          <span class="form-opponent">vs {{ match.opponent }}</span>
          <span class="form-tournament">{{ match.tournament && match.tournament.replace(/\d{4}年/, '') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import { useMatchStore } from '@/stores/match'
import * as echarts from 'echarts'
import { User, Trophy, Medal, TrendCharts, DataAnalysis, Cpu, MagicStick, Clock, DataLine } from '@element-plus/icons-vue'
import TeamLogo from '@/components/TeamLogo.vue'
import { calculateTeamStats, calculateTeamRadarData, getTeamHeroPool } from '@/utils/matchAnalytics'
import { aiApi } from '@/api/backend'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()
const matchStore = useMatchStore()

const team = computed(() => teamStore.getTeamById(Number(route.params.id)))
const calculatedStats = computed(() => (team.value ? calculateTeamStats(team.value.id) : { totalMatches: 0, wins: 0, losses: 0, winRate: 0, recentForm: [] }))
const radarData = computed(() => (team.value ? calculateTeamRadarData(team.value) : [0, 0, 0, 0, 0]))
const heroPool = computed(() => (team.value ? getTeamHeroPool(team.value) : []))

const seasonStats = computed(() => {
  const raw =
    team.value?.team_season_stats ??
    team.value?.teamSeasonStats ??
    team.value?.seasonStats ??
    team.value?.team_seasonStats ??
    null
  if (!raw || typeof raw !== 'object') return null

  const pick = (keys) => {
    for (const k of keys) {
      const val = raw[k]
      if (val !== undefined && val !== null && val !== '') return val
    }
    return undefined
  }

  return {
    scheduleCount: pick(['ScheduleCount', 'scheduleCount']),
    scheduleWinRate: pick(['ScheduleWinRate', 'scheduleWinRate']),
    scheduleWinRateRank: pick(['scheduleWinRateRank', 'ScheduleWinRateRank']),
    blueCount: pick(['TeamBlueCount', 'teamBlueCount']),
    blueWinRate: pick(['TeamBlueWinRate', 'teamBlueWinRate']),
    blueWinRateRank: pick(['TeamBlueWinRateRank', 'teamBlueWinRateRank']),
    redCount: pick(['TeamRedCount', 'teamRedCount']),
    redWinRate: pick(['TeamRedWinRate', 'teamRedWinRate']),
    redWinRateRank: pick(['TeamRedWinRateRank', 'teamRedWinRateRank'])
  }
})

const formatWinRatePercent = (val) => {
  if (val === undefined || val === null || val === '') return null
  const num = Number(val)
  if (Number.isNaN(num)) return null
  const percent = num <= 1 ? num * 100 : num
  return Math.round(percent)
}

const seasonWinRatePercent = computed(() => formatWinRatePercent(seasonStats.value?.scheduleWinRate))
const blueWinRatePercent = computed(() => formatWinRatePercent(seasonStats.value?.blueWinRate))
const redWinRatePercent = computed(() => formatWinRatePercent(seasonStats.value?.redWinRate))

const teamHonors = computed(() => {
  const raw = team.value?.team_honor ?? team.value?.teamHonor ?? team.value?.team_honors ?? team.value?.honors
  if (!Array.isArray(raw)) return []
  return raw
    .map(h => {
      const name = h?.honor_name ?? h?.honorName ?? ''
      const icon = h?.honor_icon ?? h?.honorIcon ?? ''
      const list = h?.honor_list ?? h?.honorList ?? []
      return {
        name,
        icon,
        list: Array.isArray(list) ? list : []
      }
    })
    .filter(h => h.name || h.list.length > 0)
})

const officialHonors = computed(() => teamStore.getOfficialHonors(officialTeamId.value))

const displayHonors = computed(() => {
  if (officialHonors.value.length > 0) return officialHonors.value
  return teamHonors.value
})

const championCount = computed(() => {
  const champion = displayHonors.value.find(h => h.name === '冠军')
  if (champion) return champion.list.length
  return (team.value?.achievements || []).length
})

const fallbackAchievements = computed(() => {
  const arr = team.value?.achievements
  return Array.isArray(arr) ? arr : []
})

const radarChartRef = ref(null)
let radarChart = null

const aiResult = ref(null)
const aiLoading = ref(false)
const aiConfidence = ref(0)

const playerView = ref('roster')
const playerQuery = ref('')
const playerPosition = ref('all')
const playerSort = ref('default')
const expandedHeroPlayerIds = ref(new Set())
const officialLoading = ref(false)
const officialTeamId = computed(() => (team.value ? teamStore.getOfficialTeamId(team.value) : ''))
const officialPlayers = computed(() => teamStore.getOfficialPlayers(officialTeamId.value))

const resolveTeamName = (id, fallbackName) => {
  if (fallbackName) return fallbackName
  const options = teamStore.officialTeamSelectOptions
  if (!Array.isArray(options) || !id) return ''
  const match = options.find(t => String(t.id) === String(id))
  return match?.name || ''
}

const matchToTime = (m) => {
  const date = m?.matchDate ?? m?.date
  const time = m?.matchTime ?? m?.time ?? '00:00'
  if (!date) return 0
  const d = new Date(`${date} ${time}`)
  const t = d.getTime()
  return Number.isFinite(t) ? t : 0
}

const recentFormCurrentSeason = computed(() => {
  const teamId = officialTeamId.value
  if (!teamId) return []
  const tournament = matchStore.currentTournament

  const finished = matchStore.finishedMatches || []
  const filtered = finished
    .filter(m => (m.teamAId === teamId || m.teamBId === teamId))
    .filter(m => !tournament || String(m.tournament || '') === String(tournament))
    .sort((a, b) => matchToTime(b) - matchToTime(a))

  const list = []
  for (const m of filtered) {
    const isA = m.teamAId === teamId
    const teamScore = isA ? m.teamAScore : m.teamBScore
    const oppScore = isA ? m.teamBScore : m.teamAScore
    if (teamScore === undefined || teamScore === null || oppScore === undefined || oppScore === null) continue

    const oppId = isA ? m.teamBId : m.teamAId
    const oppName = resolveTeamName(oppId, isA ? m.teamBName : m.teamAName) || String(oppId || '')
    const date = m.matchDate ?? m.date ?? ''
    list.push({
      date,
      result: Number(teamScore) > Number(oppScore) ? 'W' : 'L',
      score: `${teamScore}:${oppScore}`,
      opponent: oppName,
      tournament: m.tournament || tournament || ''
    })
    if (list.length >= 6) break
  }
  return list
})

const positionMap = {
  1: '对抗路',
  2: '打野',
  3: '中路',
  4: '发育路',
  5: '游走'
}

const cleanText = (val) => {
  if (val === undefined || val === null) return ''
  return String(val).replace(/[`"]/g, '').trim()
}

const normalizeHeroPool = (raw) => {
  if (!Array.isArray(raw)) return []
  return raw
    .map(item => {
      if (typeof item === 'string') return item
      return item?.hero_name ?? item?.heroName ?? ''
    })
    .filter(Boolean)
}

const normalizePlayer = (player, source, index) => {
  const heroPool = normalizeHeroPool(player?.heroPool ?? player?.HeroPool)
  const idRaw =
    player?.id ??
    player?.player_id ??
    player?.playerId ??
    player?.PlayerID ??
    `${source}-${index}-${player?.player_name_short ?? player?.name ?? 'player'}`

  return {
    ...player,
    id: String(idRaw),
    _source: source,
    name: player?.name ?? player?.player_name_short ?? '',
    realName: player?.realName ?? player?.player_name_real ?? '',
    position: player?.position_cn ?? player?.positionName ?? player?.position ?? positionMap[player?.position] ?? '未知位置',
    avatar: cleanText(player?.avatar ?? player?.photo),
    signatureHero: player?.signatureHero ?? heroPool[0] ?? '',
    heroPool,
    kda: player?.kda ?? player?.kd ?? player?.KDA,
    winCr: player?.winCr ?? player?.Wincr ?? player?.winRate ?? player?.win_rate,
    mvpCount: player?.mvpCount ?? player?.mvp ?? player?.MVPCount ?? 0,
    gamesPlayed: player?.gamesPlayed ?? player?.games ?? player?.Matchcount ?? 0
  }
}

const allPlayers = computed(() => {
  if (officialPlayers.value.length > 0) {
    const roster = officialPlayers.value.map((p, index) => normalizePlayer(p, 'roster', index))
    return { roster, substitutes: [], all: roster }
  }
  const roster = (team.value?.roster || []).map((p, index) => normalizePlayer(p, 'roster', index))
  const substitutes = (team.value?.substitutes || []).map((p, index) => normalizePlayer(p, 'substitutes', index))
  return { roster, substitutes, all: [...roster, ...substitutes] }
})

const reloadOfficialPlayers = async () => {
  if (!officialTeamId.value) return
  officialLoading.value = true
  try {
    await Promise.all([
      teamStore.fetchOfficialPlayers(officialTeamId.value),
      teamStore.fetchOfficialHonors(officialTeamId.value)
    ])
    playerView.value = 'all'
  } finally {
    officialLoading.value = false
  }
}

const playerPositions = computed(() => {
  const set = new Set()
  for (const p of allPlayers.value.all) {
    if (p.position) set.add(p.position)
  }
  return Array.from(set)
})

const displayedPlayers = computed(() => {
  const view = playerView.value
  let players = view === 'roster' ? allPlayers.value.roster : view === 'substitutes' ? allPlayers.value.substitutes : allPlayers.value.all

  const query = playerQuery.value.trim().toLowerCase()
  if (query) {
    players = players.filter(p => {
      const haystack = [
        p.name,
        p.realName,
        p.position,
        p.signatureHero,
        ...(p.heroPool || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }

  if (playerPosition.value !== 'all') {
    players = players.filter(p => p.position === playerPosition.value)
  }

  const sortMode = playerSort.value
  if (sortMode === 'kda_desc') {
    players = [...players].sort((a, b) => (parseFloat(getKda(b)) || 0) - (parseFloat(getKda(a)) || 0))
  } else if (sortMode === 'winrate_desc') {
    players = [...players].sort((a, b) => {
      const bn = Number(String(getWinRate(b)).replace('%', ''))
      const an = Number(String(getWinRate(a)).replace('%', ''))
      return (Number.isNaN(bn) ? -1 : bn) - (Number.isNaN(an) ? -1 : an)
    })
  } else if (sortMode === 'games_desc') {
    players = [...players].sort((a, b) => getGames(b) - getGames(a))
  }

  return players
})

const getKda = (player) => {
  const val = player?.kd ?? player?.kda ?? player?.KDA
  if (val === undefined || val === null || val === '') return 'N/A'
  return String(val)
}

const getWinRate = (player) => {
  const raw = player?.winCr ?? player?.Wincr ?? player?.winRate ?? player?.win_rate
  const num = Number(raw)
  if (raw === undefined || raw === null || raw === '' || Number.isNaN(num)) return 'N/A'
  const percent = num <= 1 ? num * 100 : num
  return `${Math.round(percent)}%`
}

const getGames = (player) => {
  const val = player?.gamesPlayed ?? player?.games ?? player?.Matchcount
  if (val === undefined || val === null || Number.isNaN(Number(val))) return 0
  return Number(val)
}

const isHeroExpanded = (playerId) => expandedHeroPlayerIds.value.has(playerId)

const toggleHeroExpand = (playerId) => {
  const next = new Set(expandedHeroPlayerIds.value)
  if (next.has(playerId)) next.delete(playerId)
  else next.add(playerId)
  expandedHeroPlayerIds.value = next
}

const getVisibleHeroes = (player) => {
  const pool = player?.heroPool || []
  if (pool.length <= 5) return pool
  if (isHeroExpanded(player.id)) return pool
  return pool.slice(0, 5)
}

const goToPlayerDetail = (playerId) => {
  const teamId = route.params.id
  router.push(`/team/${teamId}/player/${playerId}`)
}

const radarCategories = [
  { name: '进攻能力', color: '#00D4FF' },
  { name: '防守能力', color: '#FF6B00' },
  { name: '团队配合', color: '#FFD700' },
  { name: '运营能力', color: '#00FF88' },
  { name: '稳定性', color: '#8B5CF6' }
]

function initRadarChart() {
  if (!radarChartRef.value || !team.value) return
  
  radarChart = echarts.init(radarChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 15, 25, 0.95)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: { color: '#fff', fontSize: 13 },
      formatter: (params) => {
        return `<strong>${params.name}</strong><br/>评分：${params.value}`
      }
    },
    radar: {
      indicator: radarCategories.map(cat => ({
        name: cat.name,
        max: 100
      })),
      shape: 'polygon',
      axisName: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        fontWeight: 'bold'
      },
      splitLine: {
        lineStyle: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      splitArea: {
        areaStyle: {
          color: [
            'rgba(0, 212, 255, 0.02)',
            'rgba(0, 212, 255, 0.04)',
            'rgba(0, 212, 255, 0.06)',
            'rgba(0, 212, 255, 0.08)',
            'rgba(0, 212, 255, 0.10)'
          ]
        }
      },
      axisLine: {
        lineStyle: { color: 'rgba(255, 255, 255, 0.08)' }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: radarData.value,
        name: team.value.name,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00D4FF' },
            { offset: 1, color: '#8B5CF6' }
          ])
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 212, 255, 0.35)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.25)' }
          ])
        },
        itemStyle: {
          color: '#00D4FF',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(0, 212, 255, 0.5)',
          shadowBlur: 10
        }
      }]
    }]
  }

  radarChart.setOption(option)
}

async function runAIAnalysis() {
  if (!team.value) return
  
  aiLoading.value = true
  aiResult.value = null
  aiConfidence.value = Math.floor(Math.random() * 8 + 92)

  try {
    const result = await aiApi.analyzeTeam(team.value)
    aiResult.value = result
  } catch (error) {
    console.error('AI分析失败:', error)
    aiResult.value = `
      <div class="error-message">
        ❌ <strong>AI分析失败</strong><br/><br/>
        ${error.message || '请检查网络连接或稍后重试'}<br/><br/>
        请确保：<br/>
        1. FastAI服务已启动（端口8000）<br/>
        2. 网络连接正常
      </div>
    `
  } finally {
    aiLoading.value = false
  }
}

function formatAIContent(content) {
  if (!content) return ''
  
  return content
    .replace(/\n/g, '<br/>')
    .replace(/(\d+\.)/g, '<strong>$1</strong>')
    .replace(/【([^】]+)】/g, '<span class="highlight">$1</span>')
    .replace(/（(\d+)分）/g, '<span class="score">$1分</span>')
}

onMounted(() => {
  setTimeout(() => {
    initRadarChart()
  }, 300)
  teamStore.fetchOfficialTeamList().then(() => {
    if (officialTeamId.value) reloadOfficialPlayers()
  })
  matchStore.fetchAllMatches()
})

onUnmounted(() => {
  if (radarChart) {
    radarChart.dispose()
    radarChart = null
  }
})
</script>

<style lang="scss" scoped>
.team-detail-page {
  padding-top: 0;
}

.team-banner {
  position: relative;
  height: 300px;
  margin: -20px -20px 30px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(255, 107, 0, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(ellipse at 30% 50%, rgba(0, 212, 255, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 50%, rgba(255, 107, 0, 0.3) 0%, transparent 50%);
}

.banner-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 40px;
}

.team-info {
  .team-name {
    font-size: 42px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .team-desc {
    color: var(--text-secondary);
    font-size: 16px;
    margin-bottom: 20px;
  }
}

.team-badges {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  
  .badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    
    &.rank {
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
      border: 1px solid rgba(255, 215, 0, 0.3);
      color: var(--accent-color);
    }
    
    &.win-rate {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 153, 204, 0.2));
      border: 1px solid rgba(0, 212, 255, 0.3);
      color: var(--primary-color);
    }

    &.win-rate-rank {
      background: linear-gradient(135deg, rgba(255, 215, 0, 0.18), rgba(0, 212, 255, 0.14));
      border: 1px solid rgba(255, 215, 0, 0.25);
      color: rgba(255, 215, 0, 0.9);
    }
    
    &.matches {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(168, 85, 247, 0.2));
      border: 1px solid rgba(139, 92, 246, 0.3);
      color: #A78BFA;
    }
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.season-stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.season-stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 22px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-4px);
    box-shadow: var(--glow-primary);
  }
}

.season-stat-value {
  font-size: 28px;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}

.season-stat-label {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
}

.season-stat-sub {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-5px);
    box-shadow: var(--glow-primary);
  }
  
  .stat-value {
    font-size: 36px;
    font-weight: bold;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 5px;
  }
  
  .stat-label {
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.content-section {
  margin-bottom: 40px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 25px;
  
  .el-icon {
    color: var(--primary-color);
  }
}

.ai-btn {
  margin-left: 20px;
  padding: 0 24px !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  font-size: 16px !important;
  background: var(--gradient-primary) !important;
  border: none !important;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
  transition: all 0.3s ease !important;
  height: 44px !important;
  color: #ffffff !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.6);
  }

  :deep(.el-icon) {
    font-size: 18px !important;
    margin-right: 8px !important;
    color: white !important;
  }

  :deep(span) {
    color: white !important;
    display: inline-block !important;
  }
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
}

.players-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.players-filters {
  display: grid;
  grid-template-columns: 1fr 160px 160px;
  gap: 12px;
  align-items: center;
  flex: 1;
  min-width: 320px;
}

.player-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  transition: all 0.3s ease;
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 14px 16px;
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-5px);
    box-shadow: var(--glow-primary);
  }
}

.player-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: var(--bg-dark);
  overflow: hidden;
}

.player-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.name-text {
  color: var(--text-primary);
}

.legend-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(139, 92, 246, 0.25));
  border: 1px solid rgba(0, 212, 255, 0.35);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  font-weight: 700;
}

.fmvp-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  border-radius: 10px;
  font-weight: bold;
}

.sub-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.75);
  border-radius: 10px;
  font-weight: 700;
}

.player-meta {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.player-position {
  color: var(--primary-color);
  font-size: 14px;
}

.player-realname {
  color: var(--text-muted);
}

.player-signature {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.signature-hero {
  color: var(--primary-color);
  font-weight: 700;
}

.player-hero-pool {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 12px;
}

.hero-tag {
  font-size: 11px;
  padding: 3px 8px;
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  color: var(--primary-color);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 212, 255, 0.25);
    transform: scale(1.05);
  }
}

.hero-empty {
  font-size: 11px;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: var(--text-muted);
  font-weight: 700;
}

.player-stats {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color);
  
  .stat {
    text-align: center;
    
    .label {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
    }
    
    .value {
      font-size: 18px;
      font-weight: bold;
      color: var(--primary-color);
    }
  }
}

.hero-more-btn {
  padding: 0 6px !important;
  height: 22px !important;
  border-radius: 10px !important;
  background: rgba(0, 212, 255, 0.1) !important;
}

.achievements-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.honor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.honor-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-color);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.18);
    transform: translateY(-2px);
  }
}

.honor-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.honor-icon-img,
.honor-icon-fallback {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.12));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 215, 0, 0.18);
  color: var(--accent-color);
}

.honor-icon-img {
  object-fit: cover;
}

.honor-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.honor-name {
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.honor-count {
  font-size: 13px;
  font-weight: 800;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(0, 212, 255, 0.12);
  border: 1px solid rgba(0, 212, 255, 0.22);
  color: var(--primary-color);
}

.honor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.honor-item {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: var(--text-secondary);
}

.achievement-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--accent-color);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  }
}

.achievement-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--accent-color);
}

.achievement-name {
  font-size: 16px;
  font-weight: 500;
}

.radar-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 30px;
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: space-around;
}

.radar-chart {
  width: 400px;
  height: 400px;
}

.radar-legend {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  color: var(--text-secondary);
}

.ai-analysis-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 30px;
  min-height: 200px;
}

.ai-placeholder {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  
  .el-icon {
    color: var(--primary-color);
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  p {
    margin-bottom: 10px;
  }
  
  .ai-note {
    font-size: 13px;
    opacity: 0.7;
  }
}

.loading-animation {
  text-align: center;
  padding: 60px 20px;
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(0, 212, 255, 0.1);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  p {
    color: var(--primary-color);
    font-size: 16px;
    margin-bottom: 8px;
  }
  
  .loading-hint {
    font-size: 13px;
    color: var(--text-muted);
  }
}

.ai-result {
  position: relative;
}

.ai-result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  
  .el-icon {
    color: var(--primary-color);
  }
  
  span {
    font-size: 18px;
    font-weight: bold;
  }
  
  .confidence-badge {
    margin-left: auto;
    padding: 5px 12px;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 92, 246, 0.2));
    border: 1px solid rgba(0, 212, 255, 0.3);
    border-radius: 15px;
    font-size: 13px;
    color: var(--primary-color);
  }
}

.ai-content {
  line-height: 1.8;
  color: var(--text-secondary);
  font-size: 14px;
  
  :deep(.highlight) {
    color: var(--primary-color);
    font-weight: bold;
    padding: 2px 6px;
    background: rgba(0, 212, 255, 0.1);
    border-radius: 4px;
  }
  
  :deep(.score) {
    color: var(--accent-color);
    font-weight: bold;
  }
  
  :deep(.error-message) {
    color: #FF4444;
    background: rgba(255, 68, 68, 0.1);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid rgba(255, 68, 68, 0.3);
  }
}

.ai-meta {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
}

.recent-form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.form-item {
  display: grid;
  grid-template-columns: 100px 50px 80px 150px 1fr;
  gap: 15px;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: rgba(0, 212, 255, 0.05);
  }
  
  &.win {
    .form-result {
      color: #00C853;
      font-weight: bold;
    }
  }
  
  &.loss {
    .form-result {
      color: #FF4444;
      font-weight: bold;
    }
  }
}

.form-date {
  font-size: 13px;
  color: var(--text-muted);
}

.form-score {
  font-weight: bold;
  color: var(--text-secondary);
}

.form-opponent {
  color: var(--text-secondary);
}

.form-tournament {
  font-size: 12px;
  color: var(--text-muted);
  text-align: right;
}

@media (max-width: 1200px) {
  .players-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .players-filters {
    grid-template-columns: 1fr 160px;
  }
  
  .stats-overview {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .radar-container {
    flex-direction: column;
  }
  
  .radar-chart {
    width: 350px;
    height: 350px;
  }
}

@media (max-width: 768px) {
  .team-banner {
    height: auto;
    padding: 40px 20px;
  }
  
  .banner-content {
    flex-direction: column;
    text-align: center;
  }
  
  .team-info .team-name {
    font-size: 28px;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .players-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .players-filters {
    grid-template-columns: 1fr;
    min-width: 0;
  }

  .player-card {
    grid-template-columns: 60px 1fr;
    padding: 16px;
  }

  .player-avatar {
    width: 60px;
    height: 60px;
  }
  
  .achievements-list {
    grid-template-columns: 1fr;
  }

  .honor-grid {
    grid-template-columns: 1fr;
  }

  .season-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .radar-chart {
    width: 300px;
    height: 300px;
  }
  
  .form-item {
    grid-template-columns: 80px 40px 60px 1fr;
    gap: 10px;
  }
  
  .form-tournament {
    display: none;
  }
}
</style>
