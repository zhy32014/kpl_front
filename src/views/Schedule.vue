<template>
  <div class="schedule-page page-container">
    <div class="page-header">
      <h1 class="page-title">赛事赛程</h1>
      <p class="page-subtitle">KPL职业联赛完整赛程</p>
      <div class="api-status">
        <el-button 
          type="primary" 
          size="small" 
          @click="fetchFromAPI"
          :loading="loading"
        >
          {{ loading ? '正在获取API数据...' : '从官方API刷新数据' }}
        </el-button>
        <span v-if="apiStatus" class="status-text" :class="apiStatus.type">
          {{ apiStatus.message }}
        </span>
      </div>
    </div>

    <div class="schedule-controls">
      <div class="filter-row">
        <div class="year-filter">
          <el-select v-model="selectedYear" placeholder="选择年份" size="large">
            <el-option v-for="year in years" :key="year" :label="year + '年'" :value="year" />
          </el-select>
        </div>
        <div class="season-filter">
          <el-select v-model="selectedSeason" placeholder="选择赛季" size="large">
            <el-option label="全年（S1+S2）" value="all" />
            <el-option label="春季赛（S1）" value="S1" />
            <el-option label="夏季赛（S2）" value="S2" />
          </el-select>
        </div>
        <div class="stage-filter">
          <el-select v-model="selectedStage" placeholder="全部赛事阶段" size="large">
            <el-option label="全部赛事阶段" value="all" />
            <el-option
              v-for="stage in stageOptions"
              :key="stage"
              :label="stage"
              :value="stage"
            />
          </el-select>
        </div>
        <div class="team-filter">
          <el-select v-model="selectedTeam" placeholder="全部战队" size="large">
            <el-option label="全部战队" value="all" />
            <el-option v-for="team in teams" :key="team.id" :label="team.name" :value="team.id" />
          </el-select>
        </div>
      </div>
      <div class="schedule-tabs">
        <el-radio-group v-model="activeTab" size="large">
          <el-radio-button label="upcoming">即将开始</el-radio-button>
          <el-radio-button label="finished">已结束</el-radio-button>
          <el-radio-button label="all">全部赛程</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="displayMode" size="large" class="display-mode">
          <el-radio-button label="grouped">按阶段</el-radio-button>
          <el-radio-button label="list">列表</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="matches-list">
      <div v-if="displayItems.length === 0" class="empty-state">
        <el-empty description="暂无比赛数据" />
      </div>
      <template v-for="(item, idx) in displayItems" :key="item.key">
        <div v-if="item.type === 'header'" class="stage-header" :style="{ '--item-index': idx }">
          <div class="stage-title">{{ item.stage }}</div>
          <div class="stage-count">{{ item.count }} 场</div>
        </div>
        <div v-else class="match-item" :style="{ '--item-index': idx }">
          <div class="match-date-box">
            <div class="date">{{ item.match.matchDate || item.match.date }}</div>
            <div class="time">{{ item.match.matchTime || item.match.time }}</div>
          </div>
          
          <div class="match-content">
            <div class="match-tournament">{{ item.match.tournament }}</div>
            <div class="match-stage">{{ item.match.stage }}</div>
            <div class="match-teams">
              <div class="team team-a">
                <TeamLogo :team-id="item.match.teamAId || item.match.teamA?.id || item.match.id" :logo-url="item.match.teamALogo" :size="40" />
                <span class="team-name">{{ item.match.teamAName || item.match.teamA?.name }}</span>
              </div>
              <div class="score-box">
                <template v-if="item.match.status === 'finished'">
                  <span class="score" :class="{ win: (item.match.teamAScore ?? item.match.teamA?.score ?? 0) > (item.match.teamBScore ?? item.match.teamB?.score ?? 0) }">
                    {{ item.match.teamAScore ?? item.match.teamA?.score ?? 0 }}
                  </span>
                  <span class="vs">:</span>
                  <span class="score" :class="{ win: (item.match.teamBScore ?? item.match.teamB?.score ?? 0) > (item.match.teamAScore ?? item.match.teamA?.score ?? 0) }">
                    {{ item.match.teamBScore ?? item.match.teamB?.score ?? 0 }}
                  </span>
                </template>
                <template v-else-if="item.match.status === 'live'">
                  <span class="live-score">{{ item.match.teamAScore ?? item.match.teamA?.score ?? 0 }}</span>
                  <span class="vs live">VS</span>
                  <span class="live-score">{{ item.match.teamBScore ?? item.match.teamB?.score ?? 0 }}</span>
                </template>
                <template v-else>
                  <span class="vs">VS</span>
                </template>
              </div>
              <div class="team team-b">
                <span class="team-name">{{ item.match.teamBName || item.match.teamB?.name }}</span>
                <TeamLogo :team-id="item.match.teamBId || item.match.teamB?.id || item.match.id" :logo-url="item.match.teamBLogo" :size="40" />
              </div>
            </div>
            <div class="match-extra" v-if="item.match.status === 'finished' && item.match.venue">
              <span class="venue">场馆: {{ item.match.venue }}</span>
            </div>
            <div class="data-source" v-if="item.match.dataSource">
              <span class="source-label">数据来源:</span>
              <a :href="item.match.dataSource" target="_blank" class="source-link">
                {{ item.match.dataSource.includes('qq.com') ? '腾讯官方' : item.match.dataSource.includes('weibo.cn') ? '微博官方' : '待确认' }}
              </a>
              <span v-if="item.match.verified !== undefined" class="verified-badge" :class="item.match.verified ? 'verified' : 'unverified'">
                {{ item.match.verified ? '✓ 已验证' : '? 待确认' }}
              </span>
            </div>
            <div v-if="item.match.note" class="match-note">
              {{ item.match.note }}
            </div>
          </div>
          
          <div class="match-actions">
            <span v-if="item.match.status === 'live'" class="live-indicator">LIVE</span>
            <span v-else-if="item.match.status === 'upcoming'" class="status-tag upcoming">即将开始</span>
            <span v-else class="status-tag finished">已结束</span>
            <el-button class="detail-btn" size="small" type="primary" @click.stop="goToMatchDetail(item.match.id)">详情</el-button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMatchStore } from '@/stores/match'
import { useTeamStore } from '@/stores/team'
import { useRouter } from 'vue-router'
import TeamLogo from '@/components/TeamLogo.vue'
import { matchApi } from '@/api/backend'

const matchStore = useMatchStore()
const teamStore = useTeamStore()
const router = useRouter()
const activeTab = ref('upcoming')
const displayMode = ref('grouped')
const selectedYear = ref(new Date().getFullYear())
const selectedSeason = ref('all')
const selectedStage = ref('all')
const selectedTeam = ref('all')
const loading = ref(false)
const apiStatus = ref(null)

const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
const teams = computed(() => {
  const official = teamStore.officialTeamSelectOptions
  if (Array.isArray(official) && official.length > 0) return official
  return (teamStore.teams || []).map(t => ({
    id: t.id,
    name: t.name,
    logoUrl: t.logoUrl || t.logo || ''
  }))
})

const fetchFromAPI = async () => {
  loading.value = true
  apiStatus.value = null
  
  try {
    // 1. 调用后端同步接口（后端负责从官网抓取并存库）
    const seasonIds =
      selectedSeason.value === 'all'
        ? [`KPL${selectedYear.value}S1`, `KPL${selectedYear.value}S2`]
        : [`KPL${selectedYear.value}${selectedSeason.value}`]
    const res = await matchApi.syncFromOfficial({ seasonIds })
    
    if (res.success) {
      // 2. 同步成功后，刷新 Pinia Store 里的数据
      await matchStore.fetchAllMatches()

      const upcomingCount = matchStore.upcomingMatches.length
      const finishedCount = matchStore.finishedMatches.length
      if (upcomingCount === 0 && finishedCount > 0) {
        activeTab.value = 'finished'
      } else if (upcomingCount > 0) {
        activeTab.value = 'upcoming'
      } else {
        activeTab.value = 'all'
      }
      
      apiStatus.value = {
        type: 'success',
        message: '✓ ' + (res.message || '已从官网同步最新数据')
      }
    } else {
      apiStatus.value = {
        type: 'warning',
        message: '⚠ 同步失败: ' + res.message
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
    apiStatus.value = {
      type: 'error',
      message: '✗ API 连接失败: ' + (error.response?.data?.message || error.message)
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  console.log('Schedule页面已加载')
  await teamStore.fetchOfficialTeamList()

  // 页面加载自动同步一次官网数据，再回拉后端数据
  try {
    await fetchFromAPI()
  } catch (e) {
    // 同步失败时降级为仅拉取后端当前已有数据
    await matchStore.fetchAllMatches()
  }

  const upcomingCount = matchStore.upcomingMatches.length
  const finishedCount = matchStore.finishedMatches.length
  if (upcomingCount === 0 && finishedCount > 0) {
    activeTab.value = 'finished'
  }

  console.info('数据来源说明：')
  console.info('- 赛程数据来源：后端接口 + 官网同步')
  console.info('- 历史数据来源：后端当前已存数据')
})

const stageOptions = computed(() => {
  const all = [...(matchStore.matches || []), ...(matchStore.historyMatches || [])]
  const filtered = applyYearAndSeasonFilter(all)
  const unique = new Set()
  for (const m of filtered) {
    const s = (m.stage || '').toString().trim()
    if (s) unique.add(s)
  }
  return [...unique].sort((a, b) => stageOrderWeight(a) - stageOrderWeight(b) || a.localeCompare(b, 'zh'))
})

const filteredMatches = computed(() => {
  let matches = []
  
  if (activeTab.value === 'upcoming') {
    matches = matchStore.upcomingMatches
  } else if (activeTab.value === 'finished') {
    matches = matchStore.finishedMatches
  } else {
    // 全部赛程：同时包含即将开始和已结束的比赛
    matches = [...matchStore.upcomingMatches, ...matchStore.finishedMatches]
  }
  
  matches = applyYearAndSeasonFilter(matches)
  
  // 赛事阶段筛选
  if (selectedStage.value !== 'all') {
    matches = matches.filter(match => (match.stage || '').toString() === selectedStage.value)
  }
  
  // 战队筛选
  if (selectedTeam.value !== 'all') {
    const selectedTeamInfo = teams.value.find(t => String(t.id) === String(selectedTeam.value))
    const selectedTeamName = selectedTeamInfo?.name
    const teamId = selectedTeam.value.toString()
    matches = matches.filter(match => 
      match.teamAId === teamId ||
      match.teamBId === teamId ||
      match.teamA?.id === Number(selectedTeam.value) ||
      match.teamB?.id === Number(selectedTeam.value) ||
      match.teamAName === selectedTeamName ||
      match.teamBName === selectedTeamName
    )
  }
  
  return sortMatches(matches)
})

const displayItems = computed(() => {
  const matches = filteredMatches.value || []
  if (displayMode.value === 'list') {
    return matches.map(m => ({ type: 'match', key: m.id, match: m }))
  }
  const byStage = new Map()
  for (const m of matches) {
    const stage = (m.stage || '未指定阶段').toString()
    if (!byStage.has(stage)) byStage.set(stage, [])
    byStage.get(stage).push(m)
  }

  const stages = [...byStage.keys()].sort((a, b) => stageOrderWeight(a) - stageOrderWeight(b) || a.localeCompare(b, 'zh'))
  const items = []
  for (const stage of stages) {
    const list = sortMatches(byStage.get(stage) || [])
    items.push({ type: 'header', key: `h:${stage}`, stage, count: list.length })
    for (const m of list) {
      items.push({ type: 'match', key: m.id, match: m })
    }
  }
  return items
})

const goToMatchDetail = (id) => {
  router.push(`/match/${id}`)
}

const viewReplay = (match) => {
  console.log('View replay for:', match.tournament)
  if (match.dataSource) {
    window.open(match.dataSource, '_blank')
  }
}

function applyYearAndSeasonFilter(matches) {
  let result = Array.isArray(matches) ? [...matches] : []

  if (selectedYear.value) {
    result = result.filter(m => {
      const d = m.matchDate || m.date
      if (!d) return false
      const year = new Date(d).getFullYear()
      return year === selectedYear.value
    })
  }

  if (selectedSeason.value !== 'all') {
    const seasonKeyword = selectedSeason.value === 'S1' ? '春季赛' : '夏季赛'
    result = result.filter(m => (m.tournament || '').toString().includes(seasonKeyword))
  }

  return result
}

function sortMatches(matches) {
  const list = Array.isArray(matches) ? [...matches] : []
  const dir = activeTab.value === 'finished' ? -1 : 1
  list.sort((a, b) => {
    const da = new Date((a.matchDate || a.date || '') + ' ' + (a.matchTime || a.time || '00:00')).getTime()
    const db = new Date((b.matchDate || b.date || '') + ' ' + (b.matchTime || b.time || '00:00')).getTime()
    return (da - db) * dir
  })
  //list.reverse()
  return list
}

function stageOrderWeight(stage) {
  const s = (stage || '').toString()
  if (s.includes('常规赛第一轮')) return 100
  if (s.includes('常规赛第二轮')) return 200
  if (s.includes('常规赛第三轮')) return 300
  if (s.includes('卡位赛')) return 400
  if (s.includes('胜者组第一轮')) return 500
  if (s.includes('败者组第一轮')) return 510
  if (s.includes('败者组第二轮')) return 520
  if (s.includes('败者组第三轮')) return 530
  if (s.includes('败者组半决赛')) return 540
  if (s.includes('胜者组决赛')) return 550
  if (s.includes('败者组决赛')) return 560
  if (s.includes('总决赛')) return 600
  return 999
}
</script>

<style lang="scss" scoped>
.schedule-page {
  padding-top: 30px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.api-status {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  
  .status-text {
    font-size: 14px;
    font-weight: 500;
    
    &.success {
      color: #00C853;
    }
    
    &.warning {
      color: #FF9800;
    }
    
    &.error {
      color: #ff4444;
    }
  }
}

.schedule-controls {
  margin-bottom: 30px;
}

.filter-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.year-filter,
.season-filter,
.stage-filter,
.team-filter {
  min-width: 150px;
  flex: 1;
  max-width: 200px;
}

.schedule-tabs {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.display-mode {
  margin-left: 14px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.stage-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.22);
  border-radius: 10px;
}

.stage-title {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.stage-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

// 渐入动画关键帧
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// 阶段标题动画
.stage-header {
  animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}

// 比赛卡片动画 - 使用 CSS 变量控制延迟
.match-item {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: calc(var(--item-index, 0) * 80ms);
}

.match-item {
  display: flex;
  align-items: center;
  gap: 25px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--glow-primary);
  }
}

.match-date-box {
  min-width: 100px;
  text-align: center;
  padding: 15px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 10px;
  
  .date {
    font-size: 16px;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 5px;
  }
  
  .time {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.match-content {
  flex: 1;
}

.match-tournament {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.match-stage {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.match-teams {
  display: flex;
  align-items: center;
  gap: 20px;
}

.team {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .team-name {
    font-size: 16px;
    font-weight: 500;
  }
}

.team-b {
  flex-direction: row-reverse;
}

.score-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  
  .score {
    font-size: 24px;
    font-weight: bold;
    color: var(--text-secondary);
    
    &.win {
      color: #00C853;
    }
  }
  
  .vs {
    font-size: 14px;
    color: var(--text-muted);
    
    &.live {
      color: #ff4444;
      animation: pulse 1s infinite;
    }
  }
  
  .live-score {
    font-size: 24px;
    font-weight: bold;
    color: #ff4444;
  }
}

.match-extra {
  display: flex;
  gap: 20px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-muted);
  
  .mvp {
    color: var(--accent-color);
  }
}

.data-source {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 10px;
  background: rgba(0, 212, 255, 0.05);
  border-radius: 6px;
  font-size: 11px;
  
  .source-label {
    color: var(--text-muted);
    font-weight: 500;
  }
  
  .source-link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .verified-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
    
    &.verified {
      background: rgba(0, 200, 83, 0.1);
      color: #00C853;
    }
    
    &.unverified {
      background: rgba(255, 152, 0, 0.1);
      color: #FF9800;
    }
  }
}

.match-note {
  margin-top: 5px;
  padding: 4px 8px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
  font-size: 11px;
  color: #FFC107;
  font-style: italic;
}

.match-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 100px;
}

.detail-btn {
  height: 30px;
  padding: 0 14px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.95), rgba(139, 92, 246, 0.95));
  box-shadow: 0 8px 18px rgba(0, 212, 255, 0.18);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.detail-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
  box-shadow: 0 10px 22px rgba(0, 212, 255, 0.24);
}

.detail-btn:active {
  transform: translateY(0);
  filter: brightness(0.98);
}

.status-tag {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  
  &.upcoming {
    background: rgba(0, 212, 255, 0.2);
    color: var(--primary-color);
  }
  
  &.finished {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-muted);
  }
}

.live-indicator {
  padding: 4px 12px;
  background: #ff4444;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

@media (max-width: 768px) {
  .schedule-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .match-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .match-date-box {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  
  .match-teams {
    flex-direction: column;
    gap: 10px;
  }
  
  .team, .team-b {
    flex-direction: row;
    justify-content: center;
  }
  
  .match-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .match-extra {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
