<!-- CaiDatBảng (Panel) -->
<template>
  <div class="layout-settings">
    <SettingDrawer v-model="showDrawer" @open="handleOpen" @close="handleClose">
      <!-- đầubộđóngđóngNút -->
      <SettingHeader @close="closeDrawer" />
      <!-- ChuDePhong cách -->
      <ThemeSettings />
      <!-- MenuBố cục -->
      <MenuLayoutSettings />
      <!-- MenuPhong cách -->
      <MenuStyleSettings />
      <!-- HeThongChuDemàu -->
      <ColorSettings />
      <!-- tửKiểu dáng -->
      <BoxStyleSettings />
      <!-- ContainerChiều rộng -->
      <ContainerSettings />
      <!-- Cơ bảnCauHinh -->
      <BasicSettings />
      <!-- HanhDongNút -->
      <SettingActions />
    </SettingDrawer>
  </div>
</template>

<script setup lang="ts">
  import { useSettingsPanel } from './composables/useSettingsPanel'

  import SettingDrawer from './widget/SettingDrawer.vue'
  import SettingHeader from './widget/SettingHeader.vue'
  import ThemeSettings from './widget/ThemeSettings.vue'
  import MenuLayoutSettings from './widget/MenuLayoutSettings.vue'
  import MenuStyleSettings from './widget/MenuStyleSettings.vue'
  import ColorSettings from './widget/ColorSettings.vue'
  import BoxStyleSettings from './widget/BoxStyleSettings.vue'
  import ContainerSettings from './widget/ContainerSettings.vue'
  import BasicSettings from './widget/BasicSettings.vue'
  import SettingActions from './widget/SettingActions.vue'

  defineOptions({ name: 'ArtSettingsPanel' })

  interface Props {
    /** làphủmởmở */
    open?: boolean
  }

  const props = defineProps<Props>()

  // khiếndùngCaiDatBảng (Panel)Logic
  const settingsPanel = useSettingsPanel()
  const { showDrawer } = settingsPanel

  // LấycácloạiXuLythiết bị
  const { handleOpen, handleClose, closeDrawer } = settingsPanel.useDrawerControl()
  const { initializeSettings, cleanupSettings } = settingsPanel.useSettingsInitializer()

  // Lắng nghe props biếnhóa
  settingsPanel.usePropsWatcher(props)

  onMounted(() => {
    initializeSettings()
  })

  onUnmounted(() => {
    cleanupSettings()
  })
</script>

<style lang="scss">
  @use './style';
</style>
