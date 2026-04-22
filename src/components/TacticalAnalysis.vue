<template>
  <div class="analysis-form">
    <el-form :model="form" label-width="120px">
      <el-form-item label="对局版本">
        <el-input v-model="form.version" placeholder="如：王者荣耀S35赛季" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="蓝方战队">
            <el-input v-model="form.blue_team" placeholder="如：成都AG超玩会" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="蓝方阵容">
            <el-input v-model="form.blue_lineup" placeholder="如：吕布、镜、沈梦溪、孙尚香、东皇太一" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="红方战队">
            <el-input v-model="form.red_team" placeholder="如：重庆狼队" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="红方阵容">
            <el-input v-model="form.red_lineup" placeholder="如：蒙恬、娜可露露、不知火舞、公孙离、张飞" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="分析节点">
        <el-input v-model="form.analysis_node" placeholder="如：全场复盘/10分钟主宰团/决胜团" />
      </el-form-item>
      <el-form-item label="节点核心数据">
        <el-input
          v-model="form.node_data"
          type="textarea"
          :rows="4"
          placeholder="请输入对局核心数据，如：本局比赛时长18分钟，蓝方全程掌控中线权，8分钟经济差拉开4000..."
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="cyber-btn" @click="submitAnalysis" :loading="parentLoading">
          <el-icon><Cpu /></el-icon>
          开始AI分析
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'
import { Cpu } from '@element-plus/icons-vue'
import { aiAnalysisApi } from '@/api/aiAnalysis'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['analysis-result'])
const parentLoading = inject('loading', ref(false))

const form = ref({
  version: '',
  blue_team: '',
  blue_lineup: '',
  red_team: '',
  red_lineup: '',
  analysis_node: '',
  node_data: ''
})

const submitAnalysis = async () => {
  if (!Object.values(form.value).every(v => v.trim())) {
    ElMessage.warning('请填写完整的分析参数')
    return
  }

  parentLoading.value = true
  try {
    const result = await aiAnalysisApi.tacticalAnalysis(form.value)
    emit('analysis-result', result)
    ElMessage.success('AI分析完成！')
  } catch (error) {
    ElMessage.error('AI分析失败：' + error.message)
  } finally {
    parentLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.analysis-form {
  padding: 24px;
  background: rgba(5, 5, 10, 0.8);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--glow-primary-light);
}

.cyber-btn {
  background: var(--gradient-primary);
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
  }
}
</style>