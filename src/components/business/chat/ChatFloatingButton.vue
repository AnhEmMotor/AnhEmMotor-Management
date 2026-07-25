<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { ChatSquare } from "@element-plus/icons-vue";
import ChatDrawer from "./ChatDrawer.vue";

const isVisible = ref(true);
const isDrawerOpen = ref(false);
let observer: MutationObserver | null = null;

// Logic to hide button when ANY Element Plus Dialog is opened
const observeDialogs = () => {
  observer = new MutationObserver((mutations) => {
    let dialogOpen = false;

    // Check if body has el-popup-parent--hidden class (added by Element Plus when dialog is open)
    if (document.body.classList.contains("el-popup-parent--hidden")) {
      dialogOpen = true;
    } else {
      // Fallback: check for el-overlay
      const overlays = document.querySelectorAll(".el-overlay");
      for (let i = 0; i < overlays.length; i++) {
        if ((overlays[i] as HTMLElement).style.display !== "none") {
          dialogOpen = true;
          break;
        }
      }
    }

    // Hide floating button immediately (no animation) if dialog is open
    isVisible.value = !dialogOpen;
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["class", "style"],
  });
};

onMounted(() => {
  observeDialogs();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value;
};
</script>

<template>
  <div>
    <!-- Floating Button -->
    <div
      v-show="isVisible && !isDrawerOpen"
      class="fixed bottom-6 right-6 z-50 cursor-pointer rounded-full bg-blue-600 p-4 text-white shadow-lg hover:bg-blue-700 active:scale-95"
      style="transition: none !important"
      @click="toggleDrawer"
    >
      <el-icon :size="24"><ChatSquare /></el-icon>
    </div>

    <!-- Chat Drawer -->
    <ChatDrawer v-model="isDrawerOpen" />
  </div>
</template>

<style scoped>
/* No transition for hiding/showing as requested */
</style>
