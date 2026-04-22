import { defineStore } from 'pinia'
import { authApi } from '@/api/backend'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('kpl_token') || null,
    userInfo: JSON.parse(localStorage.getItem('kpl_user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.userInfo?.role === 'ADMIN',
    username: (state) => state.userInfo?.username || '',
    nickname: (state) => state.userInfo?.nickname || '游客'
  },

  actions: {
    async login(username, password) {
      const res = await authApi.login({ username, password })
      const { token, ...user } = res.data
      this.token = token
      this.userInfo = user
      localStorage.setItem('kpl_token', token)
      localStorage.setItem('kpl_user', JSON.stringify(user))
      ElMessage.success(`欢迎回来，${user.nickname || username}！`)
      return res
    },

    async register(data) {
      const res = await authApi.register(data)
      ElMessage.success('注册成功，请登录！')
      return res
    },

    logout() {
      this.token = null
      this.userInfo = null
      localStorage.removeItem('kpl_token')
      localStorage.removeItem('kpl_user')
      ElMessage.success('已退出登录')
    },

    async fetchMe() {
      if (!this.token) return
      const res = await authApi.getMe()
      this.userInfo = res.data
      localStorage.setItem('kpl_user', JSON.stringify(res.data))
    }
  }
})
