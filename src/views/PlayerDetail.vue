<template>
  <div class="player-detail-page page-container">
    <div v-if="!team || !player" class="empty-state">
      <el-empty description="未找到选手数据" />
    </div>
    <div v-else>
      <div class="player-banner">
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <div class="player-head">
            <div class="player-avatar">
              <img v-if="player.avatar" :src="player.avatar" :alt="player.name" class="player-avatar-img" />
              <div v-else class="player-avatar-fallback">
                <el-icon><User /></el-icon>
              </div>
            </div>
            <div class="player-main">
              <div class="player-title">
                <h1 class="player-name">{{ player.name }}</h1>
                <span v-if="player.isLegend" class="legend-badge">{{ player.legendTitle || '传奇' }}</span>
                <span v-if="player.isFMVP" class="fmvp-badge">FMVP</span>
                <span v-if="playerSource === 'substitutes'" class="sub-badge">替补</span>
              </div>
              <div class="player-subtitle">
                <span class="pos">{{ player.position || '未知位置' }}</span>
                <span v-if="player.realName" class="realname">· {{ player.realName }}</span>
                <span class="team">· {{ team.name }}</span>
              </div>
              <div v-if="player.signatureHero" class="signature">
                招牌英雄：<span class="signature-hero">{{ player.signatureHero }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="cards-grid">
        <div class="card">
          <div class="card-title">数据概览</div>
          <div class="stats">
            <div class="stat">
              <div class="label">KDA</div>
              <div class="value">{{ kda }}</div>
            </div>
            <div class="stat">
              <div class="label">胜率</div>
              <div class="value">{{ winRate }}</div>
            </div>
            <div class="stat">
              <div class="label">场次</div>
              <div class="value">{{ games }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">英雄池</div>
          <div class="heroes">
            <span v-for="hero in (player.heroPool || [])" :key="hero" class="hero-tag">{{ hero }}</span>
            <div v-if="(player.heroPool || []).length === 0" class="empty-heroes">暂无英雄池数据</div>
          </div>
        </div>
      </div>

      <div class="actions-row">
        <el-button @click="goBack">返回</el-button>
        <el-button type="primary" @click="goToTeam">查看战队</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeamStore } from '@/stores/team'
import { User } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const teamStore = useTeamStore()

const teamId = computed(() => Number(route.params.teamId))
const playerId = computed(() => String(route.params.playerId))

const team = computed(() => teamStore.getTeamById(teamId.value))

const positionMap = {
  1: '对抗路',
  2: '打野',
  3: '中路',
  4: '发育路',
  5: '游走'
}

const cleanText = (val) => {
  if (val === undefined || val === null) return ''
  return String(val).replace(/[`"]/g, '').trim()
}

const normalizeHeroPool = (raw) => {
  if (!Array.isArray(raw)) return []
  return raw
    .map(item => {
      if (typeof item === 'string') return item
      return item?.hero_name ?? item?.heroName ?? ''
    })
    .filter(Boolean)
}

const normalizePlayer = (p, source, index) => {
  const heroPool = normalizeHeroPool(p?.heroPool ?? p?.HeroPool)
  const idRaw =
    p?.id ??
    p?.player_id ??
    p?.playerId ??
    p?.PlayerID ??
    `${source}-${index}-${p?.player_name_short ?? p?.name ?? 'player'}`

  return {
    ...p,
    id: String(idRaw),
    name: p?.name ?? p?.player_name_short ?? '',
    realName: p?.realName ?? p?.player_name_real ?? '',
    position: p?.position_cn ?? p?.positionName ?? p?.position ?? positionMap[p?.position] ?? '未知位置',
    avatar: cleanText(p?.avatar ?? p?.photo),
    signatureHero: p?.signatureHero ?? heroPool[0] ?? '',
    heroPool,
    kda: p?.kda ?? p?.kd ?? p?.KDA,
    winCr: p?.winCr ?? p?.Wincr ?? p?.win_rate ?? p?.winRate,
    mvpCount: p?.mvpCount ?? p?.mvp ?? p?.MVPCount ?? 0,
    gamesPlayed: p?.gamesPlayed ?? p?.games ?? p?.Matchcount ?? 0,
    _source: source
  }
}

const normalizedPlayers = computed(() => {
  if (!team.value) return { roster: [], substitutes: [], all: [] }
  const roster = (team.value.roster || []).map((p, index) => normalizePlayer(p, 'roster', index))
  const substitutes = (team.value.substitutes || []).map((p, index) => normalizePlayer(p, 'substitutes', index))
  return { roster, substitutes, all: [...roster, ...substitutes] }
})

const isSameId = (a, b) => String(a) === String(b)

const playerSource = computed(() => {
  if (!team.value) return ''
  const inRoster = normalizedPlayers.value.roster.some(p => isSameId(p.id, playerId.value))
  if (inRoster) return 'roster'
  const inSub = normalizedPlayers.value.substitutes.some(p => isSameId(p.id, playerId.value))
  if (inSub) return 'substitutes'
  return ''
})

const player = computed(() => {
  if (!team.value) return null
  return normalizedPlayers.value.all.find(p => isSameId(p.id, playerId.value)) || null
})

const kda = computed(() => {
  const val = player.value?.kd ?? player.value?.kda ?? player.value?.KDA
  if (val === undefined || val === null || val === '') return 'N/A'
  return String(val)
})

const winRate = computed(() => {
  const raw = player.value?.winCr ?? player.value?.Wincr ?? player.value?.winRate
  const num = Number(raw)
  if (raw === undefined || raw === null || raw === '' || Number.isNaN(num)) return 'N/A'
  const percent = num <= 1 ? num * 100 : num
  return `${Math.round(percent)}%`
})

const games = computed(() => {
  const val = player.value?.gamesPlayed ?? player.value?.games ?? player.value?.Matchcount
  if (val === undefined || val === null || Number.isNaN(Number(val))) return 0
  return Number(val)
})

const goBack = () => router.back()
const goToTeam = () => router.push(`/team/${teamId.value}`)
</script>

<style lang="scss" scoped>
.player-detail-page {
  padding-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
}

.player-banner {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(0, 0, 0, 0.55));
  margin-bottom: 18px;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top, rgba(0, 212, 255, 0.2), rgba(0, 0, 0, 0.65));
}

.banner-content {
  position: relative;
  padding: 22px;
}

.player-head {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.player-avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.player-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  color: var(--bg-dark);
}

.player-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.player-name {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
}

.player-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.signature {
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.signature-hero {
  color: var(--primary-color);
  font-weight: 800;
}

.legend-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.25), rgba(139, 92, 246, 0.25));
  border: 1px solid rgba(0, 212, 255, 0.35);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  font-weight: 700;
}

.fmvp-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  border-radius: 10px;
  font-weight: 800;
}

.sub-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.75);
  border-radius: 10px;
  font-weight: 700;
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 18px;
}

.card-title {
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 12px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat {
  text-align: center;
  padding: 12px 10px;
  border-radius: 10px;
  background: rgba(0, 212, 255, 0.06);
  border: 1px solid rgba(0, 212, 255, 0.12);
}

.label {
  font-size: 12px;
  color: var(--text-muted);
}

.value {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 900;
  color: var(--primary-color);
}

.heroes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-tag {
  font-size: 12px;
  padding: 6px 10px;
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 10px;
  color: var(--primary-color);
}

.empty-heroes {
  font-size: 12px;
  color: var(--text-muted);
}

.actions-row {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
