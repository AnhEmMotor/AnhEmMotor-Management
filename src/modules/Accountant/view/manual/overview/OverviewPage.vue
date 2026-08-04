<template>
  <div class="admin-guide">
    <div class="guide-hero">
      <h1 class="hero-title">Trung Tâm Hướng Dẫn Sử Dụng</h1>
      <p class="hero-sub">Phân hệ Quản trị Hệ thống — chọn một phân hệ để xem tài liệu chi tiết.</p>
    </div>

    <div class="sections-grid">
      <el-card
        v-for="(item, idx) in sections"
        :key="item.id"
        class="section-card"
        shadow="never"
        :style="cardStyle(item, idx)"
        @click="goTo(item.id)"
      >
        <div class="card-inner">
          <div class="icon-wrap" :style="{ backgroundColor: item.color + '18', color: item.color }">
            <el-icon :size="26"><component :is="item.icon" /></el-icon>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ item.title }}</h3>
            <span class="card-sub" :style="{ color: item.color }">{{ item.subtitle }}</span>
          </div>
          <el-icon class="card-arrow" :size="18"><ArrowRight /></el-icon>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import { guideSections } from '../data/guideSections'

const router = useRouter()
const sections = ref(guideSections)

function cardStyle(item: any, idx: number) {
  return {
    cursor: 'pointer',
    transition: 'all .22s ease',
    borderRadius: '16px',
    border: '1px solid ' + item.color + '22',
    background: '#fff',
    animationDelay: idx * 50 + 'ms',
    animation: 'cardIn .35s ease both',
  }
}

function goTo(id: string) {
  router.push(`/Accountant/manual/${id}`)
}
</script>

<style scoped lang="scss">
.admin-guide { padding: 32px 24px; max-width: 1200px; margin: 0 auto; }
.guide-hero { text-align: center; margin-bottom: 40px; }
.hero-title { font-size: 32px; font-weight: 900; color: var(--el-text-color-primary); margin: 0 0 10px; }
.hero-sub { font-size: 15px; color: var(--el-text-color-secondary); margin: 0; }
.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.section-card { transition: all .22s ease !important; }
.section-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.10) !important; }
.card-inner { display: flex; align-items: center; gap: 16px; }
.icon-wrap {
  width: 54px; height: 54px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.card-body { flex: 1; min-width: 0; }
.card-title { font-size: 16px; font-weight: 700; color: var(--el-text-color-primary); margin: 0 0 4px; }
.card-sub { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
.card-arrow { color: var(--el-text-color-disabled); transition: color .2s; }
.section-card:hover .card-arrow { color: var(--el-color-primary) !important; }
@keyframes cardIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
</style>
