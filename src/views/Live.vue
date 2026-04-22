<template>
  <div class="live-page">
    <div class="page-header">
      <div class="header-bg">
        <div class="grid-overlay"></div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
      </div>
      <div class="header-content page-container">
        <h1 class="page-title animate-slideInDown">
          <el-icon :size="28"><component :is="VideoCamera" /></el-icon>
          直播中心
        </h1>
        <p class="page-subtitle animate-fadeIn">实时赛事直播 · 沉浸式观赛体验</p>
      </div>
    </div>

    <div class="live-content page-container" v-if="liveMatch">
      <div class="main-player animate-slideInLeft">
        <div class="player-container">
          <div class="video-screen" ref="videoScreen">
            <div class="screen-bg" :style="{ background: `linear-gradient(135deg, ${liveMatch.teamA.color || '#00D4FF'}22, ${liveMatch.teamB.color || '#FF6B00'}22)` }">
              <div class="danmaku-layer" ref="danmakuLayer">
                <div 
                  class="danmaku-item" 
                  v-for="dm in danmakuList" 
                  :key="dm.id"
                  :style="{ 
                    top: dm.top + '%',
                    animationDuration: dm.duration + 's',
                    animationDelay: dm.delay + 's',
                    color: dm.color,
                    fontSize: dm.size + 'px'
                  }"
                >
                  {{ dm.text }}
                </div>
              </div>

              <div class="gift-effects" ref="giftLayer">
                <transition-group name="gift-float">
                  <div 
                    class="gift-item" 
                    v-for="gift in activeGifts" 
                    :key="gift.id"
                    :class="'gift-' + gift.type"
                    :style="{ left: gift.x + '%' }"
                  >
                    <span class="gift-icon">{{ gift.icon }}</span>
                    <span class="gift-user">{{ gift.user }}</span>
                    <span class="gift-count">x{{ gift.count }}</span>
                  </div>
                </transition-group>
              </div>

              <div class="center-overlay">
                <div class="live-indicator-main">
                  <span class="pulse-dot"></span>
                  <span>LIVE</span>
                </div>
                
                <div class="match-score-overlay">
                  <div class="overlay-team team-a-overlay">
                    <span class="team-name-sm">{{ liveMatch.teamA.name }}</span>
                    <span class="score-big score-a">{{ liveMatch.teamA.score }}</span>
                  </div>
                  <div class="vs-divider">
                    <span>VS</span>
                    <span class="game-info">第{{ liveMatch.currentGame }}局</span>
                  </div>
                  <div class="overlay-team team-b-overlay">
                    <span class="score-big score-b">{{ liveMatch.teamB.score }}</span>
                    <span class="team-name-sm">{{ liveMatch.teamB.name }}</span>
                  </div>
                </div>

                <div class="play-center-btn" @click="togglePlay">
                  <el-icon :size="48"><component :is="isPlaying ? VideoPause : VideoPlay" /></el-icon>
                </div>
              </div>

              <div class="screen-corner-info">
                <span class="stage-tag">{{ liveMatch.stage }}</span>
                <span class="viewer-count">
                  <el-icon><View /></el-icon>
                  {{ viewerCount.toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <div class="player-controls-bar">
            <div class="controls-left">
              <el-button text @click="togglePlay">
                <el-icon><component :is="isPlaying ? VideoPause : VideoPlay" /></el-icon>
              </el-button>
              <span class="time-display">LIVE {{ currentTime }}</span>
            </div>
            
            <div class="controls-center">
              <div class="progress-bar">
                <div class="progress-live">
                  <span class="live-dot"></span>
                  直播中
                </div>
              </div>
            </div>

            <div class="controls-right">
              <el-button text title="弹幕开关" @click="toggleDanmaku">
                <el-icon :color="showDanmaku ? '#00D4FF' : '#666'"><ChatDotRound /></el-icon>
              </el-button>
              <el-button text title="全屏">
                <el-icon><FullScreen /></el-icon>
              </el-button>
              <el-button text title="设置">
                <el-icon><Setting /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="side-panel animate-slideInRight">
        <div class="score-card-enhanced">
          <div class="enhanced-header">
            <span class="match-stage-badge">{{ liveMatch.stage }}</span>
            <span class="game-round">BO7 · 第{{ liveMatch.currentGame }}局</span>
          </div>
          
          <div class="teams-vs-enhanced">
            <div class="team-card-enhanced team-a-card" :style="{ borderColor: liveMatch.teamA.color || '#00D4FF' }">
              <TeamLogo :team-id="liveMatch.teamA.id" :size="60" />
              <h3>{{ liveMatch.teamA.name }}</h3>
              <div class="team-score-display" :style="{ color: liveMatch.teamA.color || '#00D4FF' }">
                {{ liveMatch.teamA.score }}
              </div>
            </div>

            <div class="vs-text-enhanced">
              <span class="vs-main">VS</span>
              <span class="vs-sub">对决中</span>
            </div>

            <div class="team-card-enhanced team-b-card" :style="{ borderColor: liveMatch.teamB.color || '#FF6B00' }">
              <TeamLogo :team-id="liveMatch.teamB.id" :size="60" />
              <h3>{{ liveMatch.teamB.name }}</h3>
              <div class="team-score-display" :style="{ color: liveMatch.teamB.color || '#FF6B00' }">
                {{ liveMatch.teamB.score }}
              </div>
            </div>
          </div>

          <div class="match-stats-mini">
            <div class="mini-stat">
              <span class="ms-label">击杀</span>
              <span class="ms-value">18 : 14</span>
            </div>
            <div class="mini-stat">
              <span class="ms-label">推塔</span>
              <span class="ms-value">5 : 3</span>
            </div>
            <div class="mini-stat">
              <span class="ms-label">经济</span>
              <span class="ms-value">45.2K : 42.8K</span>
            </div>
          </div>
        </div>

        <div class="interaction-panel">
          <div class="panel-tabs">
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'chat' }"
              @click="activeTab = 'chat'"
            >
              <el-icon><ChatDotRound /></el-icon>
              弹幕
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'gift' }"
              @click="activeTab = 'gift'"
            >
              <el-icon><Present /></el-icon>
              礼物
            </button>
            <button 
              class="tab-btn" 
              :class="{ active: activeTab === 'vote' }"
              @click="activeTab = 'vote'"
            >
              <el-icon><DataAnalysis /></el-icon>
              互动
            </button>
          </div>

          <div class="panel-content">
            <div v-if="activeTab === 'chat'" class="chat-panel">
              <div class="messages-container" ref="messagesContainer">
                <div 
                  class="msg-item" 
                  v-for="(msg, index) in chatMessages" 
                  :key="index"
                  :class="msg.type"
                >
                  <span class="msg-user" :style="{ color: msg.userColor }">{{ msg.user }}</span>
                  <span class="msg-text">{{ msg.text }}</span>
                  <span class="msg-time">{{ msg.time }}</span>
                </div>
              </div>

              <div class="chat-input-area">
                <el-input 
                  v-model="danmakuInput" 
                  placeholder="发送弹幕互动..."
                  @keyup.enter="sendDanmaku"
                  size="large"
                >
                  <template #prefix>
                    <el-icon><EditPen /></el-icon>
                  </template>
                </el-input>
                <el-button type="primary" @click="sendDanmaku" size="large">
                  发送
                </el-button>
              </div>

              <div class="quick-replies">
                <span 
                  class="quick-reply-tag" 
                  v-for="(tag, index) in quickReplies" 
                  :key="index"
                  @click="danmakuInput = tag; sendDanmaku()"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div v-if="activeTab === 'gift'" class="gift-panel">
              <div class="gift-grid">
                <div 
                  class="gift-option" 
                  v-for="(gift, index) in giftList" 
                  :key="index"
                  @click="sendGift(gift)"
                >
                  <span class="gift-emoji">{{ gift.icon }}</span>
                  <span class="gift-name">{{ gift.name }}</span>
                  <span class="gift-price">{{ gift.price }}币</span>
                </div>
              </div>
              
              <div class="gift-stats">
                <div class="gs-item">
                  <span class="gs-label">今日收到</span>
                  <span class="gs-value">1,234</span>
                </div>
                <div class="gs-item">
                  <span class="gs-label">贡献榜</span>
                  <span class="gs-value">#12</span>
                </div>
              </div>
            </div>

            <div v-if="activeTab === 'vote'" class="vote-panel">
              <div class="vote-card">
                <h4>🏆 谁会赢得本局比赛？</h4>
                <p class="vote-desc">参与投票赢取奖励</p>
                
                <div class="vote-options">
                  <button 
                    class="vote-btn" 
                    :class="{ selected: voteChoice === 'a', 'team-a': true }"
                    @click="voteChoice = 'a'"
                    :style="{ '--team-color': liveMatch.teamA.color || '#00D4FF' }"
                  >
                    <span class="vote-team">{{ liveMatch.teamA.name }}</span>
                    <span class="vote-percent">{{ votePercent.a }}%</span>
                    <div class="vote-bar" :style="{ width: votePercent.a + '%', background: liveMatch.teamA.color || '#00D4FF' }"></div>
                  </button>
                  
                  <button 
                    class="vote-btn" 
                    :class="{ selected: voteChoice === 'b', 'team-b': true }"
                    @click="voteChoice = 'b'"
                    :style="{ '--team-color': liveMatch.teamB.color || '#FF6B00' }"
                  >
                    <span class="vote-team">{{ liveMatch.teamB.name }}</span>
                    <span class="vote-percent">{{ votePercent.b }}%</span>
                    <div class="vote-bar" :style="{ width: votePercent.b + '%', background: liveMatch.teamB.color || '#FF6B00' }"></div>
                  </button>
                </div>

                <div class="vote-total">
                  已有 <strong>{{ totalVotes.toLocaleString() }}</strong> 人参与投票
                </div>
              </div>

              <div class="poll-list">
                <h5>热门话题</h5>
                <div class="poll-item" v-for="(poll, idx) in hotPolls" :key="idx">
                  <span class="poll-q">{{ poll.question }}</span>
                  <div class="poll-progress">
                    <div class="poll-fill" :style="{ width: poll.yesPercent + '%' }"></div>
                  </div>
                  <span class="poll-result">{{ poll.yesPercent }}% 同意</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="replays-section page-container animate-slideInUp" v-if="!liveMatch">
      <div class="no-live-banner">
        <div class="nl-content">
          <el-icon :size="64" class="nl-icon"><VideoCamera /></el-icon>
          <h2>暂无正在进行的直播</h2>
          <p>当前时段没有比赛，可以观看精彩回放或查看赛程安排</p>
          <div class="nl-actions">
            <el-button type="primary" size="large" @click="$router.push('/schedule')">
              <el-icon><Calendar /></el-icon>
              查看赛程
            </el-button>
            <el-button size="large" @click="$router.push('/news')">
              <el-icon><Document /></el-icon>
              浏览资讯
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="replays-section page-container">
      <div class="section-header">
        <h2><el-icon :size="24"><component :is="VideoCamera" /></el-icon> 精彩回放</h2>
        <el-button text type="primary">查看全部 →</el-button>
      </div>
      
      <div class="replays-grid">
        <div class="replay-card-enhanced" v-for="(replay, index) in replays" :key="index"
             :style="{ animationDelay: `${index * 0.1}s` }">
          <div class="replay-thumb" :style="{ background: replay.gradient }">
            <div class="thumb-overlay"></div>
            <div class="thumb-play-btn">
              <el-icon :size="36"><VideoPlay /></el-icon>
            </div>
            <span class="thumb-duration">{{ replay.duration }}</span>
            <div class="thumb-stats">
              <span><el-icon><View /></el-icon> {{ replay.views }}</span>
              <span><el-icon><Star /></el-icon> {{ replay.likes }}</span>
            </div>
          </div>
          <div class="replay-info">
            <h4>{{ replay.title }}</h4>
            <div class="replay-meta">
              <span class="meta-teams">{{ replay.teams }}</span>
              <span class="meta-date">{{ replay.date }}</span>
              <span class="meta-stage" :class="replay.stageClass">{{ replay.stage }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useMatchStore } from '@/stores/match'
import {
  VideoPlay, VideoPause, VideoCamera, FullScreen, Setting,
  ChatDotRound, View, Present, DataAnalysis, EditPen,
  Calendar, Document, Star
} from '@element-plus/icons-vue'
import TeamLogo from '@/components/TeamLogo.vue'

const matchStore = useMatchStore()
const liveMatch = computed(() => matchStore.liveMatch)

const isPlaying = ref(true)
const showDanmaku = ref(true)
const activeTab = ref('chat')
const danmakuInput = ref('')
const voteChoice = ref('')
const videoScreen = ref(null)
const danmakuLayer = ref(null)
const messagesContainer = ref(null)

const viewerCount = ref(128456)
const currentTime = ref('12:34:56')

const danmakuList = ref([])
const activeGifts = ref([])
const chatMessages = ref([])
const giftIdCounter = ref(0)
let danmakuTimer = null
let chatTimer = null
let timeTimer = null

const quickReplies = ref([
  '太精彩了！', '加油！', '666', '这波操作绝了！', 'MVP预定', '冲冲冲！'
])

const giftList = ref([
  { name: '棒棒糖', icon: '🍭', price: 1 },
  { name: '鲜花', icon: '💐', price: 10 },
  { name: '火箭', icon: '🚀', price: 100 },
  { name: '皇冠', icon: '👑', price: 500 },
  { name: '城堡', icon: '🏰', price: 1000 },
  { name: '星球', icon: '🪐', price: 5000 }
])

const replays = ref([
  {
    title: '【集锦】AG超玩会一诺五杀封神时刻',
    teams: 'AG vs DYG',
    date: '2024-04-15',
    stage: '总决赛',
    stageClass: 'stage-final',
    duration: '08:32',
    views: '356万',
    likes: '12.8万',
    gradient: 'linear-gradient(135deg, #FF6B00, #FF4500)'
  },
  {
    title: '【复盘】春季赛决赛完整战术分析',
    teams: 'AG vs DYG',
    date: '2024-04-14',
    stage: '总决赛',
    stageClass: 'stage-final',
    duration: '25:18',
    views: '189万',
    likes: '8.5万',
    gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)'
  },
  {
    title: '【TOP10】本周十佳操作精彩瞬间',
    teams: '多场比赛',
    date: '2024-04-13',
    stage: '常规赛',
    stageClass: 'stage-normal',
    duration: '06:22',
    views: '267万',
    likes: '15.2万',
    gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)'
  },
  {
    title: '【专访】冠军战队赛后采访实录',
    teams: 'AG超玩会',
    date: '2024-04-12',
    stage: '季后赛',
    stageClass: 'stage-playoff',
    duration: '15:45',
    views: '98万',
    likes: '4.3万',
    gradient: 'linear-gradient(135deg, #00C853, #69F0AE)'
  },
  {
    title: '【高光】清清对抗路单杀集锦',
    teams: 'DYG',
    date: '2024-04-11',
    stage: '常规赛',
    stageClass: 'stage-normal',
    duration: '04:56',
    views: '145万',
    likes: '9.7万',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)'
  },
  {
    title: '【数据】赛季数据统计大盘点',
    teams: 'KPL官方',
    date: '2024-04-10',
    stage: '常规赛',
    stageClass: 'stage-normal',
    duration: '18:30',
    views: '78万',
    likes: '3.2万',
    gradient: 'linear-gradient(135deg, #E91E63, #F44336)'
  }
])

const votePercent = ref({ a: 62, b: 38 })
const totalVotes = ref(15892)

const hotPolls = ref([
  { question: '一诺是否为本赛季最佳选手？', yesPercent: 75 },
  { question: '新版本BP机制是否合理？', yesPercent: 58 },
  { question: '是否支持增加比赛场次？', yesPercent: 82 }
])

const userNames = ['电竞少年', '王者归来', 'KPL铁粉', '游戏达人', '观赛群众', '热血青年', '战术大师', '操作怪']
const userColors = ['#00D4FF', '#FF6B00', '#9C27B0', '#00C853', '#FFD700', '#E91E63', '#00BCD4', '#FF5722']
const danmakuTexts = [
  '这波操作太秀了！', '666666', '一诺牛逼！', 'AG加油！', '这波团战完美配合',
  '教练BP做得好', 'DYG也能打', '精彩对局', 'MVP给一诺', '这英雄玩得溜',
  '后期运营很重要', '前期节奏很好', '打野思路清晰', '辅助开团果断', '射手输出爆炸'
]

function generateDanmaku() {
  if (!showDanmaku.value) return
  
  const id = Date.now() + Math.random()
  const text = danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)]
  const user = userNames[Math.floor(Math.random() * userNames.length)]
  const color = userColors[Math.floor(Math.random() * userColors.length)]
  
  danmakuList.value.push({
    id,
    text: `${user}: ${text}`,
    top: Math.random() * 70 + 5,
    duration: 8 + Math.random() * 4,
    delay: 0,
    color,
    size: 14 + Math.floor(Math.random() * 6)
  })
  
  if (danmakuList.value.length > 30) {
    danmakuList.value.shift()
  }
}

function generateChatMessage() {
  const user = userNames[Math.floor(Math.random() * userNames.length)]
  const userColor = userColors[Math.floor(Math.random() * userColors.length)]
  const text = danmakuTexts[Math.floor(Math.random() * danmakuTexts.length)]
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  chatMessages.value.push({
    user,
    userColor,
    text,
    time,
    type: Math.random() > 0.8 ? 'vip' : 'normal'
  })
  
  if (chatMessages.value.length > 100) {
    chatMessages.value.shift()
  }
  
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function sendDanmaku() {
  if (!danmakuInput.value.trim()) return
  
  const id = Date.now()
  danmakuList.value.push({
    id,
    text: `我: ${danmakuInput.value}`,
    top: Math.random() * 70 + 5,
    duration: 10,
    delay: 0,
    color: '#FFD700',
    size: 16
  })
  
  chatMessages.value.push({
    user: '我',
    userColor: '#FFD700',
    text: danmakuInput.value,
    time: new Date().toTimeString().slice(0, 5),
    type: 'me'
  })
  
  danmakuInput.value = ''
}

function sendGift(gift) {
  const id = ++giftIdCounter.value
  const giftItem = {
    id,
    type: gift.name,
    icon: gift.icon,
    user: '我',
    count: Math.floor(Math.random() * 10) + 1,
    x: 20 + Math.random() * 60
  }
  
  activeGifts.value.push(giftItem)
  
  setTimeout(() => {
    activeGifts.value = activeGifts.value.filter(g => g.id !== id)
  }, 3000)
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function toggleDanmaku() {
  showDanmaku.value = !showDanmaku.value
}

function updateTime() {
  const now = new Date()
  currentTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  
  viewerCount.value += Math.floor(Math.random() * 20) - 8
  if (viewerCount.value < 100000) viewerCount.value = 100000
}

onMounted(() => {
  for (let i = 0; i < 10; i++) {
    generateDanmaku()
    generateChatMessage()
  }
  
  danmakuTimer = setInterval(generateDanmaku, 2500)
  chatTimer = setInterval(generateChatMessage, 3000)
  timeTimer = setInterval(updateTime, 1000)

  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  clearInterval(danmakuTimer)
  clearInterval(chatTimer)
  clearInterval(timeTimer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

function handleVisibilityChange() {
  if (document.hidden) {
    clearInterval(danmakuTimer)
    clearInterval(chatTimer)
    clearInterval(timeTimer)
    danmakuTimer = null
    chatTimer = null
    timeTimer = null
  } else {
    if (!danmakuTimer) danmakuTimer = setInterval(generateDanmaku, 2500)
    if (!chatTimer) chatTimer = setInterval(generateChatMessage, 3000)
    if (!timeTimer) timeTimer = setInterval(updateTime, 1000)
  }
}
</script>

<style scoped lang="scss">
.live-page {
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
    background: linear-gradient(180deg, rgba(255,0,0,0.1), transparent);

    .grid-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(255,0,0,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,0,0,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(100px);

      &.orb-1 {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(255,0,0,0.25), transparent);
        top: -100px;
        right: 20%;
        animation: float 8s ease-in-out infinite;
      }

      &.orb-2 {
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(255,107,0,0.2), transparent);
        bottom: -80px;
        left: 20%;
        animation: float 10s ease-in-out infinite reverse;
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
    background: linear-gradient(135deg, #fff, #FF4444);
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

.live-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  margin-bottom: 48px;
}

.main-player {
  min-width: 0;
}

.player-container {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255,0,0,0.15);
}

.video-screen {
  position: relative;
  height: 520px;
  overflow: hidden;
}

.screen-bg {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.danmaku-layer {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 10;
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  font-weight: 500;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5);
  animation: danmaku-scroll linear forwards;
  will-change: transform;

  &::before {
    content: '';
    position: absolute;
    inset: -2px -4px;
    background: linear-gradient(90deg, transparent, currentColor 10%, currentColor 90%, transparent);
    filter: blur(1px);
    opacity: 0.3;
    z-index: -1;
  }
}

@keyframes danmaku-scroll {
  from {
    transform: translateX(100vw);
  }
  to {
    transform: translateX(-100%);
  }
}

.gift-effects {
  position: absolute;
  bottom: 80px;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 20;
  height: 200px;
}

.gift-item {
  position: absolute;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: gift-rise 3s ease-out forwards;
  pointer-events: none;

  .gift-icon {
    font-size: 40px;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
  }

  .gift-user {
    font-size: 11px;
    color: #fff;
    background: rgba(0,0,0,0.6);
    padding: 2px 8px;
    border-radius: 10px;
    margin-top: 4px;
    white-space: nowrap;
  }

  .gift-count {
    font-size: 14px;
    font-weight: 700;
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255,215,0,0.8);
  }
}

@keyframes gift-rise {
  0% {
    opacity: 1;
    transform: translateY(0) scale(0.5);
  }
  20% {
    transform: translateY(-30px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateY(-180px) scale(0.8);
  }
}

.gift-float-enter-active {
  transition: all 0.3s ease-out;
}

.gift-float-leave-active {
  transition: all 0.5s ease-in;
}

.center-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: none;
}

.live-indicator-main {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  background: rgba(255,0,0,0.85);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  backdrop-filter: blur(10px);

  .pulse-dot {
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 50%;
    animation: pulse-live 1.5s infinite;
  }
}

@keyframes pulse-live {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

.match-score-overlay {
  display: flex;
  align-items: center;
  gap: 32px;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(20px);
  padding: 20px 40px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);

  .overlay-team {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .team-name-sm {
    font-size: 14px;
    color: rgba(255,255,255,0.8);
  }

  .score-big {
    font-size: 48px;
    font-weight: 900;
    line-height: 1;
  }

  .vs-divider {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .vs-main {
      font-size: 22px;
      font-weight: 800;
      color: rgba(255,255,255,0.6);
    }

    .game-info {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
    }
  }
}

.play-center-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.3s;

  &:hover {
    background: rgba(255,255,255,0.25);
    transform: scale(1.1);
  }
}

.screen-corner-info {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 5;

  .stage-tag {
    padding: 6px 14px;
    background: rgba(0,212,255,0.2);
    border: 1px solid rgba(0,212,255,0.4);
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #00D4FF;
  }

  .viewer-count {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: rgba(0,0,0,0.6);
    border-radius: 12px;
    font-size: 13px;
    color: #fff;
  }
}

.player-controls-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(0,0,0,0.8);
  border-top: 1px solid rgba(255,255,255,0.05);

  .controls-left, .controls-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .time-display {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    font-family: monospace;
  }

  .controls-center {
    flex: 1;
    max-width: 400px;
    margin: 0 20px;
  }

  .progress-bar {
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
    position: relative;
    cursor: pointer;

    .progress-live {
      position: absolute;
      left: 0;
      top: -6px;
      font-size: 11px;
      color: #FF4444;
      display: flex;
      align-items: center;
      gap: 6px;

      .live-dot {
        width: 6px;
        height: 6px;
        background: #FF4444;
        border-radius: 50%;
        animation: pulse-live 1s infinite;
      }
    }
  }
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.score-card-enhanced {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255,0,0,0.1);

  .enhanced-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .match-stage-badge {
      padding: 6px 14px;
      background: linear-gradient(135deg, #FF4444, #FF6666);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #fff;
    }

    .game-round {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
    }
  }
}

.teams-vs-enhanced {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.team-card-enhanced {
  text-align: center;
  padding: 16px 12px;
  border-radius: 14px;
  border: 2px solid;
  background: rgba(255,255,255,0.02);
  transition: all 0.3s;

  &:hover {
    background: rgba(255,255,255,0.05);
  }

  .team-logo-lg {
    width: 64px;
    height: 64px;
    margin: 0 auto 10px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
  }

  .team-score-display {
    font-size: 36px;
    font-weight: 900;
  }
}

.vs-text-enhanced {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  .vs-main {
    font-size: 20px;
    font-weight: 800;
    color: rgba(255,255,255,0.4);
  }

  .vs-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.3);
  }
}

.match-stats-mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  .mini-stat {
    text-align: center;
    padding: 8px;
    background: rgba(255,255,255,0.03);
    border-radius: 8px;

    .ms-label {
      display: block;
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 4px;
    }

    .ms-value {
      font-size: 13px;
      font-weight: 700;
      color: #fff;
    }
  }
}

.interaction-panel {
  flex: 1;
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,0,0,0.1);
  display: flex;
  flex-direction: column;

  .panel-tabs {
    display: flex;
    border-bottom: 1px solid rgba(255,255,255,0.05);

    .tab-btn {
      flex: 1;
      padding: 14px;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.5);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.3s;
      position: relative;

      &.active {
        color: #FF4444;
        background: rgba(255,0,0,0.05);

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: #FF4444;
          border-radius: 2px;
        }
      }

      &:hover:not(.active) {
        color: rgba(255,255,255,0.8);
        background: rgba(255,255,255,0.03);
      }
    }
  }

  .panel-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.chat-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 2px;
  }
}

.msg-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  animation: fadeInUp 0.3s ease;

  &.me {
    background: rgba(255,215,0,0.1);
    border: 1px solid rgba(255,215,0,0.2);
  }

  &.vip {
    background: linear-gradient(90deg, rgba(255,107,0,0.1), transparent);
  }

  .msg-user {
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .msg-text {
    color: rgba(255,255,255,0.8);
    word-break: break-word;
  }

  .msg-time {
    margin-left: auto;
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    flex-shrink: 0;
  }
}

.chat-input-area {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid rgba(255,255,255,0.03);

  .quick-reply-tag {
    padding: 4px 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    font-size: 12px;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: rgba(255,68,68,0.15);
      border-color: rgba(255,68,68,0.3);
      color: #FF4444;
    }
  }
}

.gift-panel {
  padding: 16px;
}

.gift-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.gift-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(255,215,0,0.1);
    border-color: rgba(255,215,0,0.3);
    transform: translateY(-4px);

    .gift-emoji {
      transform: scale(1.2);
    }
  }

  .gift-emoji {
    font-size: 32px;
    transition: transform 0.3s;
  }

  .gift-name {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  }

  .gift-price {
    font-size: 12px;
    color: rgba(255,215,0,0.8);
  }
}

.gift-stats {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;

  .gs-item {
    flex: 1;
    text-align: center;

    .gs-label {
      display: block;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 4px;
    }

    .gs-value {
      font-size: 20px;
      font-weight: 700;
      color: #FFD700;
    }
  }
}

.vote-panel {
  padding: 16px;
  overflow-y: auto;
}

.vote-card {
  background: rgba(255,255,255,0.03);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 6px;
  }

  .vote-desc {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 16px;
  }
}

.vote-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.vote-btn {
  position: relative;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  text-align: left;

  &.selected {
    border-color: var(--team-color);
    background: color-mix(in srgb, var(--team-color) 10%, transparent);
  }

  .vote-team {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
  }

  .vote-percent {
    position: absolute;
    right: 16px;
    top: 16px;
    font-size: 18px;
    font-weight: 700;
    color: var(--team-color);
    z-index: 1;
  }

  .vote-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    border-radius: 10px;
    opacity: 0.15;
    transition: width 0.5s ease;
  }

  &:hover {
    border-color: var(--team-color);
    transform: translateX(4px);
  }
}

.vote-total {
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.5);

  strong {
    color: #00D4FF;
  }
}

.poll-list {
  h5 {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 12px;
  }
}

.poll-item {
  margin-bottom: 12px;
  padding: 12px;
  background: rgba(255,255,255,0.02);
  border-radius: 10px;

  .poll-q {
    display: block;
    font-size: 13px;
    color: rgba(255,255,255,0.8);
    margin-bottom: 8px;
  }

  .poll-progress {
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 6px;

    .poll-fill {
      height: 100%;
      background: linear-gradient(90deg, #00D4FF, #0066FF);
      border-radius: 3px;
      transition: width 0.5s ease;
    }
  }

  .poll-result {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
  }
}

.no-live-banner {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 80px 40px;
  text-align: center;
  border: 1px solid rgba(255,0,0,0.1);
  margin-bottom: 48px;

  .nl-icon {
    color: rgba(255,255,255,0.2);
    margin-bottom: 20px;
  }

  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 28px;
  }

  .nl-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
  }
}

.replays-section {
  padding-bottom: 80px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 28px;

    h2 {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
}

.replays-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.replay-card-enhanced {
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255,255,255,0.05);
  animation: fadeInUp 0.6s both;

  &:hover {
    transform: translateY(-10px);
    border-color: rgba(0,212,255,0.3);
    box-shadow: 0 20px 50px rgba(0,212,255,0.15);

    .replay-thumb .thumb-overlay {
      opacity: 0.4;
    }

    .thumb-play-btn {
      transform: scale(1.15);
      opacity: 1;
    }
  }
}

.replay-thumb {
  position: relative;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;

  .thumb-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.8));
    transition: opacity 0.3s;
  }

  .thumb-play-btn {
    position: relative;
    z-index: 2;
    width: 64px;
    height: 64px;
    background: rgba(255,255,255,0.2);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    transition: all 0.3s;
    opacity: 0.9;
  }

  .thumb-duration {
    position: absolute;
    bottom: 12px;
    left: 12px;
    z-index: 2;
    padding: 4px 10px;
    background: rgba(0,0,0,0.7);
    border-radius: 6px;
    font-size: 12px;
    color: #fff;
  }

  .thumb-stats {
    position: absolute;
    bottom: 12px;
    right: 12px;
    z-index: 2;
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #fff;

    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.replay-info {
  padding: 16px;

  h4 {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
    line-height: 1.5;
    margin-bottom: 10px;
  }

  .replay-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    font-size: 12px;
    color: rgba(255,255,255,0.4);

    .meta-stage {
      padding: 3px 10px;
      border-radius: 10px;
      font-weight: 600;

      &.stage-final {
        background: linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2));
        color: #FFD700;
      }

      &.stage-playoff {
        background: linear-gradient(135deg, rgba(156,39,176,0.2), rgba(233,30,99,0.2));
        color: #E91E63;
      }

      &.stage-normal {
        background: rgba(0,212,255,0.1);
        color: #00D4FF;
      }
    }
  }
}

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

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

@media (max-width: 1200px) {
  .live-content {
    grid-template-columns: 1fr 340px;
  }
}

@media (max-width: 1024px) {
  .live-content {
    grid-template-columns: 1fr;
  }

  .side-panel {
    flex-direction: row;
    
    .interaction-panel {
      flex: 1;
    }
  }

  .replays-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .side-panel {
    flex-direction: column;
  }

  .replays-grid {
    grid-template-columns: 1fr;
  }

  .video-screen {
    height: 380px;
  }
}
</style>
