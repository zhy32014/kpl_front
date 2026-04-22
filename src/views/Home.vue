<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-bg">
        <div class="grid-overlay"></div>
        <div class="particle-field" ref="particleField"></div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="glow-orb orb-3"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-badge animate-pulse" v-if="liveMatch">
          <span class="badge-dot"></span>
          <span>LIVE 正在直播</span>
          <span class="badge-arrow">→</span>
        </div>

        <h1 class="hero-title">
          <span class="title-line">王者荣耀职业联赛</span>
          <span class="title-main">
            <span class="char" v-for="(char, i) in '2026 挑战者杯'" :key="i" :style="{ animationDelay: `${i * 0.08}s` }">{{ char }}</span>
          </span>
        </h1>
        
        <p class="hero-subtitle">
          <span class="sub-text">热血对决</span>
          <span class="divider">·</span>
          <span class="sub-text">荣耀巅峰</span>
          <span class="divider">·</span>
          <span class="sub-text">见证传奇</span>
        </p>

        <div class="hero-actions">
          <el-button type="primary" size="large" class="action-btn primary" @click="$router.push('/live')">
            <el-icon><VideoPlay /></el-icon>
            <span>观看直播</span>
            <div class="btn-glow"></div>
          </el-button>
          <el-button size="large" class="action-btn secondary" @click="$router.push('/schedule')">
            <el-icon><Calendar /></el-icon>
            <span>查看赛程</span>
          </el-button>
          <el-button size="large" class="action-btn accent" @click="$router.push('/ai-analysis')">
            <el-icon><Cpu /></el-icon>
            <span>AI分析</span>
          </el-button>
        </div>

        <div class="scroll-hint">
          <div class="scroll-mouse">
            <div class="mouse-wheel"></div>
          </div>
          <span>向下滚动探索更多</span>
        </div>
      </div>

      <div class="hero-live-card" v-if="liveMatch" @click="$router.push('/live')">
        <div class="live-header">
          <span class="live-indicator-small"></span>
          <span>正在直播</span>
        </div>
        <div class="live-match-info">
          <div class="team-mini">{{ liveMatch.teamA.name }}</div>
          <div class="score-display">
            <span class="score-a">{{ liveMatch.teamA.score }}</span>
            <span class="vs-text">VS</span>
            <span class="score-b">{{ liveMatch.teamB.score }}</span>
          </div>
          <div class="team-mini">{{ liveMatch.teamB.name }}</div>
        </div>
        <div class="live-stage">{{ liveMatch.stage }} · 第{{ liveMatch.currentGame }}局</div>
      </div>
    </section>

    <section class="stats-section">
      <div class="stats-container page-container">
        <div class="stat-card animate-slideInUp" v-for="(stat, index) in statsData" :key="index" 
             :style="{ animationDelay: `${index * 0.15}s` }">
          <div class="stat-icon-wrap" :style="{ background: stat.gradient }">
            <el-icon :size="28"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              <span class="value-number">{{ stat.value }}</span>
              <span class="value-unit">{{ stat.unit }}</span>
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            <el-icon><Top v-if="stat.trend > 0" /><Bottom v-else /></el-icon>
            <span>{{ Math.abs(stat.trend) }}%</span>
          </div>
        </div>
      </div>
    </section>

    <section class="live-match-section" v-if="liveMatch">
      <div class="page-container">
        <div class="section-header animate-slideInLeft">
          <h2 class="section-title">
            <el-icon><VideoCamera /></el-icon>
            实时对决
          </h2>
          <router-link to="/live" class="view-all-btn">
            进入直播间
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        
        <div class="live-match-showcase hover-lift animate-slideInRight">
          <div class="showcase-bg"></div>
          <div class="showcase-content">
            <div class="match-stage-tag">{{ liveMatch.stage }}</div>
            
            <div class="teams-battle">
              <div class="team-side team-left">
                <TeamLogo :team-id="liveMatch.teamA.id" :size="70" />
                <div class="team-detail">
                  <h3>{{ liveMatch.teamA.name }}</h3>
                  <span class="region">主场战队</span>
                </div>
                <div class="team-score-lg score-blue">{{ liveMatch.teamA.score }}</div>
              </div>

              <div class="battle-center">
                <div class="vs-circle">
                  <span class="vs-text">VS</span>
                  <div class="game-indicator">第{{ liveMatch.currentGame }}局</div>
                </div>
              </div>

              <div class="team-side team-right">
                <div class="team-score-lg score-orange">{{ liveMatch.teamB.score }}</div>
                <div class="team-detail">
                  <h3>{{ liveMatch.teamB.name }}</h3>
                  <span class="region">客场战队</span>
                </div>
                <TeamLogo :team-id="liveMatch.teamB.id" :size="70" />
              </div>
            </div>

            <div class="match-actions-row">
              <button class="watch-now-btn" @click="$router.push('/live')">
                <el-icon><VideoPlay /></el-icon>
                立即观看
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="teams-section">
      <div class="page-container">
        <div class="section-header animate-slideInLeft">
          <h2 class="section-title">
            <el-icon><Medal /></el-icon>
            战队风云榜
          </h2>
          <router-link to="/teams" class="view-all-btn">
            查看全部
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        
        <div class="teams-showcase">
          <div class="team-showcase-card animate-slideInUp hover-lift" 
               v-for="(team, index) in topTeams" 
               :key="team.id"
               :style="{ animationDelay: `${index * 0.12}s` }"
               @click="$router.push(`/team/${team.id}`)">
            <div class="card-glow" :style="{ background: team.color }"></div>
            <div class="rank-number" :class="`rank-${team.rank}`">{{ team.rank }}</div>
            <TeamLogo :team-id="team.id" :size="60" />
            <div class="team-info-area">
              <h4 class="team-name">{{ team.name }}</h4>
              <div class="team-stats-mini">
                <span class="win-stat"><strong>{{ team.wins }}</strong>胜</span>
                <span class="lose-stat"><strong>{{ team.losses }}</strong>负</span>
                <span class="rate-stat"><strong>{{ team.winRate }}%</strong></span>
              </div>
            </div>
            <div class="team-progress-bar">
              <div class="progress-fill" :style="{ width: `${team.winRate}%`, background: `linear-gradient(90deg, ${team.color}, ${team.color}66)` }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="page-container">
        <div class="section-header" style="justify-content: center;">
          <h2 class="section-title" style="margin-bottom: 10px;">
            <el-icon><MagicStick /></el-icon>
            核心功能
          </h2>
          <p style="color: var(--text-muted); text-align: center; margin-top: 20px;">
            融合腾讯AI技术，打造专业电竞数据平台
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card glass-effect animate-slideInUp hover-lift" v-for="(feature, index) in features" :key="feature.id"
               :style="{ animationDelay: `${index * 0.12}s` }"
               @click="$router.push(feature.link)">
            <div class="feature-icon-wrap" :style="{ background: feature.gradient }">
              <el-icon :size="32"><component :is="feature.icon" /></el-icon>
              <div class="icon-glow"></div>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-desc">{{ feature.desc }}</p>
            <div class="feature-tags">
              <span class="tag" v-for="tag in feature.tags" :key="tag">{{ tag }}</span>
            </div>
            <div class="feature-action">
              <span>立即体验</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="highlights-section">
      <div class="page-container">
        <div class="section-header animate-slideInLeft">
          <h2 class="section-title">
            <el-icon><Star /></el-icon>
            精彩时刻
          </h2>
          <router-link to="/live" class="view-all-btn">
            更多回放
            <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>

        <div class="highlights-grid">
          <div class="highlight-card main-highlight hover-lift animate-slideInLeft">
            <div class="highlight-thumb">
              <div class="thumb-gradient"></div>
              <div class="play-overlay">
                <div class="play-btn-large">
                  <el-icon :size="36"><VideoPlay /></el-icon>
                </div>
              </div>
              <div class="duration-badge">45:32</div>
              <div class="views-badge">
                <el-icon><View /></el-icon>
                128万
              </div>
            </div>
            <div class="highlight-body">
              <h4>苏州KSG vs 重庆狼队 春季赛总决赛</h4>
              <div class="highlight-meta">
                <span class="date">2026-04-10</span>
                <span class="tag-hot">冠军战</span>
                <span class="mvp-tag">MVP: 今屿（KSG）</span>
              </div>
            </div>
          </div>

          <div class="highlight-cards-col">
            <div class="highlight-card small hover-lift animate-slideInRight" v-for="i in 2" :key="i">
              <div class="highlight-thumb small">
                <div class="play-overlay">
                  <el-icon :size="24"><VideoPlay /></el-icon>
                </div>
                <span class="duration-badge">38:21</span>
              </div>
              <div class="highlight-body">
                <h5>eStarPro vs TTG 精彩团战</h5>
                <span class="meta-sm">12.5万观看</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="ai-promo-section">
      <div class="page-container">
        <div class="ai-promo-card gradient-border hover-lift">
          <div class="promo-bg-effects">
            <div class="effect-circle c1"></div>
            <div class="effect-circle c2"></div>
            <div class="effect-circle c3"></div>
          </div>
          <div class="promo-content">
            <div class="promo-left">
              <div class="ai-badge">
                <el-icon><Cpu /></el-icon>
                <span>腾讯AI驱动</span>
              </div>
              <h2>AI智能数据分析系统</h2>
              <p>基于深度学习算法，为每场比赛提供多维度数据洞察、选手能力评估、战术预测建议，助力电竞产业数字化转型。</p>
              <div class="promo-features">
                <div class="promo-feature">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>比赛数据深度分析</span>
                </div>
                <div class="promo-feature">
                  <el-icon><UserFilled /></el-icon>
                  <span>选手能力精准评估</span>
                </div>
                <div class="promo-feature">
                  <el-icon><TrendCharts /></el-icon>
                  <span>战术走势智能预测</span>
                </div>
              </div>
            </div>
            <div class="promo-right">
              <el-button type="warning" size="large" class="ai-enter-btn" @click="$router.push('/ai-analysis')">
                <span>进入AI分析中心</span>
                <el-icon><ArrowRight /></el-icon>
              </el-button>
              <div class="tech-stack">
                <span>Tech Stack:</span>
                <span class="tech-item">TensorFlow</span>
                <span class="tech-item">PyTorch</span>
                <span class="tech-item">NLP</span>
                <span class="tech-item">CV</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTeamStore } from '@/stores/team'
import { useMatchStore } from '@/stores/match'
import {
  VideoPlay, Calendar, Cpu, VideoCamera, Medal, Star,
  Top, Bottom, ArrowRight, MagicStick, DataAnalysis,
  UserFilled, TrendCharts, View, Trophy, User, ChatDotRound
} from '@element-plus/icons-vue'
import TeamLogo from '@/components/TeamLogo.vue'

const teamStore = useTeamStore()
const matchStore = useMatchStore()
const particleField = ref(null)

const topTeams = computed(() => teamStore.topTeams)
const liveMatch = computed(() => matchStore.liveMatch)

const statsData = ref([
  { icon: User, value: 32, unit: '支', label: '参赛战队', trend: 78, gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)' },
  { icon: Trophy, value: 1, unit: '座', label: '春季赛冠军', trend: 100, gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' },
  { icon: Star, value: 160, unit: '+', label: '明星选手', trend: 33, gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' },
  { icon: View, value: 2.5, unit: '亿', label: '累计观看', trend: 45, gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)' }
])

const features = ref([
  {
    id: 1,
    title: '实时数据追踪',
    desc: '毫秒级赛事数据更新，全方位比赛信息呈现',
    icon: DataAnalysis,
    link: '/dashboard',
    tags: ['数据可视化', '实时同步'],
    gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)'
  },
  {
    id: 2,
    title: 'AI智能分析',
    desc: '腾讯AI技术加持，深度解析赛事与选手能力',
    icon: Cpu,
    link: '/ai-analysis',
    tags: ['机器学习', '智能预测'],
    gradient: 'linear-gradient(135deg, #FF6B00, #FF4500)'
  },
  {
    id: 3,
    title: '高清直播回放',
    desc: '4K超清画质，多角度观赛体验',
    icon: VideoCamera,
    link: '/live',
    tags: ['4K画质', '多机位'],
    gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)'
  },
  {
    id: 4,
    title: '社区互动',
    desc: '万千玩家汇聚，分享电竞热爱',
    icon: ChatDotRound,
    link: '/community',
    tags: ['弹幕互动', '话题讨论'],
    gradient: 'linear-gradient(135deg, #00C853, #69F0AE)'
  }
])

onMounted(() => {
  createParticles()
})

function createParticles() {
  if (!particleField.value) return
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.left = Math.random() * 100 + '%'
    particle.style.top = Math.random() * 100 + '%'
    particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px')
    particle.style.setProperty('--ty', (Math.random() - 0.5) * 200 + 'px')
    particle.style.animationDelay = Math.random() * 3 + 's'
    particle.style.background = Math.random() > 0.5 ? 'var(--primary-color)' : 'var(--secondary-color)'
    particleField.value.appendChild(particle)
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  overflow-x: hidden;
}

.hero-section {
  position: relative;
  height: 100vh;
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;

  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  }

  .glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;

    &.orb-1 {
      width: 500px;
      height: 500px;
      background: var(--primary-color);
      top: -150px;
      left: -100px;
      animation: orbFloat 8s ease-in-out infinite;
    }

    &.orb-2 {
      width: 400px;
      height: 400px;
      background: var(--secondary-color);
      bottom: -100px;
      right: -50px;
      animation: orbFloat 10s ease-in-out infinite reverse;
    }

    &.orb-3 {
      width: 300px;
      height: 300px;
      background: #8A2BE2;
      top: 40%;
      right: 20%;
      opacity: 0.25;
      animation: orbFloat 12s ease-in-out infinite;
    }
  }

  .particle-field {
    position: absolute;
    inset: 0;

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      animation: particleFloat 4s ease-out forwards infinite;
    }
  }
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 30px) scale(0.95); }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  background: rgba(255, 0, 0, 0.12);
  border: 1px solid rgba(255, 68, 68, 0.35);
  border-radius: 30px;
  font-size: 13px;
  color: #ff4444;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 28px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 0, 0, 0.2);
    box-shadow: 0 0 25px rgba(255, 0, 0, 0.3);

    .badge-arrow {
      transform: translateX(4px);
    }
  }

  .badge-dot {
    width: 8px;
    height: 8px;
    background: #ff0000;
    border-radius: 50%;
    animation: pulse 1s ease-in-out infinite;
    box-shadow: 0 0 10px #ff0000;
  }

  .badge-arrow {
    transition: transform 0.3s ease;
  }
}

.hero-title {
  margin-bottom: 18px;

  .title-line {
    display: block;
    font-size: 22px;
    color: var(--text-secondary);
    font-weight: 400;
    letter-spacing: 8px;
    margin-bottom: 16px;
    opacity: 0.85;
  }

  .title-main {
    display: block;
    font-size: 64px;
    font-weight: 900;
    letter-spacing: 6px;

    .char {
      display: inline-block;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 50%, var(--accent-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      opacity: 0;
      animation: charReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      filter: drop-shadow(0 0 30px rgba(0, 212, 255, 0.4));
    }
  }

  @keyframes charReveal {
    from {
      opacity: 0;
      transform: translateY(40px) rotateX(-90deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotateX(0);
    }
  }
}

.hero-subtitle {
  font-size: 17px;
  color: var(--text-secondary);
  margin-bottom: 38px;
  letter-spacing: 6px;

  .divider {
    margin: 0 12px;
    color: var(--primary-color);
    opacity: 0.5;
  }
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 50px;

  .action-btn {
    padding: 14px 32px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &.primary {
      background: var(--gradient-primary) !important;
      border: none !important;
      box-shadow: 0 4px 25px rgba(0, 212, 255, 0.4);

      &:hover {
        transform: translateY(-4px) scale(1.03);
        box-shadow: 0 8px 40px rgba(0, 212, 255, 0.6);
      }
    }

    &.secondary {
      background: var(--bg-card) !important;
      border: 1px solid var(--border-color) !important;
      color: var(--text-primary) !important;

      &:hover {
        border-color: var(--primary-color) !important;
        box-shadow: var(--glow-primary);
        transform: translateY(-4px);
      }
    }

    &.accent {
      background: linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 215, 0, 0.2)) !important;
      border: 1px solid rgba(255, 107, 0, 0.4) !important;
      color: var(--secondary-color) !important;

      &:hover {
        background: linear-gradient(135deg, rgba(255, 107, 0, 0.3), rgba(255, 215, 0, 0.3)) !important;
        transform: translateY(-4px);
      }
    }
  }
}

.scroll-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
  font-size: 12px;
  animation: scrollHintFloat 2s ease-in-out infinite;

  .scroll-mouse {
    width: 24px;
    height: 38px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    position: relative;

    .mouse-wheel {
      position: absolute;
      top: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 3px;
      height: 8px;
      background: var(--primary-color);
      border-radius: 2px;
      animation: wheelScroll 1.5s ease-in-out infinite;
    }
  }
}

@keyframes scrollHintFloat {
  0%, 100% { opacity: 0.5; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-8px); }
}

@keyframes wheelScroll {
  0% { top: 6px; opacity: 1; }
  100% { top: 18px; opacity: 0; }
}

.hero-live-card {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 16px;
  padding: 18px 24px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 280px;

  &:hover {
    transform: scale(1.05);
    border-color: #ff4444;
    box-shadow: 0 10px 40px rgba(255, 0, 0, 0.3);
  }

  .live-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #ff4444;
    font-weight: 600;
    margin-bottom: 12px;
    letter-spacing: 1px;

    .live-indicator-small {
      width: 7px;
      height: 7px;
      background: #ff0000;
      border-radius: 50%;
      animation: pulse 1s infinite;
    }
  }

  .live-match-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;

    .team-mini {
      font-size: 13px;
      font-weight: 600;
    }

    .score-display {
      display: flex;
      align-items: center;
      gap: 12px;

      .score-a, .score-b {
        font-size: 26px;
        font-weight: 900;
      }

      .score-a { color: var(--primary-color); }
      .score-b { color: var(--secondary-color); }

      .vs-text {
        font-size: 12px;
        color: var(--text-muted);
      }
    }
  }

  .live-stage {
    font-size: 11px;
    color: var(--text-muted);
    text-align: center;
  }
}

.stats-section {
  position: relative;
  z-index: 10;
  margin-top: -80px;
  padding-bottom: 20px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-6px);
    box-shadow: var(--glow-primary);
  }

  .stat-icon-wrap {
    width: 58px;
    height: 58px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  .stat-content {
    flex: 1;

    .stat-value {
      display: flex;
      align-items: baseline;
      gap: 4px;
      margin-bottom: 4px;

      .value-number {
        font-size: 32px;
        font-weight: 900;
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .value-unit {
        font-size: 16px;
        color: var(--text-secondary);
        font-weight: 600;
      }
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-muted);
    }
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;

    &.up {
      color: #00C853;
      background: rgba(0, 200, 83, 0.1);
    }

    &.down {
      color: #FF5252;
      background: rgba(255, 82, 82, 0.1);
    }
  }
}

.live-match-section {
  padding: 50px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 20px;
  background: rgba(0, 212, 255, 0.08);
  border: 1px solid rgba(0, 212, 255, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 212, 255, 0.15);
    border-color: var(--primary-color);
    transform: translateX(4px);
  }
}

.live-match-showcase {
  position: relative;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 68, 68, 0.2);
  border-radius: 20px;
  overflow: hidden;
  opacity: 0;

  .showcase-bg {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(135deg, rgba(255, 0, 0, 0.05), transparent 50%),
      linear-gradient(225deg, rgba(0, 212, 255, 0.05), transparent 50%);
  }

  .showcase-content {
    position: relative;
    z-index: 1;
    padding: 40px;
  }

  .match-stage-tag {
    display: inline-block;
    padding: 6px 16px;
    background: rgba(255, 68, 68, 0.15);
    border: 1px solid rgba(255, 68, 68, 0.3);
    border-radius: 20px;
    font-size: 12px;
    color: #ff4444;
    margin-bottom: 30px;
  }

  .teams-battle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 35px;
  }

  .team-side {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;

    &.team-right {
      flex-direction: row-reverse;
      text-align: right;
    }
  }

  .team-logo-lg {
    width: 80px;
    height: 80px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 800;
    color: white;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .team-detail h3 {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .team-detail .region {
    font-size: 12px;
    color: var(--text-muted);
  }

  .team-score-lg {
    font-size: 42px;
    font-weight: 900;

    &.score-blue { color: var(--primary-color); text-shadow: 0 0 30px rgba(0, 212, 255, 0.5); }
    &.score-orange { color: var(--secondary-color); text-shadow: 0 0 30px rgba(255, 107, 0, 0.5); }
  }

  .battle-center {
    .vs-circle {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px solid var(--border-color);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);

      .vs-text {
        font-size: 20px;
        font-weight: 900;
        color: var(--text-muted);
      }

      .game-indicator {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 2px;
      }
    }
  }

  .match-actions-row {
    text-align: center;

    .watch-now-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 14px 40px;
      background: linear-gradient(135deg, #ff0000, #cc0000);
      border: none;
      border-radius: 30px;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 25px rgba(255, 0, 0, 0.4);

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 40px rgba(255, 0, 0, 0.5);
      }
    }
  }
}

.teams-section {
  padding: 50px 0;
}

.teams-showcase {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.team-showcase-card {
  position: relative;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  overflow: hidden;
  opacity: 0;

  .card-glow {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    .card-glow { opacity: 1; }
  }

  .rank-number {
    position: absolute;
    top: 16px;
    left: 16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
  }

  .team-logo-area {
    width: 70px;
    height: 70px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;

    .logo-text {
      font-size: 22px;
      font-weight: 800;
      color: white;
    }
  }

  .team-info-area {
    text-align: center;
    margin-bottom: 16px;

    .team-name {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .team-stats-mini {
      display: flex;
      justify-content: center;
      gap: 12px;
      font-size: 12px;
      color: var(--text-secondary);

      strong { color: var(--text-primary); }
    }
  }

  .team-progress-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      border-radius: 2px;
      transition: width 0.6s ease;
    }
  }
}

.features-section {
  padding: 60px 0;
  background: linear-gradient(180deg, transparent, rgba(138, 43, 226, 0.03), transparent);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.feature-card {
  padding: 30px 24px;
  border-radius: 18px;
  text-align: center;
  opacity: 0;
  cursor: pointer;

  .feature-icon-wrap {
    width: 72px;
    height: 72px;
    margin: 0 auto 20px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;

    .icon-glow {
      position: absolute;
      inset: -4px;
      border-radius: 22px;
      background: inherit;
      filter: blur(15px);
      opacity: 0.4;
    }
  }

  .feature-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .feature-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 16px;
  }

  .feature-tags {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 18px;

    .tag {
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 6px;
      font-size: 11px;
      color: var(--text-secondary);
    }
  }

  .feature-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--primary-color);
    font-size: 13px;
    font-weight: 500;
  }
}

.highlights-section {
  padding: 50px 0;
}

.highlights-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.highlight-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  opacity: 0;

  &.main-highlight {
    .highlight-thumb {
      height: 300px;
    }
  }

  &.small {
    .highlight-thumb {
      height: 140px;
    }
  }

  .highlight-thumb {
    position: relative;
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15), rgba(255, 107, 0, 0.15));

    .thumb-gradient {
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300D4FF' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    .play-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.2);
      transition: background 0.3s ease;

      .play-btn-large {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.6);
        border: 2px solid var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        transition: all 0.3s ease;
      }
    }

    &:hover {
      .play-overlay {
        background: rgba(0, 0, 0, 0.4);

        .play-btn-large {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
        }
      }
    }

    .duration-badge {
      position: absolute;
      bottom: 10px;
      left: 10px;
      padding: 4px 10px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 6px;
      font-size: 12px;
    }

    .views-badge {
      position: absolute;
      bottom: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 6px;
      font-size: 12px;
    }
  }

  .highlight-body {
    padding: 16px 20px;

    h4 { font-size: 15px; font-weight: 600; margin-bottom: 10px; }
    h5 { font-size: 13px; font-weight: 600; margin-bottom: 6px; }

    .highlight-meta {
      display: flex;
      gap: 10px;
      font-size: 12px;

      .date { color: var(--text-muted); }
      .tag-hot { color: var(--secondary-color); }
      .mvp-tag { color: var(--accent-color); }
    }

    .meta-sm { color: var(--text-muted); font-size: 12px; }
  }

  .highlight-cards-col {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.ai-promo-section {
  padding: 50px 0 80px;
}

.ai-promo-card {
  position: relative;
  background: var(--bg-card);
  border-radius: 24px;
  padding: 50px;
  overflow: hidden;

  .promo-bg-effects {
    position: absolute;
    inset: 0;
    pointer-events: none;

    .effect-circle {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);

      &.c1 {
        width: 250px;
        height: 250px;
        background: rgba(255, 107, 0, 0.15);
        top: -80px;
        right: 20%;
      }

      &.c2 {
        width: 180px;
        height: 180px;
        background: rgba(0, 212, 255, 0.12);
        bottom: -60px;
        left: 15%;
      }

      &.c3 {
        width: 120px;
        height: 120px;
        background: rgba(255, 215, 0, 0.1);
        top: 30%;
        left: 50%;
      }
    }
  }

  .promo-content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 50px;
    align-items: center;
  }

  .promo-left {
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      background: linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 215, 0, 0.2));
      border: 1px solid rgba(255, 107, 0, 0.3);
      border-radius: 20px;
      font-size: 13px;
      color: var(--secondary-color);
      font-weight: 600;
      margin-bottom: 20px;
    }

    h2 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 16px;
      background: linear-gradient(135deg, var(--secondary-color), var(--accent-color));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      color: var(--text-secondary);
      line-height: 1.8;
      margin-bottom: 24px;
      max-width: 520px;
    }

    .promo-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;

      .promo-feature {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        font-size: 13px;
        color: var(--text-secondary);

        .el-icon { color: var(--primary-color); }
      }
    }
  }

  .promo-right {
    text-align: center;

    .ai-enter-btn {
      padding: 16px 36px;
      font-size: 16px;
      font-weight: 700;
      border-radius: 14px;
      margin-bottom: 20px;
    }

    .tech-stack {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 12px;
      color: var(--text-muted);

      .tech-item {
        padding: 4px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        color: var(--text-secondary);
      }
    }
  }
}

@media (max-width: 1200px) {
  .stats-container { grid-template-columns: repeat(2, 1fr); }
  .teams-showcase { grid-template-columns: repeat(2, 1fr); }
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .highlights-grid { grid-template-columns: 1fr; }
  .promo-content { grid-template-columns: 1fr; text-align: center; }
  .promo-left p { max-width: 100%; }
  .promo-features { grid-template-columns: 1fr; }
  .hero-live-card { display: none; }
}

@media (max-width: 768px) {
  .hero-title .title-main { font-size: 38px; letter-spacing: 3px; }
  .stats-container { grid-template-columns: 1fr; }
  .teams-showcase { grid-template-columns: 1fr; }
  .features-grid { grid-template-columns: 1fr; }
  .teams-battle { flex-direction: column; }
  .battle-center { transform: rotate(90deg); }
  .team-side.team-right { flex-direction: row; text-align: left; }
}
</style>
