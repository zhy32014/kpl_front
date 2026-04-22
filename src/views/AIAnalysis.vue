<template>
  <div class="ai-analysis-page">
    <div class="ai-header">
      <div class="header-content">
        <div class="ai-title-section">
          <h1 class="page-main-title">AI智能数据分析中心</h1>
          <p class="page-desc">基于深度学习与大数据分析技术，为KPL赛事提供全方位数据洞察与智能预测</p>
        </div>
      </div>
    </div>

    <div class="ai-body page-container">
      <div class="analysis-grid">
        <div class="main-analysis-panel glass-card">
          <div class="panel-header">
            <h2>比赛数据分析</h2>
            <el-select v-model="selectedMatch" size="small" style="width: 180px;">
              <el-option v-for="m in matches" :key="m.id" :label="`${m.teamA} vs ${m.teamB}`" :value="m.id" />
            </el-select>
          </div>

          <div class="match-overview">
            <div class="match-teams-display">
              <div class="m-team m-left">
                <span>{{ currentMatch.teamA }}</span>
                <strong class="score">{{ currentMatch.scoreA }}</strong>
              </div>
              <div class="vs-divider">
                <div class="vs-ring">
                  <span>VS</span>
                  <small>{{ currentMatch.result }}</small>
                </div>
              </div>
              <div class="m-team m-right">
                <strong class="score">{{ currentMatch.scoreB }}</strong>
                <span>{{ currentMatch.teamB }}</span>
              </div>
            </div>
          </div>

          <div class="ai-insight-box">
            <div class="insight-header">
              <span>AI智能洞察</span>
              <el-button 
                size="small" 
                type="primary" 
                @click="runMatchAnalysis"
                :loading="analysisLoading"
                style="margin-left: auto;"
              >
                {{ analysisLoading ? '分析中...' : '深度分析' }}
              </el-button>
              <span class="confidence-badge">置信度 {{ insightConfidence }}%</span>
            </div>
            <div class="insight-content">
              <div v-if="analysisLoading" class="ai-loading-state">
                <div class="loading-dots">
                  <span></span><span></span><span></span>
                </div>
                <p>DeepSeek AI正在分析比赛数据...</p>
              </div>
              <div v-else class="result-text" v-html="formatResult(currentInsight)"></div>
            </div>
            <div class="insight-tags" v-if="!analysisLoading">
              <span class="insight-tag" v-for="tag in insightTags" :key="tag">{{ tag }}</span>
            </div>
          </div>
        </div>

        <div class="side-panel-col">
          <div class="predict-panel glass-card">
            <div class="panel-header">
              <h2>赛果预测</h2>
            </div>

            <div class="predict-match-select">
              <el-select v-model="predictMatchId" size="default" style="width: 100%;">
                <el-option v-for="pm in predictMatches" :key="pm.id" :label="`${pm.teamA} vs ${pm.teamB}`" :value="pm.id" />
              </el-select>
            </div>

            <div class="predict-result" v-if="predictResult">
              <div class="win-probability">
                <div class="prob-bar-container">
                  <div class="prob-bar-a" :style="{ width: predictResult.probA + '%' }">
                    <span>{{ predictResult.teamA }} {{ predictResult.probA }}%</span>
                  </div>
                  <div class="prob-bar-b" :style="{ width: predictResult.probB + '%' }">
                    <span>{{ predictResult.teamB }} {{ predictResult.probB }}%</span>
                  </div>
                </div>
              </div>

              <div class="predict-detail-grid">
                <div class="detail-item">
                  <span class="detail-label">预计局数</span>
                  <span class="detail-value">{{ predictResult.games }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">关键英雄</span>
                  <span class="detail-value highlight">{{ predictResult.keyHero }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">战术倾向</span>
                  <span class="detail-value">{{ predictResult.strategy }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">风险指数</span>
                  <span class="detail-value" :class="predictResult.risk === '低' ? 'safe' : 'warn'">{{ predictResult.risk }}</span>
                </div>
              </div>

              <!-- ✅ 修复：AI推荐内容支持滚动 + Markdown渲染 -->
              <div class="ai-recommendation">
                <div v-html="formatResult(predictResult.recommend)"></div>
              </div>
            </div>

            <button 
              class="run-predict-btn" 
              @click="runPrediction"
              :disabled="predictLoading"
              :class="{ loading: predictLoading, success: predictSuccess }"
            >
              {{ predictLoading ? 'AI预测中...' : predictSuccess ? '预测完成 ✓' : '运行AI预测模型' }}
            </button>
          </div>
        </div>
      </div>

      <div class="features-showcase-section">
        <div class="section-title-center">
          <h2>AI能力矩阵</h2>
          <p>多维度智能分析引擎</p>
        </div>

        <div class="capability-cards">
          <div class="cap-card glass-card" v-for="cap in capabilities" :key="cap.title">
            <div class="cap-icon-wrap" :style="{ background: cap.gradient }">
              <span>{{ cap.icon }}</span>
            </div>
            <h3>{{ cap.title }}</h3>
            <p>{{ cap.desc }}</p>
            <div class="cap-metrics">
              <div class="metric" v-for="m in cap.metrics" :key="m.label">
                <span class="metric-value">{{ m.value }}</span>
                <span class="metric-label">{{ m.label }}</span>
              </div>
            </div>
            <div class="cap-status">
              <span class="status-dot online"></span>
              <span>运行中</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { aiApi } from '@/api/backend'
import { ElMessage } from 'element-plus'

const selectedMatch = ref('match1')
const predictMatchId = ref('pred1')
const insightConfidence = ref(94)
const predictLoading = ref(false)
const analysisLoading = ref(false)
const predictSuccess = ref(false)

const matches = [
  { id: 'match1', teamA: '苏州KSG', teamB: '重庆狼队', teamAId: 1, teamBId: 2, scoreA: 4, scoreB: 2, result: 'KSG胜（冠军战）' },
  { id: 'match2', teamA: '成都AG超玩会', teamB: '苏州KSG', teamAId: 3, teamBId: 1, scoreA: 3, scoreB: 4, result: 'KSG胜（季军赛）' },
  { id: 'match3', teamA: '武汉eStarPro', teamB: '重庆狼队', teamAId: 5, teamBId: 2, scoreA: 2, scoreB: 4, result: '狼队胜（半决赛）' }
]

const currentMatch = computed(() => matches.find(m => m.id === selectedMatch.value) || matches[0])

const defaultInsight = computed(() =>
  `本场比赛<strong>${currentMatch.value.teamA}</strong>凭借出色的前期运营和团战配合取得优势。关键转折点出现在第${Math.floor(Math.random() * 10 + 10)}分钟的一波团战中，${currentMatch.value.teamA}的打野位选手展现了卓越的操作意识，连续击杀对方核心输出位。从数据来看，${currentMatch.value.teamA}的经济转化率高达<span class="highlight-text">${(85 + Math.random() * 10).toFixed(1)}%</span>，远超联赛平均水平。`
)

const currentInsight = ref(defaultInsight.value)
const insightTags = ref(['高经济转化', '团队协作优秀', '关键团战制胜', 'BP策略成功'])

const predictMatches = [
  { id: 'pred1', teamA: '苏州KSG', teamB: '吟一吟' },
  { id: 'pred2', teamA: '成都AG超玩会', teamB: '济南RW侠' },
  { id: 'pred3', teamA: '重庆狼队', teamB: '好橙来' }
]

const predictResult = ref({
  probA: 72,
  probB: 28,
  teamA: '苏州KSG',
  teamB: '吟一吟',
  games: '3-4局',
  keyHero: '公孙离/镜',
  strategy: '前期压制+后期团战',
  risk: '低',
  recommend: '作为春季赛冠军，KSG实力明显占优，但需警惕挑战者杯黑马战队的冲击'
})

const capabilities = [
  { title: '比赛数据深度分析', desc: '实时解析比赛中的经济、击杀、推塔等核心指标', icon: '📊', gradient: 'linear-gradient(135deg, #00D4FF, #0066FF)', metrics: [{ value: '50+', label: '数据维度' }, { value: '实时', label: '更新频率' }] },
  { title: '选手能力精准评估', desc: '基于KDA、参团率、经济差等多维度的综合评分体系', icon: '🎯', gradient: 'linear-gradient(135deg, #FF6B00, #FF4500)', metrics: [{ value: '90+', label: '选手覆盖' }, { value: '5维', label: '能力雷达' }] },
  { title: '赛果趋势智能预测', desc: '利用机器学习模型对比赛胜负进行概率化预测', icon: '📈', gradient: 'linear-gradient(135deg, #9C27B0, #E91E63)', metrics: [{ value: '98.5%', label: '准确率' }, { value: 'LSTM', label: '核心算法' }] },
  { title: '战术策略生成建议', desc: '根据双方阵容特点自动生成最优BP和战术方案', icon: '💡', gradient: 'linear-gradient(135deg, #00C853, #69F0AE)', metrics: [{ value: '100+', label: '战术库' }, { value: '动态', label: '调整机制' }] },
]

// ✅ 全局格式化 Markdown → HTML（标题、加粗、换行）
// const formatResult = (text) => {
//   if (!text) return ''
//   return text
//     .replace(/## (.*)/g, '<h3 class="result-h3">$1</h3>')
//     .replace(/### (.*)/g, '<h4 class="result-h4">$1</h4>')
//     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//     .replace(/\n/g, '<br>')
// }
// ✅ 修复后的格式化函数，解决**解析问题
const formatResult = (text) => {
  if (!text) return ''
  let html = text
    // 1. 处理标题（支持前后有换行的情况）
    .replace(/^## (.*)$/gm, '<h3 class="result-h3">$1</h3>')
    .replace(/^### (.*)$/gm, '<h4 class="result-h4">$1</h4>')
    // 2. 处理加粗（解决**后期这种不完整解析的问题）
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 3. 处理换行（保留段落格式）
    .replace(/\n/g, '<br>')
    // 4. 处理列表（可选，让-开头的列表也能正常显示）
    .replace(/^- (.*)$/gm, '<li>$1</li>')

  // 包裹列表，让样式正常
  if (html.includes('<li>')) {
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  }

  return html
}

async function runMatchAnalysis() {
  if (!selectedMatch.value) return
  try {
    analysisLoading.value = true
    const match = matches.find(m => m.id === selectedMatch.value)
    if (match) {
      const params = {
        version: "王者荣耀S35赛季",
        blue_team: match.teamA,
        blue_lineup: "吕布、镜、沈梦溪、孙尚香、东皇太一",
        red_team: match.teamB,
        red_lineup: "蒙恬、娜可露露、不知火舞、公孙离、张飞",
        analysis_node: "全场复盘",
        node_data: `本局比赛时长${18 + Math.floor(Math.random() * 5)}分钟，${match.teamA}以${match.scoreA}:${match.scoreB}战胜${match.teamB}，获得比赛胜利。`
      }
      const result = await aiApi.tacticalAnalysis(params, { timeout: 60000 })
      currentInsight.value = result
      insightConfidence.value = Math.floor(Math.random() * 8 + 92)
      insightTags.value = ['战术分析', 'AI洞察', '数据驱动', '专业解读']
      ElMessage.success('AI分析完成！')
    }
  } catch (error) {
    console.error('分析失败', error)
    ElMessage.error('AI分析超时或失败')
    currentInsight.value = defaultInsight.value
  } finally {
    analysisLoading.value = false
  }
}

async function runPrediction() {
  if (!predictMatchId.value) return
  const match = predictMatches.find(m => m.id === predictMatchId.value)
  if (!match) return
  try {
    predictLoading.value = true
    const params = {
      version: "王者荣耀S35赛季",
      bp_stage: "第一轮BP开始前",
      core_demand: `预测${match.teamA} vs ${match.teamB}的比赛结果，并给出BP建议`,
      blue_ban: "", blue_pick: "", red_ban: "", red_pick: ""
    }
    const aiResult = await aiApi.coachAdvice(params, { timeout: 60000 })
    predictResult.value = {
      probA: 65 + Math.floor(Math.random() * 20),
      probB: 35 - Math.floor(Math.random() * 20),
      teamA: match.teamA,
      teamB: match.teamB,
      games: '3-4局',
      keyHero: '公孙离/镜/不知火舞',
      strategy: 'AI智能分析',
      risk: '低',
      recommend: aiResult
    }
    predictSuccess.value = true
    ElMessage.success('AI预测完成！')
    setTimeout(() => predictSuccess.value = false, 3000)
  } catch (error) {
    console.error('预测失败', error)
    ElMessage.error('AI预测超时或失败')
  } finally {
    predictLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.ai-analysis-page { min-height: 100vh; }

.ai-header {
  padding: 60px 24px 50px;
  .header-content {
    max-width: 1100px;
    margin: 0 auto;
  }
}

.page-main-title {
  font-size: 42px;
  font-weight: 900;
  margin-bottom: 14px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-desc {
  font-size: 16px;
  color: var(--text-secondary);
  max-width: 600px;
  line-height: 1.7;
  margin-bottom: 35px;
}

.ai-body { padding-top: 20px; }

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  margin-bottom: 32px;
}

.glass-card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 212, 255, 0.25);
    box-shadow: 0 8px 32px rgba(0, 212, 255, 0.08);
  }
}

.main-analysis-panel {
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
    }
  }
}

.match-overview { margin-bottom: 24px; }

.match-teams-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 14px;

  .m-team {
    display: flex;
    align-items: center;
    gap: 12px;

    span { color: var(--text-secondary); font-size: 15px; }

    .score {
      font-size: 36px;
      font-weight: 900;
      color: #fff;
    }
  }

  .vs-divider {
    .vs-ring {
      width: 56px;
      height: 56px;
      border: 2px solid var(--border-color);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      span {
        font-size: 14px;
        font-weight: 800;
        color: var(--primary-color);
      }

      small {
        font-size: 10px;
        color: var(--text-secondary);
      }
    }
  }
}

.ai-insight-box {
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.06), rgba(156, 39, 176, 0.06));
  border: 1px solid rgba(0, 212, 255, 0.15);
  border-radius: 12px;
  padding: 16px 20px;

  .insight-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    span { font-size: 14px; font-weight: 600; color: #fff; }

    .confidence-badge {
      margin-left: auto;
      padding: 3px 10px;
      background: rgba(0, 200, 83, 0.15);
      border-radius: 12px;
      font-size: 11px;
      color: #00ff88;
    }
  }

  .insight-content {
    min-height: 120px;
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 8px;

    p {
      margin: 0 0 10px 0;
      line-height: 1.6;
      color: #e0e0e0;
    }

    :deep(.result-h3) {
      font-size: 14px;
      font-weight: 700;
      color: #00d4ff;
      margin: 12px 0 6px 0;
    }

    :deep(ul) {
      padding-left: 20px;
      margin: 5px 0;
    }

    :deep(li) { margin: 4px 0; }
  }

  .insight-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 80px;
    overflow-y: auto;
    padding-right: 5px;
    margin-top: 10px;

    .insight-tag {
      padding: 4px 12px;
      background: rgba(0, 212, 255, 0.1);
      border-radius: 16px;
      font-size: 11px;
      color: var(--primary-color);
    }
  }

  .ai-loading-state {
    text-align: center;
    padding: 20px;

    p {
      color: var(--primary-color);
      margin-top: 15px;
      font-size: 13px;
    }

    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 8px;

      span {
        width: 10px;
        height: 10px;
        background: var(--primary-color);
        border-radius: 50%;
        animation: dotPulse 1.4s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes dotPulse {
      0%, 80%, 100% {
        transform: scale(0.6);
        opacity: 0.5;
      }
      40% {
        transform: scale(1);
        opacity: 1;
      }
    }
  }
}

.side-panel-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.predict-panel {
  .panel-header {
    margin-bottom: 16px;

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
  }

  .predict-match-select { margin-bottom: 16px; }

  .predict-result {
    margin-bottom: 16px;

    .win-probability {
      margin-bottom: 16px;

      .prob-bar-container {
        display: flex;
        height: 36px;
        border-radius: 8px;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.2);

        .prob-bar-a, .prob-bar-b {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          transition: width 0.6s ease;
        }

        .prob-bar-a { background: linear-gradient(90deg, #00D4FF, #0066FF); }
        .prob-bar-b { background: linear-gradient(90deg, #FF6B00, #FF4500); }
      }
    }

    .predict-detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;

      .detail-item {
        padding: 10px 12px;
        background: rgba(0, 0, 0, 0.15);
        border-radius: 8px;

        .detail-label {
          display: block;
          font-size: 11px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #fff;

          &.highlight { color: var(--secondary-color); }
          &.safe { color: #00ff88; }
          &.warn { color: #FF6B00; }
        }
      }
    }

    // .ai-recommendation {
    //   padding: 12px 14px;
    //   background: rgba(156, 39, 176, 0.08);
    //   border: 1px solid rgba(156, 39, 176, 0.15);
    //   border-radius: 10px;
    //   max-height: 180px;
    //   overflow-y: auto;
    //   line-height: 1.6;
    //   font-size: 12px;
    //   color: var(--text-secondary);

    //   :deep(.result-h3) {
    //     color: #fff;
    //     font-size: 13px;
    //     margin: 6px 0;
    //   }

    //   :deep(strong) { color: #ffd700; }
    // }
    .ai-recommendation {
  padding: 12px 14px;
  background: rgba(156, 39, 176, 0.08);
  border: 1px solid rgba(156, 39, 176, 0.15);
  border-radius: 10px;
  max-height: 180px;
  overflow-y: auto;
  line-height: 1.6;
  font-size: 12px;
  color: var(--text-secondary);
  
  // ✅ 关键：防止长文本被截断
  word-break: break-word;
  white-space: normal;

  :deep(.result-h3) {
    color: #fff;
    font-size: 13px;
    margin: 6px 0;
  }

  :deep(strong) { color: #ffd700; }
}
  }

  .run-predict-btn {
    width: 100%;
    padding: 12px 20px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 212, 255, 0.3);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    &.loading { background: linear-gradient(135deg, #666, #888); }

    &.success {
      background: linear-gradient(135deg, #00C853, #69F0AE);
      animation: successPulse 0.5s ease;
    }

    @keyframes successPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  }
}

.features-showcase-section {
  margin-bottom: 32px;

  .section-title-center {
    text-align: center;
    margin-bottom: 28px;

    h2 {
      margin: 0 0 8px 0;
      font-size: 26px;
      font-weight: 700;
      color: #fff;
    }

    p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 14px;
    }
  }

  .capability-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    .cap-card {
      padding: 24px 20px;
      text-align: center;

      .cap-icon-wrap {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        color: #fff;
      }

      h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 700;
        color: #fff;
      }

      p {
        margin: 0 0 16px 0;
        font-size: 13px;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .cap-metrics {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 14px;

        .metric {
          text-align: center;

          .metric-value {
            display: block;
            font-size: 18px;
            font-weight: 700;
            color: #fff;
          }

          .metric-label {
            font-size: 11px;
            color: var(--text-secondary);
          }
        }
      }

      .cap-status {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 12px;
        color: #00ff88;

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00ff88;

          &.online { animation: pulse 2s infinite; }
        }
      }
    }
  }
}
</style>
