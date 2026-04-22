<template>
  <div class="ai-sidebar-entry">
    <button class="ai-float-btn" @click="openPanel" aria-label="打开AI助手">
      <el-icon><ChatDotRound /></el-icon>
      <span>AI助手</span>
    </button>

    <el-drawer
      v-model="visible"
      title="KPL AI 对话助手"
      direction="rtl"
      size="420px"
      :with-header="true"
      :destroy-on-close="false"
      class="ai-chat-drawer"
    >
      <div class="ai-chat-container">
        <div class="tips">
          你可以直接提问，例如：请分析狼队本赛季的战术风格。
        </div>

        <el-scrollbar class="chat-scroll">
          <div class="chat-list">
            <div
              v-for="(msg, idx) in messages"
              :key="idx"
              class="msg-item"
              :class="msg.role"
            >
              <div class="msg-content">{{ msg.content }}</div>
            </div>
          </div>
        </el-scrollbar>

        <div class="chat-input">
          <el-input
            v-model="question"
            type="textarea"
            :rows="4"
            resize="none"
            maxlength="500"
            show-word-limit
            placeholder="输入你的问题..."
            @keydown.enter.exact.prevent="sendQuestion"
          />
          <div class="chat-actions">
            <el-button @click="clearMessages">清空</el-button>
            <el-button type="primary" :loading="loading" @click="sendQuestion">
              {{ loading ? '发送中...' : '发送' }}
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound } from '@element-plus/icons-vue'
import { aiApi } from '@/api/backend'

const visible = ref(false)
const loading = ref(false)
const question = ref('')
const messages = ref([
  { role: 'assistant', content: '你好，我是KPL AI助手。你可以问我战术、阵容、赛果趋势等问题。' }
])

const openPanel = () => {
  visible.value = true
}

const clearMessages = () => {
  messages.value = [
    { role: 'assistant', content: '对话已清空。你可以继续提问。' }
  ]
}

const sendQuestion = async () => {
  const text = question.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  question.value = ''
  loading.value = true

  try {
    const res = await aiApi.quickChat(text)
    const payload = res?.data
    const reply = (typeof payload === 'string')
      ? payload
      : payload?.data || payload?.msg || 'AI暂时没有返回内容，请稍后再试。'
    messages.value.push({ role: 'assistant', content: reply })
  } catch (error) {
    const msg = error?.message || 'AI服务请求失败'
    messages.value.push({ role: 'assistant', content: `请求失败：${msg}` })
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.ai-float-btn {
  position: fixed;
  right: 14px;
  top: 55%;
  transform: translateY(-50%);
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff6b00, #ffd700);
  box-shadow: 0 10px 30px rgba(255, 107, 0, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-50%) translateX(-2px);
    box-shadow: 0 12px 34px rgba(255, 107, 0, 0.45);
  }
}

.ai-chat-container {
  height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
}

.tips {
  font-size: 12px;
  color: #93a0b5;
  margin-bottom: 10px;
}

.chat-scroll {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 10px;
  background: rgba(8, 12, 24, 0.5);
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg-item {
  display: flex;

  .msg-content {
    max-width: 85%;
    font-size: 13px;
    line-height: 1.6;
    border-radius: 10px;
    padding: 9px 11px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &.user {
    justify-content: flex-end;

    .msg-content {
      color: #fff;
      background: linear-gradient(135deg, #00a6ff, #0066ff);
    }
  }

  &.assistant {
    justify-content: flex-start;

    .msg-content {
      color: #d8e3f1;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}

.chat-input {
  margin-top: 12px;
}

.chat-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
