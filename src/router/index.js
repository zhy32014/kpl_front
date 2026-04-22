import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false, speed: 300 })

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页 - KPL电竞中心' }
  },
  {
    path: '/teams',
    name: 'Teams',
    component: () => import('@/views/Teams.vue'),
    meta: { title: '战队中心 - KPL电竞中心' }
  },
  {
    path: '/team/:id',
    name: 'TeamDetail',
    component: () => import('@/views/TeamDetail.vue'),
    meta: { title: '战队详情 - KPL电竞中心' }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: () => import('@/views/Schedule.vue'),
    meta: { title: '赛事赛程 - KPL电竞中心' }
  },
  {
    path: '/live',
    name: 'Live',
    component: () => import('@/views/Live.vue'),
    meta: { title: '直播中心 - KPL电竞中心' }
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/Community.vue'),
    meta: { title: '社区互动 - KPL电竞中心' }
  },
  {
    path: '/ai-analysis',
    name: 'AIAnalysis',
    component: () => import('@/views/AIAnalysis.vue'),
    meta: { title: 'AI数据分析 - KPL电竞中心' }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '数据大屏 - KPL电竞中心' }
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('@/views/News.vue'),
    meta: { title: '电竞资讯 - KPL电竞中心' }
  },
  {
    path: '/match/:id',
    name: 'MatchDetail',
    component: () => import('@/views/MatchDetail.vue'),
    meta: { title: '比赛详情 - KPL电竞中心' }
  },
  {
    path: '/team/:teamId/player/:playerId',
    name: 'PlayerDetail',
    component: () => import('@/views/PlayerDetail.vue'),
    meta: { title: '选手详情 - KPL电竞中心' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  document.title = to.meta.title || 'KPL电竞中心'
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router
