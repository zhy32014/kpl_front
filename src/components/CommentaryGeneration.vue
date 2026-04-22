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
      <el-form-item label="名场面背景">
        <el-input v-model="form.scene_background" placeholder="如：2024KPL夏季赛总决赛决胜局，18分钟风暴龙王团" />
      </el-form-item>
      <el-form-item label="团战时间线">
        <el-input
          v-model="form.fight_timeline"
          type="textarea"
          :rows="4"
          placeholder="请输入团战时间线，如：00:00 双方在龙坑外拉扯；00:03 东皇太一闪现吸住公孙离；00:06 镜进场飞雷神打满伤害..."
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="cyber-btn" @click="submitAnalysis" :loading="parentLoading">
          <el-icon><Cpu /></el-icon>
          生成解说词
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
  scene_background: '',
  fight_timeline: ''
})

const submitAnalysis = async () => {
  if (!Object.values(form.value).every(v => v.trim())) {
    ElMessage.warning('请填写完整的参数')
    return
  }

  parentLoading.value = true
  try {
    const result = await aiAnalysisApi.generateCommentary(form.value)
    emit('analysis-result', result)
    ElMessage.success('解说词生成完成！')
  } catch (error) {
    ElMessage.error('生成失败：' + error.message)
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