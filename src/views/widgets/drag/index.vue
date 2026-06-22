<template>
  <div class="page-content mb-5">
    <ElRow>
      <ElCard class="w-75 mr-5 mb-7.5">
        <template #header>
          <span class="text-base font-bold">{{ $t("admin.t239") }}</span>
        </template>
        <template #default>
          <VueDraggable ref="el" v-model="userList">
            <div
              class="p-2.5 mb-2.5 cursor-move bg-active-color rounded"
              v-for="item in userList"
              :key="item.name"
            >
              {{ item.name }}
            </div>
          </VueDraggable>
        </template>
      </ElCard>

      <ElCard class="w-75 mb-7.5">
        <template #header>
          <span class="text-base font-bold">quađộHoatAnh</span>
        </template>
        <template #default>
          <VueDraggable v-model="userList" target=".sort-target" :scroll="true">
            <TransitionGroup
              type="transition"
              tag="ul"
              name="fade"
              class="sort-target"
            >
              <li
                v-for="item in userList"
                :key="item.name"
                class="p-2.5 mb-2.5 cursor-move bg-active-color rounded"
              >
                {{ item.name }}
              </li>
            </TransitionGroup>
          </VueDraggable>
        </template>
      </ElCard>
    </ElRow>

    <ElCard class="mb-7.5">
      <template #header>
        <span class="text-base font-bold">BảngKéo thảxếpthứ</span>
      </template>
      <template #default>
        <VueDraggable target="tbody" v-model="userList" :animation="150">
          <ArtTable :data="userList">
            <ElTableColumn label="Họ tên" prop="name" />
            <ElTableColumn label="VaiTro" prop="role" />
          </ArtTable>
        </VueDraggable>
      </template>
    </ElCard>

    <ElCard class="mb-7.5">
      <template #header>
        <span class="text-base font-bold">địnhnguyêntốKéo thảxếpthứ</span>
      </template>
      <template #default>
        <VueDraggable
          target="tbody"
          handle=".handle"
          v-model="userList"
          :animation="150"
        >
          <ArtTable :data="userList">
            <ElTableColumn label="Họ tên" prop="name" />
            <ElTableColumn label="VaiTro" prop="role" />
            <ElTableColumn label="HanhDong" width="100">
              <ElButton size="default" class="handle"> Diđộng </ElButton>
            </ElTableColumn>
          </ArtTable>
        </VueDraggable>
      </template>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";

defineOptions({ name: "TemplateDrag" });

const userList = ref([
  { name: "cháungộkhông", role: "đấuchiếnthắngphật" },
  { name: "lợntámgiới", role: "tịnhđànkhiến" },
  { name: "cáttăng", role: "vàngthânlahán" },
  { name: "đườngtăng", role: "chiênđàncôngđứcphật" },
]);
</script>

<style scoped>
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

.fade-leave-active {
  position: absolute;
}
</style>
