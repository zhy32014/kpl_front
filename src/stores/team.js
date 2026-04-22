import { defineStore } from 'pinia'
import { teamsDB } from '../data/teams'
import { teamApi } from '@/api/backend'

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const calcWinRate = (wins, losses, fallback = 0) => {
  const w = toNum(wins)
  const l = toNum(losses)
  const total = w + l
  if (total <= 0) return Math.round(toNum(fallback) * 100) / 100
  return Math.round((w / total) * 10000) / 100
}

const normalizeTeamName = (name) => {
  if (!name) return ''
  return String(name)
    .toLowerCase()
    .replace(/[.\s]/g, '')
    .replace(/超玩会|久竞|战队|俱乐部|电竞/g, '')
    .replace(/成都|佛山|深圳|上海|武汉|南通|北京|杭州|济南|长沙|广州|西安|无锡|桐乡|重庆/g, '')
}

const TEAMID_OVERRIDES = {
  ksg: 'KPL2026S1_ytg'
}

const normalizeShortKey = (val) => {
  if (!val) return ''
  return String(val).toLowerCase().replace(/[.\s]/g, '')
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

const extractPlayersFromAny = (payload) => {
  const looksLikePlayer = (obj) =>
    obj &&
    typeof obj === 'object' &&
    (obj.player_name_short || obj.player_name_real || obj.HeroPool || obj.KDA || obj.Matchcount)

  const scan = (node, depth) => {
    if (!node || depth > 6) return null
    if (Array.isArray(node)) {
      const arr = node
      if (arr.length > 0 && arr.every(x => x && typeof x === 'object') && arr.some(looksLikePlayer)) return arr
      for (const item of arr) {
        const found = scan(item, depth + 1)
        if (found) return found
      }
      return null
    }
    if (typeof node === 'object') {
      const directKeys = [
        'player_list',
        'playerList',
        'players',
        'roster',
        'team_players',
        'team_player',
        'team_member',
        'members'
      ]
      for (const k of directKeys) {
        const v = node[k]
        if (Array.isArray(v)) {
          const found = scan(v, depth + 1)
          if (found) return found
        }
      }
      for (const k of Object.keys(node)) {
        const found = scan(node[k], depth + 1)
        if (found) return found
      }
    }
    return null
  }

  return scan(payload, 0) || []
}

const mapOfficialPlayer = (p, index) => {
  const heroPool = normalizeHeroPool(p?.heroPool ?? p?.HeroPool)
  const idRaw =
    p?.id ??
    p?.player_id ??
    p?.playerId ??
    p?.PlayerID ??
    `${p?.player_name_short ?? p?.name ?? 'player'}-${index}`

  const cleanText = (val) => {
    if (val === undefined || val === null) return ''
    return String(val).replace(/[`"]/g, '').trim()
  }

  return {
    ...p,
    id: String(idRaw),
    name: p?.name ?? p?.player_name_short ?? '',
    realName: p?.realName ?? p?.player_name_real ?? '',
    position: p?.position_cn ?? p?.positionName ?? p?.position ?? '',
    avatar: cleanText(p?.avatar ?? p?.photo),
    signatureHero: p?.signatureHero ?? heroPool[0] ?? '',
    heroPool,
    kda: p?.kda ?? p?.kd ?? p?.KDA,
    gamesPlayed: p?.gamesPlayed ?? p?.games ?? p?.Matchcount ?? 0,
    winCr: p?.winCr ?? p?.Wincr ?? p?.winRate ?? p?.win_rate
  }
}

const extractHonorsFromAny = (payload) => {
  const looksLikeHonor = (obj) =>
    obj &&
    typeof obj === 'object' &&
    (obj.honor_name || obj.honor_list || obj.honor_icon)

  const scan = (node, depth) => {
    if (!node || depth > 6) return null
    if (Array.isArray(node)) {
      const arr = node
      if (arr.length > 0 && arr.every(x => x && typeof x === 'object') && arr.some(looksLikeHonor)) return arr
      for (const item of arr) {
        const found = scan(item, depth + 1)
        if (found) return found
      }
      return null
    }
    if (typeof node === 'object') {
      const directKeys = [
        'team_honor',
        'teamHonor',
        'honors',
        'honor_list',
        'honorList'
      ]
      for (const k of directKeys) {
        const v = node[k]
        if (Array.isArray(v)) {
          const found = scan(v, depth + 1)
          if (found) return found
        }
      }
      for (const k of Object.keys(node)) {
        const found = scan(node[k], depth + 1)
        if (found) return found
      }
    }
    return null
  }

  return scan(payload, 0) || []
}

const mapOfficialHonor = (h) => {
  const cleanText = (val) => {
    if (val === undefined || val === null) return ''
    return String(val).replace(/[`"]/g, '').trim()
  }
  const name = h?.honor_name ?? h?.honorName ?? ''
  const icon = cleanText(h?.honor_icon ?? h?.honorIcon ?? '')
  const list = h?.honor_list ?? h?.honorList ?? []
  return {
    name,
    icon,
    list: Array.isArray(list) ? list : []
  }
}

export const useTeamStore = defineStore('team', {
  state: () => ({
    teams: teamsDB,
    officialTeams: [],
    officialTeamIntroCache: {},
    officialPlayersCache: {},
    officialHonorsCache: {},
    currentTeam: null
  }),
  getters: {
    getTeamById: (state) => (id) => {
      return state.teams.find(team => team.id === id)
    },
    officialTeamSelectOptions: (state) => {
      if (!Array.isArray(state.officialTeams) || state.officialTeams.length === 0) return []
      return state.officialTeams
        .map(t => ({
          id: t.teamid ?? t.id,
          name: t.team_name ?? t.name,
          logoUrl: t.logo ?? t.logoUrl ?? ''
        }))
        .filter(t => t.id && t.name)
    },
    getOfficialTeamId: (state) => (team) => {
      const list = state.officialTeams
      if (!Array.isArray(list) || list.length === 0 || !team) return ''

      const overrideByShort = TEAMID_OVERRIDES[normalizeShortKey(team.shortName)]
      if (overrideByShort) return overrideByShort
      const overrideByName = TEAMID_OVERRIDES[normalizeTeamName(team.name)]
      if (overrideByName) return overrideByName

      const candidates = [team.teamid, team.officialTeamId, team.shortName, team.name]
        .filter(Boolean)
        .map(v => String(v))

      for (const c of candidates) {
        const byId = list.find(o => String(o.teamid ?? o.id) === c)
        if (byId?.teamid) return String(byId.teamid)
      }

      const localName = normalizeTeamName(team.name)
      const byNormalizedName = list.find(o => normalizeTeamName(o.team_name ?? o.name) === localName)
      if (byNormalizedName?.teamid) return String(byNormalizedName.teamid)

      const short = String(team.shortName || '').toLowerCase().replace(/[.\s]/g, '')
      if (short) {
        const byShort = list.find(o => String(o.teamid ?? '').toLowerCase().endsWith(`_${short}`))
        if (byShort?.teamid) return String(byShort.teamid)
      }

      return ''
    },
    getOfficialPlayers: (state) => (teamId) => {
      if (!teamId) return []
      const key = String(teamId)
      const arr = state.officialPlayersCache?.[key]
      return Array.isArray(arr) ? arr : []
    },
    getOfficialHonors: (state) => (teamId) => {
      if (!teamId) return []
      const key = String(teamId)
      const arr = state.officialHonorsCache?.[key]
      return Array.isArray(arr) ? arr : []
    },
    getOfficialLogo: (state) => (team) => {
      const list = state.officialTeams
      if (!Array.isArray(list) || list.length === 0 || !team) return ''

      const overrideTeamId = TEAMID_OVERRIDES[normalizeShortKey(team.shortName)] || TEAMID_OVERRIDES[normalizeTeamName(team.name)]
      if (overrideTeamId) {
        const byOverride = list.find(o => String(o.teamid ?? o.id) === String(overrideTeamId))
        if (byOverride) return byOverride?.logo ?? byOverride?.logoUrl ?? ''
      }

      const candidates = [
        team.teamid,
        team.id,
        team.shortName,
        team.name
      ]
        .filter(Boolean)
        .map(v => String(v))

      const findMatch = () => {
        for (const c of candidates) {
          const exactById = list.find(o => String(o.teamid ?? o.id) === c)
          if (exactById) return exactById
          const exactByName = list.find(o => String(o.team_name ?? o.name) === c)
          if (exactByName) return exactByName
        }
        const localName = normalizeTeamName(team.name)
        const byNormalizedName = list.find(o => normalizeTeamName(o.team_name ?? o.name) === localName)
        if (byNormalizedName) return byNormalizedName

        const short = String(team.shortName || '').toLowerCase().replace(/[.\s]/g, '')
        if (short) {
          const byShort = list.find(o => {
            const officialId = String(o.teamid ?? '').toLowerCase()
            const officialName = normalizeTeamName(o.team_name ?? o.name)
            return officialId.endsWith(`_${short}`) || officialName.includes(short)
          })
          if (byShort) return byShort
        }
        return null
      }

      const match = findMatch()
      return match?.logo ?? match?.logoUrl ?? ''
    },
    topTeams: (state) => {
      return [...state.teams]
        .sort((a, b) => a.springRank - b.springRank)
        .slice(0, 6)
        .map(team => ({
          ...team,
          rank: team.springRank,
          wins: toNum(team.stats?.wins ?? team.wins),
          losses: toNum(team.stats?.losses ?? team.losses),
          winRate: calcWinRate(
            team.stats?.wins ?? team.wins,
            team.stats?.losses ?? team.losses,
            team.stats?.winRate ?? team.winRate
          )
        }))
    },
    championTeam: (state) => {
      return state.teams.find(team => team.isChampion)
    },
    teamsByGroup: (state) => {
      return state.teams.reduce((groups, team) => {
        const group = team.group || '未分组'
        if (!groups[group]) groups[group] = []
        groups[group].push(team)
        return groups
      }, {})
    },
    getPlayersByTeamId: (state) => (teamId) => {
      const team = state.teams.find(t => t.id === teamId)
      return team ? [...(team.roster || []), ...(team.substitutes || [])] : []
    }
  },
  actions: {
    async fetchOfficialTeamList() {
      try {
        const res = await teamApi.getOfficialList()
        if (res?.success && Array.isArray(res.data)) {
          this.officialTeams = res.data
        }
      } catch (e) {
        this.officialTeams = []
      }
    },
    async fetchOfficialTeamIntro(teamId) {
      const key = String(teamId || '')
      if (!key) throw new Error('teamId不能为空')
      if (this.officialTeamIntroCache[key]) return this.officialTeamIntroCache[key]
      const res = await teamApi.getOfficialIntro(key)
      this.officialTeamIntroCache[key] = res.data
      return res.data
    },
    async fetchOfficialPlayers(teamId) {
      const key = String(teamId || '')
      if (!key) throw new Error('teamId不能为空')
      if (Array.isArray(this.officialPlayersCache[key]) && this.officialPlayersCache[key].length > 0) {
        return this.officialPlayersCache[key]
      }
      const intro = await this.fetchOfficialTeamIntro(key)
      const rawPlayers = extractPlayersFromAny(intro)
      const mapped = rawPlayers.map((p, idx) => mapOfficialPlayer(p, idx))
      this.officialPlayersCache[key] = mapped
      return mapped
    },
    async fetchOfficialHonors(teamId) {
      const key = String(teamId || '')
      if (!key) throw new Error('teamId不能为空')
      if (Array.isArray(this.officialHonorsCache[key]) && this.officialHonorsCache[key].length > 0) {
        return this.officialHonorsCache[key]
      }
      const intro = await this.fetchOfficialTeamIntro(key)
      const rawHonors = extractHonorsFromAny(intro)
      const mapped = rawHonors.map(mapOfficialHonor).filter(h => h.name || (h.list || []).length > 0)
      this.officialHonorsCache[key] = mapped
      return mapped
    },
    setCurrentTeam(team) {
      this.currentTeam = team
    }
  }
})
