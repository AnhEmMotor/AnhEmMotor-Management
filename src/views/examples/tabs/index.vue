<template>
  <div class="page-content">
    <h3 class="mb-5 text-xl font-normal">{{ $t('admin.t107') }}</h3>

    <ElCard class="mb-7.5" header="sửasửaTagTieuDe">
      <div class="flex gap-2">
        <ElInput
          v-model="newTabTitle"
          :placeholder="$t('admin.t114')"
          clearable
          class="!max-w-75"
        />

        <ElButton type="primary" @click="handleUpdateTabTitle" :disabled="!newTabTitle.trim()">{{
          $t('admin.t108')
        }}</ElButton>
        <ElButton @click="handleResetTabTitle">{{ $t('admin.t109') }}</ElButton>
      </div>
    </ElCard>

    <ElCard class="mb-7.5" header="LấyThẻ TabThongTin">
      <div class="mb-4">
        <p class="m-0 mb-2 text-sm text-g-600"> khitrướcThẻ TabThongTin：{{ currentTab }} </p>
      </div>
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElButton type="success" plain @click="handleGetCurrentTabTitle(routePath)">{{
            $t('admin.t110')
          }}</ElButton>
        </ElCol>
      </ElRow>
    </ElCard>

    <ElCard class="mb-7.5" header="đóngđóngThẻ Tab">
      <ElRow :gutter="20">
        <ElCol :span="24">
          <ElButton type="danger" plain @click="handleCloseTab(routePath)">{{
            $t('admin.t111')
          }}</ElButton>
          <ElButton type="warning" plain @click="handleCloseOthersTab(routePath)">{{
            $t('admin.t112')
          }}</ElButton>
          <ElButton type="danger" plain @click="handleCloseAllTab">{{ $t('admin.t113') }}</ElButton>
        </ElCol>
      </ElRow>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useWorktabStore } from '@/application/store/worktab'
  import { WorkTab } from '@/types'

  defineOptions({ name: 'TabsExample' })

  const worktabStore = useWorktabStore()
  const currentTab = ref<WorkTab | null>(null)
  const newTabTitle = ref('')
  const routePath = '/examples/tabs'

  const handleUpdateTabTitle = (): void => {
    const trimmedTitle = newTabTitle.value.trim()
    if (trimmedTitle) {
      worktabStore.updateTabTitle(routePath, trimmedTitle)
      ElMessage.success('Thẻ TabTieuDeĐãCập nhật')
    }
  }

  const handleResetTabTitle = (): void => {
    worktabStore.resetTabTitle(routePath)
    newTabTitle.value = ''
    ElMessage.success('Thẻ TabTieuDeĐãĐặt lại')
  }

  const handleGetCurrentTabTitle = (path: string): void => {
    const tab = worktabStore.getTabTitle(path)
    if (tab) {
      currentTab.value = tab
      ElMessage.success('ĐãLấyThẻ TabThongTin')
    } else {
      ElMessage.warning('ChưatìmđếnTagThongTin')
    }
  }

  const handleCloseTab = (path: string): void => {
    worktabStore.removeTab(path)
  }

  const handleCloseOthersTab = (path: string): void => {
    worktabStore.removeOthers(path)
  }

  const handleCloseAllTab = (): void => {
    worktabStore.removeAll()
  }
</script>
