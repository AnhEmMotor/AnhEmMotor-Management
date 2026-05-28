<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ $t('admin.t56') }}</h4>
        <p>{{ $t('admin.t57') }}<span class="text-success">+6</span></p>
      </div>
    </div>

    <div class="h-9/10 mt-2 overflow-hidden">
      <ElScrollbar>
        <div
          class="h-17.5 leading-17.5 border-b border-g-300 text-sm overflow-hidden last:border-b-0"
          v-for="(item, index) in list"
          :key="index"
        >
          <span class="text-g-800 font-medium">{{ item.username }}</span>
          <span class="mx-2 text-g-600">{{ item.type }}</span>
          <span class="text-theme">{{ item.target }}</span>
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface DynamicItem {
    username: string
    type: string
    target: string
  }

  const list = reactive<DynamicItem[]>([
    {
      username: 'trongtiểucá',
      type: 'đóngtâmrồi',
      target: ''
    },
    {
      username: 'nàotiểusen',
      type: 'phátbảngBài viết',
      target: 'Vue3 + Typescript + Vite mụcmụcthựcchiếnbútghi'
    },
    {
      username: 'trongtiểucá',
      type: 'đóngtâmrồi',
      target: ''
    },
    {
      username: 'nàotiểusen',
      type: 'phátbảngBài viết',
      target: 'Vue3 + Typescript + Vite mụcmụcthựcchiếnbútghi'
    },
    {
      username: '',
      type: 'gợirahỏiđề',
      target: 'ChuDeCó thểlấyCauHinhkhông'
    },
    {
      username: 'phátngốccỏ',
      type: 'đổiđổirồivậtsản phẩm',
      target: '《kỳđặccủamộtsinh》'
    },
    {
      username: 'ngọtống',
      type: 'đóngđóngrồihỏiđề',
      target: 'phátngốccỏ'
    },
    {
      username: 'lạnhthángngốcngốc',
      type: 'đổiđổirồivậtsản phẩm',
      target: '《caohiệungườisĩcủabảychiếctậpquen》'
    }
  ])
</script>
