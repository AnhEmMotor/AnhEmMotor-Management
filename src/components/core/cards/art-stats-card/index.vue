<template>
  <div
    class="art-card min-h-[100px] py-3 flex-c px-5 transition-transform duration-200 hover:-translate-y-0.5"
    :class="boxStyle"
  >
    <div
      v-if="icon"
      class="mr-3 size-10 flex-cc rounded-lg text-lg text-white shrink-0"
      :class="iconStyle"
    >
      <ArtSvgIcon :icon="icon"></ArtSvgIcon>
    </div>
    <div class="flex-1 min-w-0">
      <p
        class="m-0 text-sm font-medium text-black dark:text-white truncate"
        :style="{ color: textColor }"
        v-if="title"
      >
        {{ title }}
      </p>
      <template v-if="count !== undefined">
        <ArtCountTo
          v-if="typeof count === 'number'"
          class="m-0 text-xl font-semibold"
          :target="count"
          :duration="2000"
          :decimals="decimals"
          :separator="separator"
        />
        <p
          v-else
          class="m-0 font-semibold text-black dark:text-white leading-tight"
          :class="typeof count === 'string' && count.length > 15 ? 'text-sm' : 'text-xl'"
          :style="{ color: textColor }"
        >
          {{ count }}
        </p>
      </template>
      <p
        class="mt-0.5 text-xs text-g-500 opacity-90 truncate"
        :style="{ color: textColor }"
        v-if="description"
      >
        {{ description }}
      </p>
    </div>
    <div v-if="showArrow">
      <ArtSvgIcon icon="ri:arrow-right-s-line" class="text-lg text-g-500" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ArtStatsCard' });

interface StatsCardProps {
  boxStyle?: string;

  icon?: string;

  iconStyle?: string;

  title?: string;

  count?: string | number;

  decimals?: number;

  separator?: string;

  description?: string;

  textColor?: string;

  showArrow?: boolean;
}

withDefaults(defineProps<StatsCardProps>(), {
  iconSize: 30,
  iconBgRadius: 50,
  decimals: 0,
  separator: ',',
});
</script>
