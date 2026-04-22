<template>
  <div class="analysis-form">
    <el-form :model="form" label-width="120px">
      <el-form-item label="对局版本">
        <el-input v-model="form.version" placeholder="如：王者荣耀S35赛季" />
      </el-form-item>
      <el-form-item label="当前BP阶段">
        <el-input v-model="form.bp_stage" placeholder="如：第一轮BP结束/第二轮BP开始" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="蓝方已Ban">
            <el-input v-model="form.blue_ban" placeholder="如：大乔、公孙离" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="蓝方已选">
            <el-input v-model="form.blue_pick" placeholder="如：镜、沈梦溪" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="红方已Ban">
            <el-input v-model="form.red_ban" placeholder="如：裴擒虎、东皇太一" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="红方已选">
            <el-input v-model="form.red_pick" placeholder="如：娜可露露、不知火舞" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="核心需求">
        <el-input
          v-model="form.core_demand"
          type="textarea"
          :rows="3"
          placeholder="请输入你的需求，如：给红方推荐下一个选角，counter蓝方阵容"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="cyber-btn" @click="submitAnalysis" :loading="parentLoading">
          <el-icon><Cpu /></el-icon>
          获取教练建议
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
  bp_stage: '',
  core_demand: '',
  blue_ban: '',
  blue_pick: '',
  red_ban: '',
  red_pick: ''
})

const submitAnalysis = async () => {
  if (!form.value.version || !form.value.bp_stage || !form.value.core_demand) {
    ElMessage.warning('请填写必填参数')
    return
  }

  parentLoading.value = true
  try {
    const result = await aiAnalysisApi.coachAdvice(form.value)
    emit('analysis-result', result)
    ElMessage.success('教练建议生成完成！')
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