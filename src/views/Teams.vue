<template>
  <div class="teams-page">
    <div class="page-header">
      <div class="header-bg">
        <div class="grid-overlay"></div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
      </div>
      <div class="header-content page-container">
        <h1 class="page-title animate-slideInDown">
          <el-icon :size="28"><component :is="Trophy" /></el-icon>
          战队中心
        </h1>
        <p class="page-subtitle animate-fadeIn">18支顶级职业战队 · 荣耀征程全记录</p>
      </div>
    </div>

    <div class="stats-overview page-container animate-slideInUp">
      <div class="overview-card" v-for="(stat, index) in overviewStats" :key="index"
           :style="{ animationDelay: `${index * 0.1}s` }">
        <div class="overview-icon" :style="{ background: stat.gradient }">
          <el-icon :size="24"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="overview-info">
          <span class="overview-value">{{ stat.value }}</span>
          <span class="overview-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <div class="main-content page-container">
      <div class="filter-bar animate-slideInUp">
        <div class="filter-left">
          <el-input
            v-model="searchQuery"
            placeholder="搜索战队或选手..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
        </div>
        <div class="filter-right">
          <el-radio-group v-model="sortBy" size="default">
            <el-radio-button label="rank">排名</el-radio-button>
            <el-radio-button label="winRate">胜率</el-radio-button>
            <el-radio-button label="wins">胜场</el-radio-button>
            <el-radio-button label="points">积分</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="teams-grid-3d">
        <div 
          class="team-card-3d" 
          v-for="(team, index) in filteredTeams" 
          :key="team.id"
          @click="$router.push(`/team/${team.id}`)"
          @mousemove="handleCardMove($event, index)"
          @mouseleave="handleCardLeave(index)"
          :ref="el => cardRefs[index] = el"
          :style="{ 
            '--card-gradient': team.color,
            '--delay': `${index * 0.08}s`,
            perspective: '1000px'
          }"
        >
          <div class="card-inner" :ref="el => innerRefs[index] = el">
            <div class="card-glow" :style="{ background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${team.color}40, transparent 70%)` }"></div>
            
            <div class="card-rank-badge" :class="'rank-' + team.rank">
              <span class="rank-num">#{{ team.rank }}</span>
              <span class="rank-label" v-if="team.rank <= 3">{{ ['🥇', '🥈', '🥉'][team.rank - 1] }}</span>
            </div>

            <div class="team-logo-section">
              <div class="logo-glow" :style="{ background: team.color }"></div>
              <TeamLogo :team-id="team.id" :size="70" :logo-url="teamStore.getOfficialLogo(team) || team.logoUrl || team.logo" />
              <div class="team-name-3d">
                <h3>{{ team.name }}</h3>
                <span class="team-tag">{{ team.tagline || 'KPL职业战队' }}</span>
              </div>
            </div>

            <div class="team-stats-3d">
              <div class="stat-row">
                <div class="stat-box win">
                  <span class="stat-icon">✓</span>
                  <span class="stat-val">{{ team.wins }}</span>
                  <span class="stat-lbl">胜</span>
                </div>
                <div class="stat-divider-v"></div>
                <div class="stat-box loss">
                  <span class="stat-icon">✗</span>
                  <span class="stat-val">{{ team.losses }}</span>
                  <span class="stat-lbl">负</span>
                </div>
                <div class="stat-divider-v"></div>
                <div class="stat-box rate">
                  <span class="stat-val highlight">{{ team.winRate }}%</span>
                  <span class="stat-lbl">胜率</span>
                </div>
              </div>
              
              <div class="winrate-bar">
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: team.winRate + '%', background: `linear-gradient(90deg, #00D4FF, ${team.color})` }"></div>
                </div>
                <span class="bar-text">{{ team.winRate }}% 胜率</span>
              </div>
            </div>

            <div class="players-preview">
              <div class="player-mini" v-for="(player, pIdx) in (team.roster || []).slice(0, 5)" :key="pIdx"
                   :title="player.name + ' - ' + player.role"
                   :style="{
                 background: `linear-gradient(135deg, ${team.color}33, ${team.color}11)`,
                 borderColor: team.color + '40'
               }">
                {{ player.name.charAt(0) }}
                <span class="player-role-dot" :class="getRoleClass(player.role)"></span>
              </div>
              <div class="more-count" v-if="(team.roster || []).length > 5">+{{ (team.roster || []).length - 5 }}</div>
            </div>

            <div class="card-footer-3d">
              <div class="achievement-badges">
                <span class="badge-item trophy" v-if="team.achievements?.length > 0">
                  <el-icon><Trophy /></el-icon> {{ team.achievements.length }}冠
                </span>
                <span class="badge-item hot" v-if="team.winRate >= 70">
                  <el-icon><Promotion /></el-icon> 热门
                </span>
              </div>
              <div class="view-detail">
                <span>查看详情</span>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="analysis-section">
        <div class="section-header center">
          <h2><el-icon :size="24"><component :is="DataAnalysis" /></el-icon> 战队实力雷达分析</h2>
          <p>基于AI大数据的多维度能力评估</p>
        </div>
        
        <div class="radar-grid">
          <div class="radar-card" v-for="(team, index) in topTeams" :key="team.id"
               :style="{ animationDelay: `${index * 0.15}s` }">
            <div class="radar-header">
              <div class="radar-team-info">
                <div class="radar-avatar" :style="{ background: team.color }">{{ team.shortName }}</div>
                <div>
                  <h4>{{ team.name }}</h4>
                  <span>第{{ team.rank }}名 · 胜率{{ team.winRate }}%</span>
                </div>
              </div>
            </div>
            <div class="radar-chart-container" :ref="el => radarRefs[index] = el"></div>
          </div>
        </div>
      </div>

      <div class="heatmap-section">
        <div class="section-header">
          <h2><el-icon :size="24"><component :is="Histogram" /></el-icon> 战绩热力分布</h2>
          <p>各战队在不同时间段的胜负表现</p>
        </div>
        <div class="heatmap-chart-container" ref="heatmapRef"></div>
        <div class="heatmap-legend">
          <span class="legend-item">
            <i style="background: rgba(0,212,255,0.9)"></i> 大胜
          </span>
          <span class="legend-item">
            <i style="background: rgba(0,212,255,0.6)"></i> 小胜
          </span>
          <span class="legend-item">
            <i style="background: rgba(255,255,255,0.1)"></i> 小负
          </span>
          <span class="legend-item">
            <i style="background: rgba(255,69,69,0.7)"></i> 大负
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useTeamStore } from '@/stores/team'
import { Trophy, User, Promotion, ArrowRight, DataAnalysis, Histogram } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import TeamLogo from '@/components/TeamLogo.vue'

const teamStore = useTeamStore()
const searchQuery = ref('')
const sortBy = ref('rank')
const cardRefs = ref([])
const innerRefs = ref([])
const radarRefs = ref([])
const heatmapRef = ref(null)
let heatmapChart = null
let radarCharts = []
let lastCardMoveTime = 0
const THROTTLE_DELAY = 16

function throttle(func, delay) {
  let lastCall = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func.apply(this, args)
    }
  }
}

const overviewStats = computed(() => [
  { icon: User, value: '18', label: '参赛战队', gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)' },
  { icon: Trophy, value: '156', label: '总场次', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' },
  { icon: Promotion, value: '89', label: '平均胜率%', gradient: 'linear-gradient(135deg, #FF6B00, #FF4500)' },
  { icon: DataAnalysis, value: '12', label: '冠军队伍', gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)' }
])

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const calcWinRate = (wins, losses, fallback = 0) => {
  const w = toNum(wins)
  const l = toNum(losses)
  const total = w + l
  if (total <= 0) return Math.round(toNum(fallback) * 100) / 100
  return Math.round((w / total) * 10000) / 100
}

const filteredTeams = computed(() => {
  let teams = (teamStore.teams || []).map(t => {
    // 统一提取统计数据，处理嵌套和扁平化两种情况
    const stats = t.stats || {}
    const wins = toNum(stats.wins ?? t.wins)
    const losses = toNum(stats.losses ?? t.losses)
    return {
      ...t,
      wins,
      losses,
      winRate: calcWinRate(wins, losses, stats.winRate ?? t.winRate ?? 0),
      points: stats.points ?? t.points ?? 0,
      rank: t.springRank ?? t.rank ?? 99 // 默认给一个较大的排名
    }
  })

  // 搜索过滤
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    teams = teams.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      (t.roster || []).some(p => p.name.toLowerCase().includes(q))
    )
  }

  // 排序逻辑
  teams.sort((a, b) => {
    switch (sortBy.value) {
      case 'rank':
        return a.rank - b.rank // 排名从小到大 (1, 2, 3...)
      case 'winRate':
        return b.winRate - a.winRate // 胜率从大到小
      case 'wins':
        return b.wins - a.wins // 胜场从大到小
      case 'points':
        return b.points - a.points // 积分从大到小
      default:
        return 0
    }
  })

  return teams
})

const topTeams = computed(() => filteredTeams.value.slice(0, 6))

const throttledCardMove = throttle(function(event, index) {
  const card = cardRefs.value[index]
  const inner = innerRefs.value[index]
  if (!card || !inner) return
  
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  const rotateX = ((y - centerY) / centerY) * -8
  const rotateY = ((x - centerX) / centerX) * 8
  
  inner.style.transform = `
    perspective(1000px) 
    rotateX(${rotateX}deg) 
    rotateY(${rotateY}deg) 
    scale3d(1.02, 1.02, 1.02)
  `
  
  inner.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`)
  inner.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`)
}, THROTTLE_DELAY)

function handleCardMove(event, index) {
  throttledCardMove(event, index)
}

function handleCardLeave(index) {
  const inner = innerRefs.value[index]
  if (!inner) return
  
  inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
}

function getRoleClass(role) {
  const roleMap = {
    '对抗路': 'role-top',
    '打野': 'role-jungle',
    '中单': 'role-mid',
    '发育路': 'role-adc',
    '游走': 'role-support'
  }
  return roleMap[role] || 'role-other'
}

function initRadarCharts() {
  nextTick(() => {
    topTeams.value.forEach((team, index) => {
      const container = radarRefs.value[index]
      if (!container) return
      
      const chart = echarts.init(container, null, { renderer: 'canvas' })
      radarCharts.push(chart)
      
      const baseAbility = 60 + (10 - team.rank) * 3
      const variance = Math.random() * 15 - 7
      
      chart.setOption({
        animation: false,
        backgroundColor: 'transparent',
        radar: {
          indicator: [
            { name: '进攻能力', max: 100 },
            { name: '防守能力', max: 100 },
            { name: '团队配合', max: 100 },
            { name: '战术执行', max: 100 },
            { name: '后期运营', max: 100 },
            { name: '英雄池', max: 100 }
          ],
          shape: 'polygon',
          splitNumber: 4,
          axisName: {
            color: 'rgba(255,255,255,0.6)',
            fontSize: 11
          },
          splitLine: {
            lineStyle: { color: 'rgba(255,255,255,0.08)' }
          },
          splitArea: {
            areaStyle: {
              color: ['rgba(0,212,255,0.02)', 'rgba(0,212,255,0.04)', 'rgba(0,212,255,0.06)', 'rgba(0,212,255,0.08)']
            }
          },
          axisLine: {
            lineStyle: { color: 'rgba(255,255,255,0.1)' }
          }
        },
        series: [{
          type: 'radar',
          data: [{
            value: [
              Math.min(100, baseAbility + variance + 8),
              Math.min(100, baseAbility - variance + 5),
              Math.min(100, baseAbility + variance),
              Math.min(100, baseAbility - variance + 10),
              Math.min(100, baseAbility + variance - 3),
              Math.min(100, baseAbility + 12)
            ],
            name: team.name,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
              width: 2,
              color: team.color
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: team.color + '60' },
                { offset: 1, color: team.color + '05' }
              ])
            },
            itemStyle: {
              color: team.color,
              borderColor: '#fff',
              borderWidth: 2
            }
          }]
        }],
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(15,15,25,0.95)',
          borderColor: team.color + '50',
          textStyle: { color: '#fff', fontSize: 13 }
        }
      })
    })
  })
}

function initHeatmap() {
  nextTick(() => {
    if (!heatmapRef.value) return
    
    heatmapChart = echarts.init(heatmapRef.value, null, { renderer: 'canvas' })
    
    const teams = filteredTeams.value.slice(0, 10).map(t => t.shortName)
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
    
    const data = []
    for (let i = 0; i < teams.length; i++) {
      for (let j = 0; j < weeks.length; j++) {
        const baseScore = (10 - i) * 10 + Math.random() * 20 - 10
        const score = Math.max(-20, Math.min(20, baseScore))
        data.push([j, i, score])
      }
    }
    
    heatmapChart.setOption({
      animation: false,
      backgroundColor: 'transparent',
      tooltip: {
        position: 'top',
        formatter: function(params) {
          return `${teams[params.value[1]]} · ${weeks[params.value[0]]}<br/>表现值: ${params.value[2] > 0 ? '+' : ''}${params.value[2]}`
        },
        backgroundColor: 'rgba(15,15,25,0.95)',
        borderColor: 'rgba(0,212,255,0.3)',
        textStyle: { color: '#fff' }
      },
      grid: {
        top: 30,
        bottom: 60,
        left: 80,
        right: 30
      },
      xAxis: {
        type: 'category',
        data: weeks,
        areaStyle: { color: 'rgba(0,212,255,0.1)' },
        axisLabel: { color: 'rgba(255,255,255,0.6)' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'category',
        data: teams,
        axisLabel: { color: 'rgba(255,255,255,0.6)' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitLine: { show: false }
      },
      visualMap: {
        min: -20,
        max: 20,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 10,
        inRange: {
          color: ['#FF4444', '#FF6666', '#FFFFFF22', '#FFFFFF44', '#00D4FF66', '#00D4FF']
        },
        textStyle: { color: 'rgba(255,255,255,0.6)' },
        itemWidth: 15,
        itemHeight: 120
      },
      series: [{
        type: 'heatmap',
        data: data,
        label: {
          show: true,
          formatter: function(params) {
            return params.value[2] > 0 ? '+' + params.value[2] : params.value[2]
          },
          fontSize: 11,
          color: '#fff'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        itemStyle: {
          borderRadius: 4,
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }
      }]
    })
  })
}

onMounted(async () => {
  await teamStore.fetchOfficialTeamList()
  initRadarCharts()
  initHeatmap()
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  radarCharts.forEach(chart => chart.dispose())
  if (heatmapChart) heatmapChart.dispose()
})

function handleResize() {
  radarCharts.forEach(chart => chart.resize())
  if (heatmapChart) heatmapChart.resize()
}
</script>

<style scoped lang="scss">
.teams-page {
  min-height: 100vh;
  background: var(--bg-dark);
}

.page-header {
  position: relative;
  padding: 80px 0 60px;
  overflow: hidden;

  .header-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,212,255,0.12), transparent);

    .grid-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px);
      background-size: 50px 50px;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);

      &.orb-1 {
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(0,212,255,0.2), transparent);
        top: -150px;
        right: 5%;
        animation: float 10s ease-in-out infinite;
      }

      &.orb-2 {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(255,107,0,0.15), transparent);
        bottom: -100px;
        left: 10%;
        animation: float 12s ease-in-out infinite reverse;
      }
    }
  }

  .header-content {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .page-title {
    font-size: 42px;
    font-weight: 800;
    background: linear-gradient(135deg, #fff, #00D4FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .page-subtitle {
    font-size: 18px;
    color: rgba(255,255,255,0.6);
    letter-spacing: 2px;
  }
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid rgba(0,212,255,0.1);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(0,212,255,0.3);
    box-shadow: 0 8px 30px rgba(0,212,255,0.15);

    .overview-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }

  .overview-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: transform 0.3s;
  }

  .overview-info {
    display: flex;
    flex-direction: column;

    .overview-value {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
    }

    .overview-label {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
    }
  }
}

.main-content {
  padding-bottom: 80px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px 28px;
  background: var(--card-bg);
  border: 1px solid rgba(0,212,255,0.1);
  border-radius: 16px;

  .search-input {
    width: 300px;
  }
}

.teams-grid-3d {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  margin-bottom: 64px;
}

.team-card-3d {
  perspective: 1000px;
  cursor: pointer;
  animation: fadeInUp 0.6s both;
  animation-delay: var(--delay);

  &:hover {
    .card-inner {
      box-shadow: 0 25px 60px rgba(0,0,0,0.4), 0 0 40px var(--card-gradient);
    }
  }
}

.card-inner {
  position: relative;
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0,212,255,0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;

  .card-glow {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 1;
  }

  &:hover .card-glow {
    opacity: 1;
  }
}

.card-rank-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  padding: 8px 14px;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  &.rank-1 {
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #000;
    box-shadow: 0 4px 15px rgba(255,215,0,0.4);
  }

  &.rank-2 {
    background: linear-gradient(135deg, #C0C0C0, #A8A8A8);
    color: #000;
    box-shadow: 0 4px 15px rgba(192,192,192,0.4);
  }

  &.rank-3 {
    background: linear-gradient(135deg, #CD7F32, #B87333);
    color: #fff;
    box-shadow: 0 4px 15px rgba(205,127,50,0.4);
  }

  &:not(.rank-1):not(.rank-2):not(.rank-3) {
    background: rgba(0,212,255,0.15);
    color: #00D4FF;
    border: 1px solid rgba(0,212,255,0.3);
  }

  .rank-num {
    font-size: 16px;
  }

  .rank-label {
    font-size: 18px;
  }
}

.team-logo-section {
  text-align: center;
  padding: 36px 20px 24px;
  position: relative;

  .logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140px;
    height: 140px;
    border-radius: 50%;
    filter: blur(40px);
    opacity: 0.3;
  }

  .team-logo-3d {
    position: relative;
    width: 110px;
    height: 110px;
    margin: 0 auto 16px;
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: 800;
    color: #fff;
    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
    transition: all 0.4s;
    overflow: hidden;

    .logo-shine {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.3), transparent 50%);
      pointer-events: none;
    }

    .team-card-3d:hover & {
      transform: scale(1.08) rotateY(-5deg);
    }
  }

  .team-name-3d {
    h3 {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 6px;
    }

    .team-tag {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
    }
  }
}

.team-stats-3d {
  padding: 0 24px 20px;

  .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 16px;
    background: rgba(0,212,255,0.03);
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .stat-box {
    text-align: center;
    flex: 1;

    .stat-icon {
      display: block;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .stat-val {
      display: block;
      font-size: 24px;
      font-weight: 800;
      color: #fff;

      &.highlight {
        color: #00D4FF;
        font-size: 26px;
      }
    }

    .stat-lbl {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
    }

    &.win .stat-icon { color: #00C853; }
    &.loss .stat-icon { color: #FF4444; }
  }

  .stat-divider-v {
    width: 1px;
    height: 35px;
    background: rgba(255,255,255,0.1);
  }

  .winrate-bar {
    display: flex;
    align-items: center;
    gap: 12px;

    .bar-track {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.05);
      border-radius: 4px;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 1s ease;
      }
    }

    .bar-text {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
      white-space: nowrap;
    }
  }
}

.players-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255,255,255,0.05);

  .player-mini {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    border: 2px solid;
    transition: all 0.3s;
    position: relative;
    cursor: pointer;

    &:hover {
      transform: scale(1.15);
      z-index: 2;
    }

    .player-role-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid var(--card-bg);

      &.role-top { background: #FF6B00; }
      &.role-jungle { background: #9C27B0; }
      &.role-mid { background: #00D4FF; }
      &.role-adc { background: #00C853; }
      &.role-support { background: #FFD700; }
      &.role-other { background: #888; }
    }
  }

  .more-count {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    border: 1px dashed rgba(255,255,255,0.2);
  }
}

.card-footer-3d {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(255,255,255,0.05);

  .achievement-badges {
    display: flex;
    gap: 8px;

    .badge-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;

      &.trophy {
        background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2));
        color: #FFD700;
        border: 1px solid rgba(255,215,0,0.3);
      }

      &.hot {
        background: linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,69,0,0.2));
        color: #FF6B00;
        border: 1px solid rgba(255,107,0,0.3);
      }
    }
  }

  .view-detail {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: rgba(0,212,255,0.8);
    transition: all 0.3s;

    .team-card-3d:hover & {
      color: #00D4FF;
      transform: translateX(4px);
    }
  }
}

.analysis-section {
  margin-bottom: 64px;

  .section-header {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      font-size: 32px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    p {
      font-size: 16px;
      color: rgba(255,255,255,0.5);
    }

    &.center {
      text-align: center;
    }
  }
}

.radar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.radar-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(0,212,255,0.1);
  transition: all 0.3s;
  animation: fadeInUp 0.6s both;

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(0,212,255,0.3);
    box-shadow: 0 15px 40px rgba(0,212,255,0.15);
  }

  .radar-header {
    margin-bottom: 16px;
  }

  .radar-team-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .radar-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 2px;
    }

    span {
      font-size: 12px;
      color: rgba(255,255,255,0.5);
    }
  }

  .radar-chart-container {
    height: 260px;
  }
}

.heatmap-section {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(0,212,255,0.1);

  .section-header {
    margin-bottom: 24px;

    h2 {
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
    }
  }

  .heatmap-chart-container {
    height: 450px;
    margin-bottom: 16px;
  }

  .heatmap-legend {
    display: flex;
    justify-content: center;
    gap: 24px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: rgba(255,255,255,0.6);

      i {
        width: 20px;
        height: 14px;
        border-radius: 3px;
        display: inline-block;
      }
    }
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

@media (max-width: 1280px) {
  .teams-grid-3d {
    grid-template-columns: repeat(2, 1fr);
  }

  .radar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .teams-grid-3d {
    grid-template-columns: 1fr;
  }

  .radar-grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
