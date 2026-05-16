<!-- NhatKy cập nhậttrangmặt -->
<template>
  <div class="mx-auto pt-5 mb-5">
    <!-- TieuDe -->
    <h3 class="text-2xl font-medium text-g-900 mb-8">{{ $t('admin.t35') }}</h3>

    <!-- NhatKyDanh sách -->
    <div class="space-y-5">
      <div
        v-for="item in upgradeLogList"
        :key="item.version"
        class="art-card-sm rounded-lg p-6 transition-shadow max-md:p-4"
      >
        <!-- bảnquyểnvàNgày -->
        <div class="flex-cb gap-3 mb-4 flex-wrap">
          <span class="px-3 py-1 bg-theme/10 text-theme text-sm font-medium rounded-full">
            {{ item.version }}
          </span>
          <span class="text-sm text-g-500">{{ item.date }}</span>
        </div>

        <!-- TieuDe -->
        <h4 class="text-lg font-medium text-g-900 mb-3">{{ item.title }}</h4>

        <!-- ChiTietDanh sách -->
        <ul v-if="item.detail?.length" class="space-y-2 mb-4">
          <li
            v-for="(detail, index) in item.detail"
            :key="index"
            class="flex-c gap-2 text-sm text-g-600"
          >
            <span class="mt-0.5">•</span>
            <span class="text-g-700">{{ detail }}</span>
          </li>
        </ul>

        <!-- GhiChu -->
        <div v-if="item.remark" class="text-sm text-g-800 bg-g-300/60 rounded p-3 mb-3">
          {{ item.remark }}
        </div>

        <!-- Tag -->
        <ElTag v-if="item.requireReLogin" type="warning" size="small">{{ $t('admin.t36') }}</ElTag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { upgradeLogList } from '@/mock/upgrade/changeLog'

  defineOptions({ name: 'ChangeLog' })
</script>
