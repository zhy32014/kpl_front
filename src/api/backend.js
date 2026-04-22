import request from './request'
import axios from 'axios'
import { ElMessage } from 'element-plus'

// ✅ 核心修改：AI后端地址改用环境变量，自动切换本地/线上
const aiRequest = axios.create({
  baseURL: process.env.VUE_APP_AI_URL || 'http://localhost:8000',   
  timeout: 60000,                    
  headers: { 'Content-Type': 'application/json' }
})
// ===================== 认证模块 =====================
export const authApi = {
  login: (data) => request.post('/auth/login', data),
  register: (data) => request.post('/auth/register', data),
  getMe: () => request.get('/auth/me')
}

// ===================== 战队模块 =====================
export const teamApi = {
  getAll: () => request.get('/teams'),
  getById: (id) => request.get(`/teams/${id}`),
  getOfficialList: () => request.get('/teams/official/list'),
  getOfficialIntro: (teamId) => request.get(`/teams/intro/${teamId}`),
  search: (q) => request.get('/teams/search', { params: { q } }),
  getChampion: () => request.get('/teams/champion'),
  getTop: () => request.get('/teams/top'),
  create: (data) => request.post('/teams', data),
  update: (id, data) => request.put(`/teams/${id}`, data),
  delete: (id) => request.delete(`/teams/${id}`)
}

// ===================== 赛事模块 =====================
export const matchApi = {
  getAll: () => request.get('/matches'),
  getById: (id) => request.get(`/matches/${id}`),
  getByStatus: (status) => request.get(`/matches/status/${status}`),
  getByTeam: (teamId) => request.get(`/matches/team/${teamId}`),
  getRecent: (size = 10) => request.get('/matches/recent', { params: { size } }),
  getFinals: () => request.get('/matches/finals'),
  syncFromOfficial: (options) => {
    if (!options) return request.post('/matches/sync')
    if (typeof options === 'string') return request.post('/matches/sync', null, { params: { seasonId: options } })
    const seasonId = options.seasonId
    const seasonIds = Array.isArray(options.seasonIds) ? options.seasonIds.join(',') : options.seasonIds
    return request.post('/matches/sync', null, { params: { seasonId, seasonIds } })
  },
  updateReplay: (id, replayUrl) =>
    request.patch(`/admin/matches/${id}/replay`, null, { params: { replayUrl } }),
  create: (data) => request.post('/matches', data),
  update: (id, data) => request.put(`/matches/${id}`, data),
  updateScore: (id, scoreA, scoreB, status, result) =>
    request.patch(`/admin/matches/${id}/score`, null, { params: { scoreA, scoreB, status, result } }),
  delete: (id) => request.delete(`/matches/${id}`)
}

// ===================== 资讯模块 =====================
export const newsApi = {
  getList: (page = 0, size = 10) => request.get('/news', { params: { page, size } }),
  getById: (id) => request.get(`/news/${id}`),
  getFeatured: () => request.get('/news/featured'),
  getByCategory: (category) => request.get(`/news/category/${category}`),
  search: (q, page = 0, size = 10) => request.get('/news/search', { params: { q, page, size } }),
  create: (data) => request.post('/news', data),
  update: (id, data) => request.put(`/news/${id}`, data),
  delete: (id) => request.delete(`/news/${id}`)
}

// ===================== 社区模块 =====================
export const communityApi = {
  getPosts: (page = 0, size = 20) => request.get('/community/posts', { params: { page, size } }),
  createPost: (data) => request.post('/community/posts', data),
  getComments: (postId) => request.get(`/community/posts/${postId}/comments`),
  addComment: (postId, content) => request.post(`/community/posts/${postId}/comments`, { content }),
  likePost: (postId) => request.post(`/community/posts/${postId}/like`),
  deletePost: (postId) => request.delete(`/community/posts/${postId}`)
}

// ===================== 管理后台 =====================
export const adminApi = {
  getDashboard: () => request.get('/admin/dashboard'),
  getUsers: (page = 0, size = 20) => request.get('/admin/users', { params: { page, size } }),
  updateUserRole: (id, role) => request.put(`/admin/users/${id}/role`, null, { params: { role } }),
  toggleUser: (id, enabled) => request.put(`/admin/users/${id}/enabled`, null, { params: { enabled } }),
  deleteUser: (id) => request.delete(`/admin/users/${id}`),
  getPosts: (page = 0, size = 20) => request.get('/admin/posts', { params: { page, size } }),
  deletePost: (id) => request.delete(`/admin/posts/${id}`)
}

// ===================== AI请求拦截器（自动带Token） =====================
aiRequest.interceptors.request.use(
  (config) => {
    // ✅ 关键修复：统一Token键名为 kpl_token（和你的登录逻辑一致）
    const token = localStorage.getItem('kpl_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ===================== AI响应拦截器（统一错误处理） =====================
aiRequest.interceptors.response.use(
  (response) => {
    const res = response.data
    const isSuccess = res.success === true || res.code === 200 || res.status === 200 || response.status === 200
    
    if (!isSuccess) {
      const errorMsg = res.message || res.msg || 'AI服务操作失败'
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
    return res.data !== undefined ? res.data : res
  },
  (error) => {
    let errMsg = 'AI服务器异常'
    if (error.response) {
      switch (error.response.status) {
        case 404: errMsg = 'AI接口不存在'; break
        case 500: errMsg = 'AI服务器内部错误'; break
        case 401: errMsg = '未登录，请重新登录'; break
        default: errMsg = error.message || 'AI请求失败'
      }
    } else if (error.message.includes('timeout')) {
      errMsg = 'AI请求超时'
    } else if (!window.navigator.onLine) {
      errMsg = '网络断开，请检查网络'
    }
    ElMessage.error(errMsg)
    return Promise.reject(error)
  }
)

// ===================== ✅ 统一AI接口 =====================
export const aiApi = {
  quickChat: (question, sessionId = 'default', temperature = 0.3) => {
    const safeQuestion = (question || '').trim()
    if (!safeQuestion) {
      return Promise.reject(new Error('问题不能为空'))
    }
    return aiRequest.post('/ai/chat', {
      prompt: safeQuestion,
      temperature: temperature,
      session_id: sessionId
    })
  },

  tacticalAnalysis: (data) => aiRequest.post('/ai/tactical-analysis', data),
  
  coachAdvice: (data) => aiRequest.post('/ai/coach-advice', data),
  
  generateCommentary: (data) => aiRequest.post('/ai/commentary', data),

  analyzeTeam: (teamData, matchesHistory = []) => {
    const matchRecord = matchesHistory.map(m => 
      `${m.teamA?.name || m.teamA} ${m.scoreA ?? m.teamA?.score}:${m.scoreB ?? m.teamB?.score} ${m.teamB?.name || m.teamB} (${m.result || ''})`
    ).join('\n')

    const prompt = `请对KPL战队进行全方位实力分析：

战队信息：
- 名称：${teamData.name}
- 城市：${teamData.city || '未知'}
- 教练：${teamData.coach || '未知'}
- 当前排名：#${teamData.rank || teamData.springRank || '未知'}
- 胜率：${teamData.stats?.winRate || 'N/A'}%
- 近期战绩：${matchRecord || '暂无数据'}

选手阵容：
${(teamData.roster || []).map(p => 
  `- ${p.position || '未知'} ${p.name}（招牌英雄：${p.hero || p.signatureHero || '未知'}，KDA：${p.kd || p.kda || 'N/A'}）`
).join('\n')}

历史成就：
${(teamData.achievements || []).map(a => `- ${a}`).join('\n')}

请从以下维度进行分析（用中文回答，分点列出，每项给出1-10的评分）：
1. 整体实力评分和联赛定位
2. 各位置选手能力评估
3. 战术体系和风格特点
4. 强点和短板分析
5. 冲冠潜力预测
6. 改进建议

要求：专业、客观、基于数据，400-600字。`

    return aiRequest.post('/ai/chat', {
      prompt: prompt,
      temperature: 0.3,
      session_id: `team_analysis_${teamData.id || Date.now()}`
    })
  }
}

export default aiApi