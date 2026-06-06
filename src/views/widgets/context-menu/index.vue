<template>
  <div class="page-content">
    <ElButton @contextmenu.prevent="showMenu">{{ $t('admin.t227') }}</ElButton>

    <ArtMenuRight
      ref="menuRef"
      :menu-items="menuItems"
      :menu-width="180"
      :submenu-width="140"
      :border-radius="10"
      @select="handleSelect"
      @show="onMenuShow"
      @hide="onMenuHide"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick } from 'vue'
  import ArtMenuRight from '@/components/core/others/art-menu-right/index.vue'
  import type { MenuItemType } from '@/components/core/others/art-menu-right/index.vue'

  defineOptions({ name: 'TemplateContextMenu' })

  const menuRef = ref<InstanceType<typeof ArtMenuRight>>()
  const lastAction = ref('')

  const menuItems = computed((): MenuItemType[] => [
    {
      key: 'copy',
      label: 'phụcchế',
      icon: 'ri:file-copy-line',
    },
    {
      key: 'paste',
      label: 'dínhdán',
      icon: 'ri:capsule-line',
    },
    {
      key: 'cut',
      label: 'cắtchuyển',
      icon: 'ri:clipboard-line',
      showLine: true,
    },
    {
      key: 'export',
      label: 'Xuất filevịmục',
      icon: 'ri:export-line',
      children: [
        {
          key: 'exportExcel',
          label: 'Xuất file Excel',
          icon: 'ri:file-excel-2-line',
        },
        {
          key: 'exportPdf',
          label: 'Xuất file PDF',
          icon: 'ri:file-pdf-2-line',
        },
      ],
    },
    {
      key: 'edit',
      label: 'Chỉnh sửavịmục',
      icon: 'ri:edit-2-line',
      children: [
        {
          key: 'rename',
          label: 'trùngmệnhdanh',
        },
        {
          key: 'duplicate',
          label: 'phụcchếquyển',
        },
      ],
    },
    {
      key: 'share',
      label: 'phầnchia sẻ',
      icon: 'ri:share-forward-line',
      showLine: true,
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: 'ri:delete-bin-line',
    },
    {
      key: 'disabled',
      label: 'Tắtvịmục',
      icon: 'ri:close-circle-line',
      disabled: true,
    },
  ])

  const handleSelect = (item: MenuItemType) => {
    lastAction.value = `${item.label} (${item.key})`
    ElMessage.success(`ThựcdòngHanhDong: ${item.label}`)
    console.log('ChọnrồiMenumục:', item)
  }

  const showMenu = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    nextTick(() => {
      menuRef.value?.show(e)
    })
  }

  const onMenuShow = () => {
    console.log('MenuHiển thị')
  }

  const onMenuHide = () => {
    console.log('MenuẨn')
  }
</script>
