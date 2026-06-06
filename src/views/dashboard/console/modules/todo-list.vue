<template>
  <div class="art-card h-128 p-5 mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>{{ $t('admin.t66') }}</h4>
        <p>{{ $t('admin.t67') }}<span class="text-danger">3</span></p>
      </div>
    </div>

    <div class="h-[calc(100%-40px)] overflow-auto">
      <ElScrollbar>
        <div
          class="flex-cb h-17.5 border-b border-g-300 text-sm last:border-b-0"
          v-for="(item, index) in list"
          :key="index"
        >
          <div>
            <p class="text-sm">{{ item.username }}</p>
            <p class="text-g-500 mt-1">{{ item.date }}</p>
          </div>
          <ElCheckbox v-model="item.complate" />
        </div>
      </ElScrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
  interface TodoItem {
    username: string
    date: string
    complate: boolean
  }

  const list = reactive<TodoItem[]>([
    {
      username: 'XemnayngàycônglàmNoiDung',
      date: 'trêntrưa 09:30',
      complate: true,
    },
    {
      username: 'TraLoibưuphần tử',
      date: 'trêntrưa 10:30',
      complate: true,
    },
    {
      username: 'cônglàmhợpbáochỉnhlý',
      date: 'trêntrưa 11:00',
      complate: true,
    },
    {
      username: 'sinhsản phẩmcầncầusẽnghị',
      date: 'dướitrưa 02:00',
      complate: false,
    },
    {
      username: 'chỉnhlýsẽnghịNoiDung',
      date: 'dướitrưa 03:30',
      complate: false,
    },
    {
      username: 'minhngàycônglàmkếgạch',
      date: 'dướitrưa 06:30',
      complate: false,
    },
  ])
</script>
