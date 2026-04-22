<template>
  <div class="match-detail-page page-container">
    <div v-if="loading" class="empty-state">
      <el-empty description="加载中..." />
    </div>
    <div v-else-if="!match" class="empty-state">
      <el-empty description="未找到比赛数据" />
    </div>
    <div v-else>
      <div class="match-banner">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <div class="teams-row">
            <div class="team-block">
              <TeamLogo :team-id="match.teamAId || match.teamA?.id || match.id" :logo-url="match.teamALogo" :size="90" />
              <div class="team-name">{{ match.teamAName || match.teamA?.name }}</div>
            </div>
            <div class="score-block">
              <div class="status">{{ statusText }}</div>
              <div class="score" v-if="match.status !== 'upcoming'">
                <span :class="{ win: scoreA > scoreB }">{{ scoreA }}</span>
                <span class="sep">:</span>
                <span :class="{ win: scoreB > scoreA }">{{ scoreB }}</span>
              </div>
              <div class="score" v-else>
                <span class="vs">VS</span>
              </div>
              <div class="meta">
                <span class="meta-item">{{ match.matchDate || match.date }}</span>
                <span class="meta-item">{{ match.matchTime || match.time }}</span>
                <span class="meta-item" v-if="match.venue">· {{ match.venue }}</span>
              </div>
            </div>
            <div class="team-block">
              <TeamLogo :team-id="match.teamBId || match.teamB?.id || match.id" :logo-url="match.teamBLogo" :size="90" />
              <div class="team-name">{{ match.teamBName || match.teamB?.name }}</div>
            </div>
          </div>
          <div class="headline">
            <div class="tournament">{{ match.tournament }}</div>
            <div class="stage">{{ match.stage }}</div>
          </div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-card">
          <div class="card-title">比赛信息</div>
          <div class="kv">
            <div class="k">比赛ID</div>
            <div class="v">{{ match.id }}</div>
            <div class="k">赛制</div>
            <div class="v">{{ match.format || '-' }}</div>
            <div class="k">结果</div>
            <div class="v">{{ match.result || '-' }}</div>
            <div class="k">比赛回放</div>
            <div class="v">
              <a v-if="match.replayUrl" :href="match.replayUrl" target="_blank" class="replay-link">打开回放</a>
              <span v-else>-</span>
              <el-button class="edit-replay-btn" size="small" text type="primary" @click="openReplayDialog">更新</el-button>
            </div>
            <div class="k">备注</div>
            <div class="v">{{ match.note || '-' }}</div>
          </div>
        </div>

        <!-- <div class="detail-card">
          <div class="card-title">战队信息</div>
          <div class="kv">
            <div class="k">A队ID</div>
            <div class="v">{{ match.teamAId || '-' }}</div>
            <div class="k">B队ID</div>
            <div class="v">{{ match.teamBId || '-' }}</div>
          </div>
        </div> -->
      </div>

      <div class="actions-row">
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <el-dialog v-model="replayDialogVisible" title="更新比赛回放" width="520px">
      <el-input v-model="replayUrlInput" placeholder="请输入回放链接（http/https）" clearable />
      <template #footer>
        <el-button @click="replayDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="replaySaving" @click="saveReplay">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { matchApi } from '@/api/backend'
import { useMatchStore } from '@/stores/match'
import TeamLogo from '@/components/TeamLogo.vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const matchStore = useMatchStore()

const loading = ref(false)
const match = ref(null)

const replayDialogVisible = ref(false)
const replayUrlInput = ref('')
const replaySaving = ref(false)

const scoreA = computed(() => match.value?.teamAScore ?? match.value?.teamA?.score ?? 0)
const scoreB = computed(() => match.value?.teamBScore ?? match.value?.teamB?.score ?? 0)

const statusText = computed(() => {
  if (!match.value) return ''
  if (match.value.status === 'live') return '进行中'
  if (match.value.status === 'finished') return '已结束'
  return '即将开始'
})

const loadMatch = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const inStore = matchStore.getMatchById(id)
    if (inStore) {
      match.value = inStore
      return
    }
    const res = await matchApi.getById(id)
    match.value = res.data || null
  } finally {
    loading.value = false
  }
}

const openReplayDialog = () => {
  replayUrlInput.value = match.value?.replayUrl || ''
  replayDialogVisible.value = true
}

const saveReplay = async () => {
  if (!match.value?.id) return
  const url = (replayUrlInput.value || '').trim()
  if (!url) {
    ElMessage.error('请输入回放链接')
    return
  }

  replaySaving.value = true
  try {
    const res = await matchApi.updateReplay(match.value.id, url)
    match.value = res.data || match.value
    replayDialogVisible.value = false
    ElMessage.success('回放链接已更新')
  } catch (e) {
    ElMessage.error(e?.message || '更新失败')
  } finally {
    replaySaving.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(loadMatch)
</script>

<style lang="scss" scoped>
.match-detail-page {
  padding-top: 30px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.match-banner {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 0, 0, 0.55));
  margin-bottom: 24px;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(0, 212, 255, 0.2), rgba(0, 0, 0, 0.65));
}

.banner-content {
  position: relative;
  padding: 24px;
}

.teams-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.team-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.team-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.score-block {
  text-align: center;
  min-width: 220px;
}

.status {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.score {
  font-size: 34px;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 10px;
}

.sep {
  font-size: 18px;
  color: var(--text-muted);
}

.vs {
  font-size: 16px;
  color: var(--text-muted);
  letter-spacing: 2px;
}

.win {
  color: #00C853;
}

.meta {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-item + .meta-item {
  margin-left: 8px;
}

.headline {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.tournament {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.stage {
  font-size: 12px;
  color: var(--text-muted);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px;
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}

.kv {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 10px 12px;
  font-size: 13px;
}

.k {
  color: var(--text-muted);
}

.v {
  color: var(--text-primary);
  word-break: break-all;
}

.replay-link {
  color: var(--primary-color);
  font-weight: 700;
  text-decoration: none;
}

.edit-replay-btn {
  margin-left: 10px;
}

.actions-row {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .score-block {
    min-width: 100%;
  }
  .teams-row {
    justify-content: center;
  }
}
</style>
