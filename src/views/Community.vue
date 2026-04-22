<template>
  <div class="community-page page-container">
    <div class="page-header">
      <h1 class="page-title">社区互动</h1>
      <p class="page-subtitle">与万千玩家一起讨论赛事，分享精彩</p>
    </div>

    <div class="community-layout">
      <div class="main-content">
        <div class="post-composer">
          <div class="composer-avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="composer-input">
            <el-input
              v-model="newPost"
              type="textarea"
              :rows="3"
              placeholder="分享你对比赛的看法..."
            />
            <div class="composer-actions">
              <div class="actions-left">
                <el-button text><el-icon><Picture /></el-icon> 图片</el-button>
                <el-button text><el-icon><VideoCamera /></el-icon> 视频</el-button>
                <el-button text><el-icon><Location /></el-icon> 位置</el-button>
              </div>
              <el-button type="primary">发布</el-button>
            </div>
          </div>
        </div>

        <div class="posts-list">
          <div class="post-card" v-for="post in posts" :key="post.id">
            <div class="post-header">
              <div class="author">
                <div class="avatar">
                  <el-icon><User /></el-icon>
                </div>
                <div class="info">
                  <span class="name">{{ post.author }}</span>
                  <span class="time">{{ post.time }}</span>
                </div>
              </div>
              <el-button text><el-icon><More /></el-icon></el-button>
            </div>
            <div class="post-content">
              <p>{{ post.content }}</p>
              <div class="post-images" v-if="post.images">
                <div class="image" v-for="i in post.images" :key="i"></div>
              </div>
            </div>
            <div class="post-footer">
              <div class="actions">
                <el-button text>
                  <el-icon><Star /></el-icon>
                  {{ post.likes }}
                </el-button>
                <el-button text>
                  <el-icon><ChatDotRound /></el-icon>
                  {{ post.comments }}
                </el-button>
                <el-button text>
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar">
        <div class="hot-topics">
          <h3 class="sidebar-title">
            <el-icon><TrendCharts /></el-icon>
            热门话题
          </h3>
          <div class="topic-list">
            <div class="topic-item" v-for="(topic, index) in hotTopics" :key="index">
              <span class="rank" :class="{ hot: index < 3 }">{{ index + 1 }}</span>
              <span class="name">{{ topic.name }}</span>
              <span class="count">{{ topic.count }}讨论</span>
            </div>
          </div>
        </div>

        <div class="fan-ranking">
          <h3 class="sidebar-title">
            <el-icon><Medal /></el-icon>
            应援榜
          </h3>
          <div class="ranking-list">
            <div class="ranking-item" v-for="(team, index) in fanRanking" :key="team.id">
              <span class="rank" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
              <TeamLogo :team-id="team.id" :size="36" />
              <span class="team-name">{{ team.name }}</span>
              <span class="fans">{{ team.fans }}万粉丝</span>
            </div>
          </div>
        </div>

        <div class="active-users">
          <h3 class="sidebar-title">
            <el-icon><User /></el-icon>
            活跃用户
          </h3>
          <div class="user-list">
            <div class="user-item" v-for="i in 5" :key="i">
              <div class="avatar">
                <el-icon><User /></el-icon>
              </div>
              <div class="info">
                <span class="name">电竞达人{{ i }}</span>
                <span class="posts">发布 128 帖子</span>
              </div>
              <el-button size="small">关注</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TeamLogo from '@/components/TeamLogo.vue'
import { 
  User, Picture, VideoCamera, Location, More,
  Star, ChatDotRound, Share, TrendCharts, Medal
} from '@element-plus/icons-vue'

const newPost = ref('')

const posts = ref([
  {
    id: 1,
    author: 'AG超玩会粉丝',
    time: '10分钟前',
    content: '今天的比赛太精彩了！一诺的马可波罗简直神级操作，最后一波团战直接五杀！AG冲冲冲！',
    images: 3,
    likes: 256,
    comments: 89
  },
  {
    id: 2,
    author: '电竞分析师',
    time: '30分钟前',
    content: '从数据来看，AG超玩会这赛季的团战配合率提升了15%，这主要归功于新辅助的加入。期待他们在季后赛的表现！',
    images: 0,
    likes: 189,
    comments: 56
  },
  {
    id: 3,
    author: '王者荣耀玩家',
    time: '1小时前',
    content: '有没有人组队开黑？钻石段位，求带飞！',
    images: 0,
    likes: 23,
    comments: 45
  }
])

const hotTopics = ref([
  { name: 'AG超玩会夺冠热门', count: '2.3万' },
  { name: '一诺MVP表现', count: '1.8万' },
  { name: '春季赛最佳阵容', count: '1.5万' },
  { name: '新英雄强度讨论', count: '1.2万' },
  { name: 'KPL选手转会', count: '9千' }
])

const fanRanking = ref([
  { id: 1, name: 'AG超玩会', shortName: 'AG', fans: 520, color: '#FF6B00' },
  { id: 2, name: 'eStarPro', shortName: 'eStar', fans: 480, color: '#FFD700' },
  { id: 3, name: 'DYG', shortName: 'DYG', fans: 420, color: '#00D4FF' },
  { id: 4, name: 'TTG', shortName: 'TTG', fans: 380, color: '#FF4444' },
  { id: 5, name: 'QGhappy', shortName: 'QG', fans: 350, color: '#00FF00' }
])
</script>

<style lang="scss" scoped>
.community-page {
  padding-top: 30px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 16px;
}

.community-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 25px;
}

.post-composer {
  display: flex;
  gap: 15px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.composer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--bg-dark);
  flex-shrink: 0;
}

.composer-input {
  flex: 1;
  
  .composer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
  }
  
  .actions-left {
    display: flex;
    gap: 5px;
  }
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
  }
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.author {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .avatar {
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: var(--gradient-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
  }
  
  .info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    
    .name {
      font-weight: 500;
    }
    
    .time {
      font-size: 12px;
      color: var(--text-muted);
    }
  }
}

.post-content {
  p {
    line-height: 1.6;
    margin-bottom: 15px;
  }
  
  .post-images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    
    .image {
      height: 100px;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(255, 107, 0, 0.2));
      border-radius: 8px;
    }
  }
}

.post-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
  
  .actions {
    display: flex;
    gap: 20px;
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hot-topics,
.fan-ranking,
.active-users {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  
  .el-icon {
    color: var(--primary-color);
  }
}

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.topic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  
  .rank {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    background: var(--bg-darker);
    color: var(--text-muted);
    
    &.hot {
      background: var(--gradient-secondary);
      color: white;
    }
  }
  
  .name {
    flex: 1;
  }
  
  .count {
    font-size: 12px;
    color: var(--text-muted);
  }
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .rank {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }
  
  .team-logo {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    color: white;
  }
  
  .team-name {
    flex: 1;
    font-size: 14px;
  }
  
  .fans {
    font-size: 12px;
    color: var(--text-muted);
  }
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  
  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: var(--bg-dark);
  }
  
  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .name {
      font-size: 14px;
      font-weight: 500;
    }
    
    .posts {
      font-size: 12px;
      color: var(--text-muted);
    }
  }
}

@media (max-width: 1024px) {
  .community-layout {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
