export { teamsDB, getTeamById, getTeamByName, getChampionTeam, getTeamsByGroup, getTopTeams } from './teams'
export { matchesDB, upcomingMatches, getMatchById, getMatchesByTournament, getRecentMatches, getUpcomingByGroup } from './matches'
export { videosDB, liveStreams, getVideoById, getVideosByTournament, getPopularVideos, getRecentVideos } from './videos'

export const kplInfo = {
  league: '王者荣耀职业联赛',
  shortName: 'KPL',
  founded: 2016,
  organizer: '腾讯互动娱乐',
  officialSite: 'https://kpl.qq.com',
  currentSeason: '2026年春季赛',
  nextTournament: '2026年王者荣耀挑战者杯',
  totalTeams: 32,
  kplTeams: 18,
  currentChampion: {
    team: '苏州KSG',
    tournament: '2026年KPL春季赛总决赛',
    date: '2026-04-11',
    score: '4:0 vs 重庆狼队',
    mvp: '流浪（张恒）'
  },
  historicalChampions: [
    { season: '2026年春季赛', champion: '苏州KSG', score: '4:0', runnerUp: '重庆狼队' },
    { season: '2025年年度总决赛', champion: '成都AG超玩会', score: '4:2', runnerUp: '重庆狼队' },
    { season: '2025年夏季赛', champion: '成都AG超玩会', score: '4:1', runnerUp: '杭州LGD.NBW' },
    { season: '2025年挑战者杯', champion: '重庆狼队', score: '4:2', runnerUp: '广州TTG' },
    { season: '2024年年度总决赛', champion: '成都AG超玩会', score: '4:3', runnerUp: '广州TTG' },
    { season: '2024年夏季赛', champion: '成都AG超玩会', score: '4:1', runnerUp: '北京WB' },
    { season: '2024年春季赛', champion: '成都AG超玩会', score: '4:2', runnerUp: '深圳DYG' }
  ],
  records: {
    mostChampionships: { team: '重庆狼队', count: 10 },
    mostConsecutiveWins: { team: '成都AG超玩会', count: 6, period: '2024春-2025年总' },
    highestViewership: { match: '2025年年度总决赛', online: 45000000, onsite: 62196, record: '吉尼斯世界纪录' },
    longestMatch: { duration: '42分钟', teams: ['AG超玩会', 'TTG'], date: '2024-11-16' }
  },
  challengerCup2026: {
    name: '2026年王者荣耀挑战者杯',
    startDate: '2026-04-25',
    endDate: '2026-06-15',
    totalTeams: 32,
    stages: ['小组赛', '淘汰赛', '总决赛'],
    groups: {
      '第1组': ['苏州KSG（种子）', '广州TTG', '吵一吵', '佛山DRG'],
      '第2组': ['武汉eStarPro', 'GKE', '北京WB', '无锡TCG'],
      '第3组': ['重庆科技大学', 'WST', '济南RW侠', '成都AG超玩会'],
      '第4组': ['阿里巴巴PKQ', '杭州LGD.NBW', '全国大赛专业赛道', 'BOOM'],
      '第5组': ['重庆狼队（种子）', '好厚米', 'WG', '南通Hero久竞'],
      '第6组': ['SYG', 'ZDC', '上海EDG.M', '青训潜渊'],
      '第7组': ['LTG', '深圳DYG', '西安WE', '北京JDG'],
      '第8组': ['上海RNG.M', 'IKL春季赛冠军', '桐乡情久', '长沙TES.A']
    },
    prizePool: '待公布',
    broadcastPlatforms: ['腾讯视频', '虎牙直播', '斗鱼直播', '哔哩哔哩']
  }
}

export default kplInfo
