<template>
  <div class="news-page">
    <div class="page-header">
      <div class="header-bg">
        <div class="grid-overlay"></div>
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
      </div>
      <div class="header-content page-container">
        <h1 class="page-title animate-slideInDown">
          <el-icon :size="28"><component :is="Document" /></el-icon>
          电竞资讯中心
        </h1>
        <p class="page-subtitle animate-fadeIn">掌握KPL最新动态 · 深度解读电竞赛事</p>
      </div>
    </div>

    <div class="news-content page-container">
      <div class="featured-news animate-slideInUp">
        <div class="main-feature" @click="openNews(featuredNews[0])">
          <div class="feature-image" :style="{ background: featuredNews[0].gradient }">
            <div class="image-overlay"></div>
            <div class="feature-badge">
              <span class="badge-hot"><el-icon><Star /></el-icon> 头条</span>
            </div>
            <div class="play-icon" v-if="featuredNews[0].hasVideo">
              <el-icon :size="40"><VideoPlay /></el-icon>
            </div>
          </div>
          <div class="feature-content">
            <h2 class="feature-title">{{ featuredNews[0].title }}</h2>
            <p class="feature-desc">{{ featuredNews[0].desc }}</p>
            <div class="feature-meta">
              <span><el-icon><User /></el-icon> {{ featuredNews[0].author }}</span>
              <span><el-icon><Clock /></el-icon> {{ featuredNews[0].time }}</span>
              <span><el-icon><View /></el-icon> {{ featuredNews[0].views }} 阅读</span>
            </div>
          </div>
        </div>

        <div class="sub-features">
          <div class="sub-feature" v-for="(news, index) in featuredNews.slice(1, 3)" :key="index"
               @click="openNews(news)" :style="{ animationDelay: `${index * 0.15}s` }">
            <div class="sub-image" :style="{ background: news.gradient }">
              <div class="image-overlay"></div>
            </div>
            <div class="sub-content">
              <h3>{{ news.title }}</h3>
              <p>{{ news.desc }}</p>
              <span class="sub-time">{{ news.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="news-grid">
        <div class="news-section category-section animate-slideInLeft">
          <div class="section-header">
            <h2><el-icon><component :is="TrendCharts" /></el-icon> 赛事报道</h2>
            <el-button text type="primary" size="small">查看更多 →</el-button>
          </div>
          <div class="news-list">
            <div class="news-item" v-for="(item, index) in matchNews" :key="index"
                 @click="openNews(item)">
              <div class="news-thumb" :style="{ background: item.gradient }">
                <span class="news-tag" :class="item.tagType">{{ item.tag }}</span>
              </div>
              <div class="news-info">
                <h4>{{ item.title }}</h4>
                <p>{{ item.desc }}</p>
                <div class="news-meta">
                  <span>{{ item.time }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ item.comments }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="news-section player-section animate-slideInRight">
          <div class="section-header">
            <h2><el-icon><component :is="UserFilled" /></el-icon> 选手动态</h2>
            <el-button text type="primary" size="small">查看更多 →</el-button>
          </div>
          <div class="player-cards">
            <div class="player-card" v-for="(player, index) in playerNews" :key="index"
                 @click="openPlayerDetail(player)"
                 :style="{ animationDelay: `${index * 0.1}s` }">
              <div class="player-avatar" :style="{ background: player.gradient }">
                {{ player.name.charAt(0) }}
              </div>
              <div class="player-info">
                <h4>{{ player.name }}</h4>
                <span class="player-team">{{ player.team }}</span>
              </div>
              <div class="player-stat">
                <span class="stat-value">{{ player.stat }}</span>
                <span class="stat-label">{{ player.statLabel }}</span>
              </div>
              <p class="player-dynamic">{{ player.dynamic }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="hot-topics animate-slideInUp">
        <div class="section-header center">
          <h2><el-icon><component :is="Promotion" /></el-icon> 热门话题</h2>
        </div>
        <div class="topics-cloud">
          <div class="topic-tag" v-for="(topic, index) in hotTopics" :key="index"
               :class="'size-' + topic.size"
               :style="{ 
                 background: `linear-gradient(135deg, ${topic.color1}, ${topic.color2})`,
                 animationDelay: `${index * 0.05}s`
               }"
               @click="searchTopic(topic.name)">
            #{{ topic.name }}
            <span class="topic-count">{{ topic.count }}万</span>
          </div>
        </div>
      </div>

      <div class="analysis-section animate-slideInUp">
        <div class="analysis-card main-analysis">
          <div class="card-badge">
            <el-icon><component :is="DataAnalysis" /></el-icon>
            深度分析
          </div>
          <h3>2024 KPL春季赛战术趋势报告</h3>
          <p class="analysis-desc">基于AI大数据分析的赛季战术演变与未来预测</p>
          <div class="analysis-stats">
            <div class="a-stat">
              <span class="a-value">156</span>
              <span class="a-label">比赛样本</span>
            </div>
            <div class="a-stat">
              <span class="a-value">89%</span>
              <span class="a-label">数据覆盖</span>
            </div>
            <div class="a-stat">
              <span class="a-value">12</span>
              <span class="a-label">核心发现</span>
            </div>
          </div>
          <el-button type="primary" class="read-btn" @click="$router.push('/ai-analysis')">
            <el-icon><component :is="Cpu" /></el-icon>
            查看完整报告
          </el-button>
        </div>

        <div class="quick-links">
          <div class="link-card" v-for="(link, index) in quickLinks" :key="index"
               :style="{ background: link.gradient }"
               @click="navigateTo(link.path)">
            <el-icon :size="24"><component :is="link.icon" /></el-icon>
            <span>{{ link.title }}</span>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <div class="video-section animate-slideInUp">
        <div class="section-header">
          <h2><el-icon><component :is="VideoCamera" /></el-icon> 精彩视频</h2>
          <el-button text type="primary" size="small">更多视频 →</el-button>
        </div>
        <div class="video-grid">
          <div class="video-card" v-for="(video, index) in videos" :key="index"
               @click="playVideo(video)">
            <div class="video-thumb" :style="{ background: video.gradient }">
              <div class="video-overlay"></div>
              <div class="video-play">
                <el-icon :size="36"><VideoPlay /></el-icon>
              </div>
              <span class="video-duration">{{ video.duration }}</span>
            </div>
            <div class="video-info">
              <h4>{{ video.title }}</h4>
              <div class="video-meta">
                <span>{{ video.views }}次播放</span>
                <span>{{ video.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document, Star, VideoPlay, User, Clock, View,
  TrendCharts, UserFilled, ChatDotRound, Promotion,
  DataAnalysis, Cpu, VideoCamera, ArrowRight, Trophy, Calendar
} from '@element-plus/icons-vue'

const router = useRouter()

const featuredNews = ref([
  {
    id: 1,
    title: '苏州KSG夺得2026 KPL春季赛总冠军！今屿五杀封神',
    desc: '在万众瞩目的总决赛中，苏州KSG以4:2击败重庆狼队，成功捧起银龙杯！今屿在决胜局使用公孙离拿下五连绝世，创造KPL历史时刻。这是KSG队史首个KPL总冠军！',
    author: 'KPL官方',
    time: '3天前',
    views: '256万',
    hasVideo: true,
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    tag: '冠军',
    tagType: 'tag-hot'
  },
  {
    id: 2,
    title: '2026挑战者杯抽签完成！32支战队分组揭晓',
    desc: '挑战者杯抽签仪式圆满结束，KSG与狼队作为种子队分列第1、5组，各路豪强齐聚，谁能问鼎？',
    time: '1天前',
    views: '189万',
    gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)'
  },
  {
    id: 3,
    title: '春季赛总决赛观看人数突破2568万创历史新高',
    desc: 'KSG vs狼队的总决赛吸引了超过2568万观众同时在线观看，创下KPL历史最高收视纪录。',
    time: '4天前',
    views: '145万',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)'
  }
])

const matchNews = ref([
  {
    id: 101,
    title: '挑战者杯前瞻：32支战队实力深度对比分析',
    desc: '从春季赛表现、选手状态、战术体系等多维度解析各队夺冠概率...',
    time: '2小时前',
    comments: 456,
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    tag: '前瞻',
    tagType: 'tag-analysis'
  },
  {
    id: 102,
    title: '总决赛复盘：KSG如何击败狼队登顶',
    desc: '详细解读KSG在总决赛中的战术布局、英雄选择及团战配合...',
    time: '1天前',
    comments: 389,
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    tag: '复盘',
    tagType: 'tag-review'
  },
  {
    id: 103,
    title: '挑战者杯小组赛看点：死亡之组对决预测',
    desc: '第3组AG对阵RW侠、第7组DYG对阵LTG等焦点战役前瞻...',
    time: '6小时前',
    comments: 278,
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    tag: '前瞻',
    tagType: 'tag-event'
  },
  {
    id: 104,
    title: '今屿FMVP之路：从新人到冠军的蜕变',
    desc: '回顾今屿本赛季的精彩表现，分析其成为FMVP的关键因素...',
    time: '12小时前',
    comments: 523,
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    tag: '人物',
    tagType: 'tag-match'
  }
])

const playerNews = ref([
  {
    name: '今屿（KSG）',
    team: '苏州KSG',
    stat: '6.2',
    statLabel: 'KDA',
    dynamic: '春季赛FMVP，总决赛五杀封神',
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
  },
  {
    name: '小胖（狼队）',
    team: '重庆狼队',
    stat: '5.8',
    statLabel: 'KDA',
    dynamic: '虽败犹荣，狼队核心打野',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)'
  },
  {
    name: '晚星（KSG）',
    team: '苏州KSG',
    stat: '5.5',
    statLabel: 'KDA',
    dynamic: '中路大核，不知火舞绝活',
    gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)'
  },
  {
    name: '一笙（KSG）',
    team: '苏州KSG',
    stat: '95.2%',
    statLabel: '参团率',
    dynamic: '游走位指挥官，大乔体系核心',
    gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)'
  }
])

const hotTopics = ref([
  { name: 'KSG夺冠', count: 356, size: 'xl', color1: '#8B5CF6', color2: '#A78BFA' },
  { name: '今屿五杀', count: 289, size: 'xl', color1: '#FFD700', color2: '#FFA500' },
  { name: '挑战者杯', count: 245, size: 'lg', color1: '#00D4FF', color2: '#0066FF' },
  { name: 'FMVP今屿', count: 198, size: 'lg', color1: '#9C27B0', color2: '#E91E63' },
  { name: '抽签结果', count: 167, size: 'md', color1: '#FF6B00', color2: '#FF4500' },
  { name: 'KSG全员续约', count: 134, size: 'md', color1: '#00C853', color2: '#69F0AE' },
  { name: '2568万观众', count: 178, size: 'lg', color1: '#E91E63', color2: '#F44336' },
  { name: '狼队亚军', count: 112, size: 'md', color1: '#3F51B5', color2: '#2196F3' },
  { name: '春季赛总结', count: 201, size: 'lg', color1: '#00BCD4', color2: '#009688' },
  { name: '小组赛预测', count: 89, size: 'sm', color1: '#8BC34A', color2: '#CDDC39' }
])

const quickLinks = ref([
  // eslint-disable-next-line no-undef
  { title: '战队排行', icon: Trophy, path: '/teams', gradient: 'linear-gradient(135deg, #FFD700, #FFA500)' },
  // eslint-disable-next-line no-undef
  { title: '赛程安排', icon: Calendar, path: '/schedule', gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)' },
  { title: '直播中心', icon: VideoPlay, path: '/live', gradient: 'linear-gradient(135deg, #FF6B00, #FF4500)' },
  { title: 'AI数据分析', icon: Cpu, path: '/ai-analysis', gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)' }
])

const videos = ref([
  {
    id: 1,
    title: '【集锦】今屿总决赛五杀时刻回顾',
    duration: '08:45',
    views: '486万',
    time: '3天前',
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)'
  },
  {
    id: 2,
    title: '【复盘】KSG vs 狼队 决赛完整战术分析',
    duration: '28:32',
    views: '256万',
    time: '4天前',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)'
  },
  {
    id: 3,
    title: '【专访】冠军战队赛后采访：今屿&流浪',
    duration: '18:20',
    views: '178万',
    time: '5天前',
    gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)'
  },
  {
    id: 4,
    title: '【TOP5】春季赛十佳操作精彩瞬间',
    duration: '07:15',
    views: '358万',
    time: '1周前',
    gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)'
  }
])

function openNews(news) {
  console.log('打开新闻:', news.title)
}

function openPlayerDetail(player) {
  console.log('查看选手详情:', player.name)
}

function searchTopic(topic) {
  console.log('搜索话题:', topic)
}

function navigateTo(path) {
  router.push(path)
}

function playVideo(video) {
  console.log('播放视频:', video.title)
}

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<style scoped lang="scss">
.news-page {
  min-height: 100vh;
  background: var(--bg-dark);
}

.page-header {
  position: relative;
  padding: 80px 0 60px;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(0,212,255,0.15), transparent);

    .grid-overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px);
      background-size: 50px 50px;
    }

    .glow-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.4;

      &.orb-1 {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(0,212,255,0.4), transparent);
        top: -100px;
        right: 10%;
        animation: float 8s ease-in-out infinite;
      }

      &.orb-2 {
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(255,107,0,0.3), transparent);
        bottom: -50px;
        left: 15%;
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

.news-content {
  padding-bottom: 80px;
}

.featured-news {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

.main-feature {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0,212,255,0.1);

  &:hover {
    transform: translateY(-8px);
    border-color: rgba(0,212,255,0.3);
    box-shadow: 0 20px 60px rgba(0,212,255,0.15);

    .feature-image .image-overlay {
      opacity: 0.3;
    }

    .play-icon {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  .feature-image {
    position: relative;
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.8));
      transition: opacity 0.3s;
    }

    .feature-badge {
      position: absolute;
      top: 20px;
      left: 20px;
      z-index: 2;

      .badge-hot {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        background: linear-gradient(135deg, #FF6B00, #FF4500);
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        animation: pulse-glow 2s infinite;
      }
    }

    .play-icon {
      position: relative;
      z-index: 2;
      width: 80px;
      height: 80px;
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
  }

  .feature-content {
    padding: 28px;

    .feature-title {
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .feature-desc {
      font-size: 15px;
      color: rgba(255,255,255,0.6);
      line-height: 1.7;
      margin-bottom: 16px;
    }

    .feature-meta {
      display: flex;
      gap: 24px;
      font-size: 13px;
      color: rgba(255,255,255,0.4);

      span {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }
}

.sub-features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sub-feature {
  flex: 1;
  background: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(0,212,255,0.1);

  &:hover {
    transform: translateX(-8px);
    border-color: rgba(0,212,255,0.3);

    .sub-image .image-overlay {
      opacity: 0.3;
    }
  }

  .sub-image {
    position: relative;
    height: 140px;

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7));
      transition: opacity 0.3s;
    }
  }

  .sub-content {
    padding: 16px 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    p {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      line-height: 1.5;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .sub-time {
      font-size: 12px;
      color: rgba(0,212,255,0.6);
    }
  }
}

.news-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 48px;
}

.news-section {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(0,212,255,0.1);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    &.center {
      justify-content: center;
    }
  }
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.news-item {
  display: flex;
  gap: 16px;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    background: rgba(0,212,255,0.05);

    .news-thumb {
      transform: scale(1.05);
    }
  }

  .news-thumb {
    width: 120px;
    height: 90px;
    border-radius: 10px;
    position: relative;
    flex-shrink: 0;
    transition: transform 0.3s;
    overflow: hidden;

    .news-tag {
      position: absolute;
      top: 8px;
      left: 8px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      color: #fff;

      &.tag-hot {
        background: linear-gradient(135deg, #FF6B00, #FF4500);
      }

      &.tag-analysis {
        background: linear-gradient(135deg, #9C27B0, #E91E63);
      }

      &.tag-review {
        background: linear-gradient(135deg, #00D4FF, #0066FF);
      }

      &.tag-event {
        background: linear-gradient(135deg, #00C853, #69F0AE);
      }

      &.tag-match {
        background: linear-gradient(135deg, #FFD700, #FFA500);
      }
    }
  }

  .news-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    h4 {
      font-size: 15px;
      font-weight: 600;
      color: #fff;
      line-height: 1.5;
      margin-bottom: 6px;
    }

    p {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .news-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: rgba(255,255,255,0.4);

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

.player-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0,212,255,0.03);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;

  &:hover {
    background: rgba(0,212,255,0.08);
    border-color: rgba(0,212,255,0.2);
    transform: translateX(8px);

    .player-avatar {
      transform: scale(1.1);
    }
  }

  .player-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
    transition: transform 0.3s;
    flex-shrink: 0;
  }

  .player-info {
    flex: 1;

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }

    .player-team {
      font-size: 13px;
      color: rgba(0,212,255,0.7);
    }
  }

  .player-stat {
    text-align: center;
    padding: 0 16px;

    .stat-value {
      display: block;
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }

    .stat-label {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
    }
  }

  .player-dynamic {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.hot-topics {
  margin-bottom: 48px;
  padding: 32px;
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid rgba(0,212,255,0.1);

  .topics-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
  }

  .topic-tag {
    padding: 10px 20px;
    border-radius: 25px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    animation: fadeInUp 0.5s both;

    &:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }

    &.size-sm {
      font-size: 12px;
      padding: 8px 16px;
    }

    &.size-md {
      font-size: 14px;
      padding: 10px 20px;
    }

    &.size-lg {
      font-size: 16px;
      padding: 12px 24px;
      font-weight: 600;
    }

    &.size-xl {
      font-size: 18px;
      padding: 14px 28px;
      font-weight: 700;
    }

    .topic-count {
      font-size: 12px;
      opacity: 0.8;
    }
  }
}

.analysis-section {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

.main-analysis {
  background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(156,39,176,0.1));
  border: 1px solid rgba(0,212,255,0.2);
  padding: 36px;
  border-radius: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0,212,255,0.1), transparent 70%);
    animation: rotate 20s linear infinite;
  }

  .card-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #00D4FF, #0066FF);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  h3 {
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
  }

  .analysis-desc {
    font-size: 15px;
    color: rgba(255,255,255,0.6);
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
  }

  .analysis-stats {
    display: flex;
    gap: 40px;
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
  }

  .a-stat {
    text-align: center;

    .a-value {
      display: block;
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #00D4FF, #fff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .a-label {
      font-size: 13px;
      color: rgba(255,255,255,0.5);
      margin-top: 4px;
    }
  }

  .read-btn {
    position: relative;
    z-index: 1;
    padding: 12px 28px;
    font-size: 15px;
    border-radius: 25px;
    background: linear-gradient(135deg, #00D4FF, #0066FF);
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 8px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,212,255,0.4);
    }
  }
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.link-card {
  flex: 1;
  padding: 20px 24px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;

  &:hover {
    transform: translateX(-8px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.3);

    .arrow {
      transform: translateX(4px);
    }
  }

  .arrow {
    margin-left: auto;
    transition: transform 0.3s;
  }
}

.video-section {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(0,212,255,0.1);

  .video-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 24px;
  }
}

.video-card {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-8px);

    .video-thumb .video-overlay {
      opacity: 0.5;
    }

    .video-play {
      transform: scale(1.1);
      opacity: 1;
    }
  }

  .video-thumb {
    position: relative;
    height: 140px;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .video-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.3);
      transition: opacity 0.3s;
    }

    .video-play {
      position: relative;
      z-index: 2;
      width: 56px;
      height: 56px;
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

    .video-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      z-index: 2;
      padding: 4px 8px;
      background: rgba(0,0,0,0.7);
      border-radius: 6px;
      font-size: 12px;
      color: #fff;
    }
  }

  .video-info {
    padding: 12px 4px;

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      line-height: 1.4;
      margin-bottom: 8px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .video-meta {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: rgba(255,255,255,0.4);
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

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255,107,0,0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(255,107,0,0.8);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-30px);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
