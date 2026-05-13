<script setup>
import RoundBadge from '@components/ui/RoundBadge.vue'
import SmallNoBgButton from '@components/ui/button/SmallNoBgButton.vue'
import IconPlus from '@/assets/icons/IconPlus.svg'
import IconExpand from '@/assets/icons/IconExpand.svg'

defineProps({
  warehouseData: {
    type: Array,
    required: true,
  },
})

defineEmits(['view-detail', 'restock'])
</script>

<template>
  <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-300">
    <table class="min-w-full bg-white border-collapse">
      <thead>
        <tr
          class="bg-gray-50 text-gray-500 uppercase text-xs font-medium tracking-wider leading-normal border-b border-gray-200"
        >
          <th class="py-3 px-6 text-left">Hãng Xe</th>
          <th class="py-3 px-6 text-left w-48">Tổng Tồn Kho</th>
          <th class="py-3 px-6 text-right">Sắp Hết Hàng</th>
          <th class="py-3 px-6 text-right">Hết Hàng</th>
          <th class="py-3 px-6 text-center">Trạng Thái</th>
          <th class="py-3 px-6 text-center w-32">Hành Động</th>
        </tr>
      </thead>
      <tbody class="text-gray-600 text-sm">
        <tr
          v-for="item in warehouseData"
          :key="item.brandName"
          class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <td class="py-3 px-6 whitespace-nowrap font-medium text-gray-900">
            {{ item.brandName }}
          </td>
          <td class="py-3 px-6 whitespace-nowrap">
            <div class="flex items-center gap-3">
              <span class="font-mono text-gray-700">{{ item.totalStock }}</span>
              <div class="flex-1">
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-500"
                    :class="
                      item.capacityPercent > 70
                        ? 'bg-red-300'
                        : item.capacityPercent > 40
                          ? 'bg-red-400'
                          : 'bg-red-600'
                    "
                    :style="{ width: `${item.capacityPercent}%` }"
                  ></div>
                </div>
              </div>
              <span class="text-xs text-gray-400 w-10 text-right">{{ item.capacityPercent }}%</span>
            </div>
          </td>
          <td class="py-3 px-6 whitespace-nowrap text-right font-mono text-gray-500">
            {{ item.lowStock }}
          </td>
          <td class="py-3 px-6 whitespace-nowrap text-right font-mono text-gray-500">
            {{ item.outOfStock }}
          </td>
          <td class="py-3 px-6 whitespace-nowrap text-center">
            <RoundBadge :color="item.statusColor">{{ item.status }}</RoundBadge>
          </td>
          <td class="py-3 px-6 whitespace-nowrap text-center">
            <div class="flex items-center justify-center gap-2">
              <SmallNoBgButton color="gray" @click.stop="$emit('view-detail', item)">
                <IconExpand class="w-4 h-4" />
              </SmallNoBgButton>
              <SmallNoBgButton color="red" @click.stop="$emit('restock', item)">
                <IconPlus class="w-4 h-4" />
              </SmallNoBgButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>



