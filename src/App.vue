<template>
  <div class="app-container">
    <header class="app-header" :class="{ scrolled: isScrolled }">
      <div class="header-bg"></div>
      <div class="header-content">
        <div class="logo-section" @click="$router.push('/')">
          <div class="logo-icon">
            <span class="logo-text">KPL</span>
            <div class="logo-ring"></div>
          </div>
          <span class="site-name">电竞中心</span>
        </div>

        <nav class="main-nav">
          <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link to="/teams" class="nav-item" :class="{ active: $route.path.startsWith('/team') }">
            <el-icon><User /></el-icon>
            <span>战队</span>
          </router-link>
          <router-link to="/schedule" class="nav-item" :class="{ active: $route.path === '/schedule' }">
            <el-icon><Calendar /></el-icon>
            <span>赛程</span>
          </router-link>
          <router-link to="/live" class="nav-item" :class="{ active: $route.path === '/live' }">
            <el-icon><VideoCamera /></el-icon>
            <span>直播</span>
          </router-link>
          <router-link to="/dashboard" class="nav-item special" :class="{ active: $route.path === '/dashboard' }">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据大屏</span>
          </router-link>
          <router-link to="/ai-analysis" class="nav-item ai-nav" :class="{ active: $route.path === '/ai-analysis' }">
            <el-icon><Cpu /></el-icon>
            <span>AI分析</span>
          </router-link>
        </nav>

        <div class="header-right">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索战队、选手..."
              prefix-icon="Search"
              size="small"
              clearable
            />
          </div>
          <div class="season-badge animate-pulse">
            <el-icon><Trophy /></el-icon>
            <span>{{ currentSeason }}</span>
          </div>
        </div>
      </div>
      <div class="header-line cyber-line"></div>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component, route }">
        <transition :name="transitionName" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <AiChatSidebar />

    <footer class="app-footer">
      <div class="footer-glow"></div>
      <div class="footer-content">
        <div class="footer-brand">
          <div class="brand-logo">KPL</div>
          <p class="brand-desc">王者荣耀职业联赛官方数据平台</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>关于我们</h4>
            <a href="#">平台介绍</a>
            <a href="#">联系方式</a>
            <a href="#">加入我们</a>
          </div>
          <div class="link-group">
            <h4>服务支持</h4>
            <a href="#">帮助中心</a>
            <a href="#">隐私政策</a>
            <a href="#">用户协议</a>
          </div>
          <div class="link-group">
            <h4>合作伙伴</h4>
            <a href="#">腾讯游戏</a>
            <a href="#">天美工作室</a>
            <a href="#">KPL联盟</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>KPL电竞中心 - 专业的王者荣耀职业联赛数据平台 | Powered by 腾讯AI技术</p>
          <p>Copyright © 2024 KPL Esports Center. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useRoute } from 'vue-router'
import AiChatSidebar from '@/components/AiChatSidebar.vue'
import {
  HomeFilled, User, Calendar, VideoCamera,
  Cpu, Trophy, DataAnalysis
} from '@element-plus/icons-vue'

const appStore = useAppStore()
const route = useRoute()
const searchQuery = ref('')
const isScrolled = ref(false)
const transitionName = ref('fade')

const currentSeason = computed(() => appStore.currentSeason)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

watch(() => route.path, (to, from) => {
  const toDepth = to.split('/').length
  const fromDepth = from.split('/').length
  transitionName.value = toDepth < fromDepth ? 'slide-right' : 'slide-left'
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 18, 0.85);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;

  &.scrolled {
    background: rgba(5, 5, 10, 0.95);
    border-bottom-color: var(--border-color);

    .header-content {
      height: 60px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
    }
  }
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    linear-gradient(90deg,
      rgba(0, 212, 255, 0.03) 0%,
      transparent 30%,
      transparent 70%,
      rgba(255, 107, 0, 0.03) 100%
    );
}

.header-content {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 24px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  transition: height 0.3s ease;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);

    .logo-ring {
      transform: rotate(180deg);
      opacity: 1;
    }
  }
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--glow-primary);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%);
    animation: logoShine 3s infinite;
  }

  @keyframes logoShine {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }

  .logo-text {
    font-size: 16px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0,0,0,0.3);
    letter-spacing: 1px;
  }
}

.logo-ring {
  position: absolute;
  inset: -3px;
  border-radius: 15px;
  border: 2px solid transparent;
  background: linear-gradient(var(--primary-color), var(--secondary-color)) border-box;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: all 0.6s ease;
  animation: ringRotate 4s linear infinite;

  @keyframes ringRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

.site-name {
  font-size: 22px;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 2px;
}

.main-nav {
  display: flex;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: var(--gradient-primary);
    border-radius: 1px;
    transition: width 0.3s ease;
  }

  &:hover {
    color: var(--primary-color);
    background: rgba(0, 212, 255, 0.08);
    transform: translateY(-1px);

    &::before {
      width: 60%;
    }
  }

  &.active {
    color: var(--primary-color);
    background: rgba(0, 212, 255, 0.12);

    &::before {
      width: 60%;
      box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
    }
  }

  &.special {
    background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(75, 0, 130, 0.15));
    border: 1px solid rgba(138, 43, 226, 0.25);

    &:hover, &.active {
      background: linear-gradient(135deg, rgba(138, 43, 226, 0.25), rgba(75, 0, 130, 0.25));
      border-color: rgba(138, 43, 226, 0.5);
      color: #B388FF;
    }
  }

  &.ai-nav {
    background: linear-gradient(135deg, rgba(255, 107, 0, 0.15), rgba(255, 215, 0, 0.15));
    border: 1px solid rgba(255, 107, 0, 0.25);

    &:hover, &.active {
      background: linear-gradient(135deg, rgba(255, 107, 0, 0.25), rgba(255, 215, 0, 0.25));
      border-color: var(--secondary-color);
      color: var(--secondary-color);
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-box {
  width: 220px;

  :deep(.el-input__wrapper) {
    border-radius: 20px;
  }
}

.season-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.15));
  border: 1px solid rgba(255, 215, 0, 0.25);
  border-radius: 24px;
  font-size: 12.5px;
  color: var(--accent-color);
  font-weight: 600;
  letter-spacing: 0.5px;

  .el-icon {
    font-size: 16px;
  }
}

.header-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.app-main {
  flex: 1;
  margin-top: 73px;
  min-height: calc(100vh - 73px - 160px);
}

.app-footer {
  position: relative;
  background: var(--bg-darker);
  border-top: 1px solid var(--border-color);
  padding: 50px 0 30px;
  margin-top: auto;
}

.footer-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 0%, rgba(255, 107, 0, 0.06) 0%, transparent 50%);
  pointer-events: none;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.footer-brand {
  text-align: center;
  margin-bottom: 35px;

  .brand-logo {
    display: inline-block;
    font-size: 32px;
    font-weight: 900;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 10px;
    letter-spacing: 4px;
  }

  .brand-desc {
    color: var(--text-muted);
    font-size: 14px;
  }
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-bottom: 35px;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.link-group {
  h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 15px;
  }

  a {
    display: block;
    color: var(--text-muted);
    font-size: 13px;
    margin-bottom: 10px;
    transition: all 0.3s ease;

    &:hover {
      color: var(--primary-color);
      transform: translateX(5px);
    }
  }
}

.footer-bottom {
  text-align: center;

  p {
    color: var(--text-muted);
    font-size: 12px;
    margin: 5px 0;
    line-height: 1.8;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
