import request from '@/api/request'

const aiService = {
  loading: false,
  error: null,
  lastResponse: null
}

export async function callHunyuanAI(messages, options = {}) {
  aiService.loading = true
  aiService.error = null

  try {
    const lastUser = [...(messages || [])].reverse().find(m => m.role === 'user')
    const last = lastUser || (messages || [])[messages.length - 1]
    const prompt = (last?.content || '').toString()

    const response = await request.post('/ai/hunyuan/chat', {
      prompt,
      temperature: options.temperature,
      topP: options.topP
    })

    const result = response?.data || ''
    aiService.lastResponse = result
    return result

  } catch (error) {
    aiService.error = error.message
    throw error
  } finally {
    aiService.loading = false
  }
}

export async function analyzeMatch(matchData) {
  const teamAName = typeof matchData?.teamA === 'string' ? matchData.teamA : matchData?.teamA?.name
  const teamBName = typeof matchData?.teamB === 'string' ? matchData.teamB : matchData?.teamB?.name
  const scoreA = matchData?.scoreA ?? matchData?.teamA?.score
  const scoreB = matchData?.scoreB ?? matchData?.teamB?.score

  const prompt = `请分析以下KPL比赛：

对阵双方：${teamAName || '未知'} vs ${teamBName || '未知'}
比分：${scoreA ?? 'N/A'} : ${scoreB ?? 'N/A'}
${matchData.result ? `结果：${matchData.result}` : ''}
${matchData.date ? `日期：${matchData.date}` : ''}
${matchData.stage ? `赛事阶段：${matchData.stage}` : ''}

请从以下几个维度进行专业分析（用中文回答，分点列出）：
1. 比赛整体走势和关键转折点
2. 双方战术执行和BP策略评价
3. 核心选手表现点评
4. 胜负原因深度剖析
5. 对后续比赛的启示和建议

要求：专业、客观、有数据支撑，300-500字。`

  return callHunyuanAI([{ role: 'user', content: prompt }])
}

export async function analyzeTeam(teamData, matchesHistory = []) {
  const matchRecord = matchesHistory.map(m => 
    `${m.teamA.name} ${m.teamA.score}:${m.teamB.score} ${m.teamB.name} (${m.result})`
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
  `- ${p.position} ${p.name}（招牌英雄：${p.hero || p.signatureHero || '未知'}，KDA：${p.kd || 'N/A'}）`
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

  return callHunyuanAI([{ role: 'user', content: prompt }])
}

export async function predictMatch(teamA, teamB, context = '') {
  const prompt = `请预测以下KPL比赛的结果：

对阵双方：
红方：${teamA.name}（近期胜率：${teamA.winRate || teamA.stats?.winRate || 'N/A'}%）
蓝方：${teamB.name}（近期胜率：${teamB.winRate || teamB.stats?.winRate || 'N/A'}%）

${context ? `\n背景信息：\n${context}` : ''}

请提供详细的赛果预测（用中文回答）：
1. 胜负预测及置信度（百分比）
2. 预计比分和局数
3. 关键对位分析（至少3组）
4. BP策略建议（双方各2-3个关键Ban/Pick）
5. 比赛胜负手预测
6. 风险因素提示

要求：给出明确的数据化预测，200-400字。`

  return callHunyuanAI([{ role: 'user', content: prompt }])
}

export async function generateTacticalAdvice(teamA, teamB, heroesPool = {}) {
  const prompt = `作为KPL专业教练，为以下对战提供BP和战术建议：

对阵：${teamA.name} vs ${teamB.name}

${Object.keys(heroesPool).length > 0 ? `
双方英雄池概况：
${Object.entries(heroesPool).map(([team, heroes]) => 
  `${team}擅长英雄：${heroes.join('、')}`
).join('\n')}
` : ''}

请提供（用中文回答）：
1. 推荐的Ban位选择（3-5个）及理由
2. 双方优先Pick建议（各2-3个）
3. 针对性战术打法（前期/中期/后期）
4. 视野控制和资源争夺策略
5. 团战阵型和配合要点
6. 应急预案（如果前期劣势怎么办）

要求：具体、可操作、符合当前版本环境，300-500字。`

  return callHunyuanAI([{ role: 'user', content: prompt }])
}

export function getAIService() {
  return aiService
}

export default {
  callHunyuanAI,
  analyzeMatch,
  analyzeTeam,
  predictMatch,
  generateTacticalAdvice,
  getAIService
}
