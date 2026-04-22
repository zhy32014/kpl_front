import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const request = axios.create({
  // ✅ 核心修改：用环境变量，本地开发用localhost，部署用Railway公网地址
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截：自动附加 JWT token（不用改，保持原样）
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('kpl_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截：统一错误处理（不用改，保持原样）
request.interceptors.response.use(
  response => {
    const res = response.data
    if (!res.success) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message))
    }
    return res
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kpl_token')
      localStorage.removeItem('kpl_user')
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else if (error.response?.status === 403) {
      ElMessage.error('权限不足')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器错误，请稍后重试')
    } else {
      ElMessage.error(error.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

export default request