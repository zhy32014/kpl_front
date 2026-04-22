<template>
  <div class="dashboard-page">
    <div class="dash-header">
      <div class="header-left">
        <h1 class="page-title">
          <el-icon :size="24"><component :is="DataAnalysis" /></el-icon>
          KPL数据大屏
        </h1>
        <p class="page-subtitle">实时赛事数据分析与可视化平台</p>
      </div>
      <div class="header-right">
        <div class="live-time">
          <span class="time-label">当前时间</span>
          <span class="time-value">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <div class="dash-grid">
      <div class="dash-card main-stats animate-slideInUp" style="--delay: 0s">
        <div class="card-header">
          <h3><el-icon :size="18"><component :is="TrendCharts" /></el-icon> 赛事总览</h3>
          <span class="update-badge">实时更新</span>
        </div>
        <div class="stats-grid">
          <div class="stat-item" v-for="(item, i) in overviewStats" :key="i">
            <div class="stat-value-wrap">
              <span class="stat-num">{{ item.value }}</span>
              <span class="stat-unit">{{ item.unit }}</span>
            </div>
            <span class="stat-name">{{ item.name }}</span>
            <div class="stat-bar">
              <div class="bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="dash-card team-ranking animate-slideInUp" style="--delay: 0.1s">
        <div class="card-header">
          <h3><el-icon :size="18"><component :is="Trophy" /></el-icon> 战队积分榜</h3>
          <el-select v-model="rankType" size="small" style="width: 100px;">
            <el-option label="胜率榜" value="winRate" />
            <el-option label="积分榜" value="points" />
          </el-select>
        </div>
        <div class="rank-list">
          <div class="rank-item" v-for="(team, idx) in rankedTeams" :key="team.id"
               :class="{ top: idx < 3 }">
            <span class="rank-pos" :class="'pos-' + (idx + 1)">{{ idx + 1 }}</span>
            <TeamLogo :team-id="team.id" :size="32" />
            <span class="team-nm">{{ team.name }}</span>
            <span class="team-stat-val">{{ rankType === 'winRate' ? team.winRate + '%' : team.points }}</span>
            <div class="mini-bar">
              <div class="mini-fill" :style="{ width: (rankType === 'winRate' ? team.winRate : team.points / 2) + '%', background: team.color }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="dash-card chart-card wide animate-slideInUp" style="--delay: 0.2s">
        <div class="card-header">
          <h3><el-icon :size="18"><component :is="DataLine" /></el-icon> 胜率趋势分析</h3>
          <div class="chart-legend">
            <span class="legend-item"><i style="background:#00D4FF"></i>AG超玩会</span>
            <span class="legend-item"><i style="background:#FF6B00"></i>DYG</span>
            <span class="legend-item"><i style="background:#9C27B0"></i>eStarPro</span>
          </div>
        </div>
        <div class="chart-container" ref="trendChartRef"></div>
      </div>

      <div class="dash-card chart-card animate-slideInUp" style="--delay: 0.3s">
        <div class="card-header">
          <h3><el-icon :size="18"><component :is="PieChart" /></el-icon> 英雄使用分布</h3>
        </div>
        <div class="chart-container" ref="heroPieRef"></div>
      </div>

      <div class="dash-card chart-card animate-slideInUp" style="--delay: 0.4s">
        <div class="card-header">
          <h3><el-icon :size="18"><component :is="Histogram" /></el-icon> 比赛时长统计</h3>
        </div>
        <div class="chart-container" ref="durationBarRef"></div>
      </div>

      <div class="dash-card live-feed animate-slideInUp" style="--delay: 0.5s">
        <div class="card-header">
          <h3><el-icon :size="18"><component :is="Bell" /></el-icon> 实时动态</h3>
          <span class="pulse-dot"></span>
        </div>
        <div class="feed-list">
          <div class="feed-item" v-for="(feed, i) in feedList" :key="i">
            <div class="feed-dot" :class="feed.type"></div>
            <div class="feed-content">
              <p>{{ feed.text }}</p>
              <span class="feed-time">{{ feed.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="dash-card hot-heroes animate-slideInUp" style="--delay: 0.6s">
        <div class="card-header">
          <h3><el-icon :size="18"><component :is="Star" /></el-icon> 热门英雄</h3>
        </div>
        <div class="hero-grid">
          <div class="hero-item" v-for="hero in hotHeroes" :key="hero.name">
            <div class="hero-icon" :style="{ background: hero.gradient }">
              {{ hero.icon }}
            </div>
            <span class="hero-name">{{ hero.name }}</span>
            <span class="hero-pick">{{ hero.pick }}%</span>
            <span class="hero-win" :class="hero.win > 50 ? 'good' : ''">{{ hero.win }}%胜</span>
          </div>
        </div>
      </div>

      <div class="dash-card performance-radar animate-slideInUp" style="--delay: 0.7s">
        <div class="card-header">
          <h3><el-icon :size="18"><component :is="Aim" /></el-icon> 选手能力雷达</h3>
          <el-select v-model="selectedPlayer" size="small" style="width: 120px;">
            <el-option v-for="p in players" :key="p.name" :label="p.name" :value="p.name" />
          </el-select>
        </div>
        <div class="chart-container" ref="radarRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  DataAnalysis, TrendCharts, Trophy, DataLine,
  PieChart, Histogram, Bell, Star, Aim
} from '@element-plus/icons-vue'
import TeamLogo from '@/components/TeamLogo.vue'

const currentTime = ref('')
const rankType = ref('winRate')
const selectedPlayer = ref('一诺')
let timeInterval = null
let resizeObserver = null
const charts = []
const isVisible = ref(false)

const overviewStats = ref([
  { value: 32, unit: '支', name: '挑战者杯参赛战队', percent: 100, color: '#8B5CF6' },
  { value: 1, unit: '座', name: '春季赛冠军（KSG）', percent: 100, color: '#FFD700' },
  { value: 1200, unit: '+', name: '英雄使用次数', percent: 85, color: '#FF6B00' },
  { value: 2.5, unit: '亿', name: '春季赛观看人次', percent: 98, color: '#9C27B0' }
])

const teams = ref([
  { id: 1, shortName: 'KSG', name: '苏州KSG', points: 42, winRate: 87.5, color: '#8B5CF6', isChampion: true },
  { id: 2, shortName: '狼队', name: '重庆狼队', points: 38, winRate: 79.2, color: '#FFD700' },
  { id: 3, shortName: 'AG', name: '成都AG超玩会', points: 36, winRate: 75.0, color: '#FF6B00' },
  { id: 4, shortName: 'TTG', name: '广州TTG', points: 34, winRate: 70.8, color: '#FF4444' },
  { id: 5, shortName: 'eS', name: '武汉eStarPro', points: 32, winRate: 66.7, color: '#FFD700' },
  { id: 6, shortName: 'WB', name: '北京WB', points: 30, winRate: 62.5, color: '#FF4500' },
  { id: 7, shortName: 'DRG', name: '佛山DRG', points: 28, winRate: 58.3, color: '#00D4FF' },
  { id: 8, shortName: 'RW', name: '济南RW侠', points: 26, winRate: 54.2, color: '#FFA500' }
])

const rankedTeams = computed(() => {
  return [...teams.value].sort((a, b) => {
    return rankType.value === 'winRate' ? b.winRate - a.winRate : b.points - a.points
  })
})

const hotHeroes = ref([
  { name: '镜', icon: '🗡', pick: 82.3, win: 54.1, gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { name: '公孙离', icon: '🏹', pick: 75.6, win: 56.2, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { name: '澜', icon: '⚔', pick: 71.8, win: 53.8, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { name: '不知火舞', icon: '🌸', pick: 68.5, win: 55.1, gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { name: '马超', icon: '🔱', pick: 64.2, win: 51.9, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { name: '大乔', icon: '🌊', pick: 59.8, win: 52.4, gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' }
])

const feedList = ref([
  { text: '🏆 苏州KSG夺得2026年KPL春季赛总冠军！今屿斩获FMVP！', type: 'highlight', time: '刚刚' },
  { text: '2026年挑战者杯抽签仪式完成！32支战队分组揭晓', type: 'info', time: '2小时前' },
  { text: '春季赛总决赛观看人数突破2568万，创历史新高', type: 'highlight', time: '5小时前' },
  { text: '挑战者杯小组赛将于4月20日正式开战', type: 'notice', time: '1天前' },
  { text: '苏州KSG官宣：全员续约，备战挑战者杯', type: 'news', time: '2天前' }
])

const players = ref([
  { name: '今屿（KSG）', position: '发育路' },
  { name: '流浪（KSG）', position: '对抗路' },
  { name: '晚星（KSG）', position: '中路' },
  { name: '小胖（狼队）', position: '打野' }
])

const trendChartRef = ref(null)
const heroPieRef = ref(null)
const durationBarRef = ref(null)
const radarRef = ref(null)

function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function initTrendChart() {
  if (!trendChartRef.value) return
  const chart = echarts.init(trendChartRef.value, null, { renderer: 'canvas' })
  charts.push(chart)
  chart.setOption({
    animation: false,
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,25,0.9)', borderColor: 'rgba(0,212,255,0.3)', textStyle: { color: '#fff' } },
    grid: { left: 50, right: 20, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: 'rgba(255,255,255,0.5)' } },
    yAxis: { type: 'value', min: 40, max: 100, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }, axisLabel: { color: 'rgba(255,255,255,0.5)' } },
    series: [
      { name: 'AG超玩会', type: 'line', smooth: true, data: [72, 78, 75, 82, 88, 91], lineStyle: { width: 3, color: '#00D4FF' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0,212,255,0.3)' }, { offset: 1, color: 'rgba(0,212,255,0)' }]) }, itemStyle: { color: '#00D4FF' } },
      { name: 'DYG', type: 'line', smooth: true, data: [65, 70, 73, 69, 76, 84], lineStyle: { width: 3, color: '#FF6B00' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(255,107,0,0.3)' }, { offset: 1, color: 'rgba(255,107,0,0)' }]) }, itemStyle: { color: '#FF6B00' } },
      { name: 'eStarPro', type: 'line', smooth: true, data: [68, 65, 72, 78, 74, 80], lineStyle: { width: 3, color: '#9C27B0' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(156,39,176,0.3)' }, { offset: 1, color: 'rgba(156,39,176,0)' }]) }, itemStyle: { color: '#9C27B0' } }
    ]
  })
}

function initHeroPieChart() {
  if (!heroPieRef.value) return
  const chart = echarts.init(heroPieRef.value, null, { renderer: 'canvas' })
  charts.push(chart)
  chart.setOption({
    animation: false,
    tooltip: { trigger: 'item', backgroundColor: 'rgba(15,15,25,0.9)', borderColor: 'rgba(0,212,255,0.3)', textStyle: { color: '#fff' } },
    legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: 'rgba(255,255,255,0.6)' }, itemWidth: 12, itemHeight: 12 },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
      itemStyle: { borderRadius: 6, borderColor: '#0a0a0f', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' } },
      data: [
        { value: 78.5, name: '镜', itemStyle: { color: '#667eea' } },
        { value: 72.1, name: '澜', itemStyle: { color: '#f093fb' } },
        { value: 68.9, name: '公孙离', itemStyle: { color: '#4facfe' } },
        { value: 65.4, name: '马超', itemStyle: { color: '#43e97b' } },
        { value: 62.8, name: '不知火舞', itemStyle: { color: '#fa709a' } },
        { value: 58.2, name: '其他', itemStyle: { color: '#607D8B' } }
      ]
    }]
  })
}

function initDurationChart() {
  if (!durationBarRef.value) return
  const chart = echarts.init(durationBarRef.value, null, { renderer: 'canvas' })
  charts.push(chart)
  chart.setOption({
    animation: false,
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,15,25,0.9)', borderColor: 'rgba(0,212,255,0.3)', textStyle: { color: '#fff' } },
    grid: { left: 60, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'value', max: 25, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: 'rgba(255,255,255,0.5)', formatter: '{value}min' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
    yAxis: { type: 'category', data: ['速胜局', '常规局', '拉锯局', '鏖战局'], axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: 'rgba(255,255,255,0.5)' } },
    series: [{
      type: 'bar', barWidth: 20,
      itemStyle: { borderRadius: [0, 4, 4, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#00D4FF' },
          { offset: 1, color: '#0066FF' }
        ])
      },
      data: [15, 35, 28, 22]
    }]
  })
}

function initRadarChart() {
  if (!radarRef.value) return
  const chart = echarts.init(radarRef.value, null, { renderer: 'canvas' })
  charts.push(chart)
  chart.setOption({
    animation: false,
    tooltip: {},
    radar: { indicator: [
      { name: '输出能力', max: 100 }, { name: '生存能力', max: 100 },
      { name: '团战贡献', max: 100 }, { name: '经济转化', max: 100 },
      { name: '地图意识', max: 100 }
    ], shape: 'polygon', splitNumber: 4, axisName: { color: 'rgba(255,255,255,0.6)' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, splitArea: { areaStyle: { color: ['rgba(0,212,255,0.02)', 'rgba(0,212,255,0.05)'] } }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
    series: [{ type: 'radar', data: [{ value: [92, 78, 88, 85, 90], name: selectedPlayer.value, areaStyle: { color: 'rgba(0,212,255,0.3)' }, lineStyle: { color: '#00D4FF', width: 2 }, itemStyle: { color: '#00D4FF' } }] }]
  })
}

function handleResize() {
  charts.forEach(chart => chart.resize())
}

let resizeTimeout = null
function debouncedResize() {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    handleResize()
    resizeTimeout = null
  }, 200)
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isVisible.value) {
        isVisible.value = true
        nextTick(() => {
          setTimeout(() => {
            initTrendChart()
            initHeroPieChart()
            initDurationChart()
            initRadarChart()
          }, 100)
        })
      }
    })
  }, { threshold: 0.1 })

  const dashboardEl = document.querySelector('.dashboard-page')
  if (dashboardEl) {
    observer.observe(dashboardEl)
  }

  resizeObserver = observer
  window.addEventListener('resize', debouncedResize)
})

onUnmounted(() => {
  clearInterval(timeInterval)
  if (resizeTimeout) clearTimeout(resizeTimeout)
  charts.forEach(chart => chart.dispose())
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', debouncedResize)
})
</script>

<style scoped lang="scss">
.dashboard-page {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #0a0a0f 0%, #0d1117 100%);
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 28px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 212, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);

  .header-left {
    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;

      .el-icon {
        color: var(--primary-color);
      }
    }

    .page-subtitle {
      margin: 0;
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }
  }

  .header-right {
    .live-time {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .time-label {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
      }

      .time-value {
        font-size: 20px;
        font-weight: 600;
        color: var(--primary-color);
        font-family: 'Courier New', monospace;
      }
    }
  }
}

.dash-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.dash-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 212, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 212, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.1);
    transform: translateY(-2px);
  }

  &.wide {
    grid-column: span 2;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        color: var(--primary-color);
      }
    }

    .update-badge {
      padding: 4px 10px;
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 20px;
      font-size: 11px;
      color: var(--primary-color);
      animation: pulse 2s infinite;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #00ff88;
      border-radius: 50%;
      animation: pulse 1.5s infinite;
    }

    .chart-legend {
      display: flex;
      gap: 12px;

      .legend-item {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.6);
        display: flex;
        align-items: center;
        gap: 4px;

        i {
          width: 10px;
          height: 10px;
          border-radius: 2px;
        }
      }
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  .stat-item {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;

    .stat-value-wrap {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 4px;

      .stat-num {
        font-size: 28px;
        font-weight: 700;
        color: #fff;
      }

      .stat-unit {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
      }
    }

    .stat-name {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.5);
      display: block;
      margin-bottom: 8px;
    }

    .stat-bar {
      height: 4px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 1s ease;
      }
    }
  }
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .rank-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }

    &.top {
      background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), transparent);
      border-left: 3px solid #ffd700;
    }

    .rank-pos {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.6);
      border-radius: 6px;

      &.pos-1 { background: linear-gradient(135deg, #ffd700, #ffb300); color: #000; }
      &.pos-2 { background: linear-gradient(135deg, #c0c0c0, #a0a0a0); color: #000; }
      &.pos-3 { background: linear-gradient(135deg, #cd7f32, #a0522d); color: #fff; }
    }

    .team-avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      color: #fff;
    }

    .team-nm {
      flex: 1;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);
    }

    .team-stat-val {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      margin-right: 8px;
    }

    .mini-bar {
      width: 60px;
      height: 4px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 2px;
      overflow: hidden;

      .mini-fill {
        height: 100%;
        border-radius: 2px;
      }
    }
  }
}

.chart-container {
  height: 220px;
  width: 100%;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 220px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.2);
    border-radius: 2px;
  }

  .feed-item {
    display: flex;
    gap: 10px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.25);
    }

    .feed-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;

      &.highlight { background: #ffd700; box-shadow: 0 0 8px rgba(255, 215, 0, 0.5); }
      &.info { background: #00D4FF; }
      &.vote { background: #9C27B0; }
      &.notice { background: #FF6B00; }
      &.news { background: #00C853; }
    }

    .feed-content {
      flex: 1;

      p {
        margin: 0 0 4px 0;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.4;
      }

      .feed-time {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.3);
      }
    }
  }
}

.hero-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;

  .hero-item {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    text-align: center;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      background: rgba(0, 0, 0, 0.3);
    }

    .hero-icon {
      width: 44px;
      height: 44px;
      margin: 0 auto 8px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }

    .hero-name {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }

    .hero-pick {
      font-size: 11px;
      color: var(--primary-color);
      margin-right: 6px;
    }

    .hero-win {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);

      &.good {
        color: #00ff88;
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 1200px) {
  .dash-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 16px;
  }

  .dash-grid {
    grid-template-columns: 1fr;
  }

  .dash-card.wide {
    grid-column: span 1;
  }
}
</style>
