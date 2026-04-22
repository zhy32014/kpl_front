<template>
  <div class="team-logo" :style="{ width: size + 'px', height: size + 'px' }">
    <img 
      :src="logoPath" 
      :alt="'Team Logo ' + teamId" 
      :style="{ width: size + 'px', height: size + 'px', objectFit: 'contain' }"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  teamId: { type: [Number, String], required: true },
  size: { type: Number, default: 80 },
  logoUrl: { type: String, default: '' }
})

const logoPath = computed(() => {
  // 1. 如果有直接传入的 URL，优先使用
  if (props.logoUrl) return String(props.logoUrl).replace(/[`"]/g, '').trim()

  // 2. 否则尝试加载本地资源
  try {
    return require(`../assets/team-logo/${props.teamId}.png`)
  } catch (e) {
    // 3. 降级处理
    return require('../assets/logo.png') 
  }
})
</script>

<style scoped>
.team-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(240, 240, 240, 0.5);
  border-radius: 4px;
  overflow: hidden;
}
</style>
