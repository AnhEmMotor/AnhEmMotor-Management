<template>
  <div class="py-5">
    <h1 class="page-title">{{ $t('admin.t178') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" v-for="card in statsCards" :key="card.id" class="mb-5">
        <ArtStatsCard
          :icon="card.icon"
          :iconStyle="card.iconStyle"
          :title="card.title"
          :description="card.description"
          :showArrow="card.showArrow"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t179') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" v-for="card in statsCards" :key="card.id" class="mb-5">
        <ArtStatsCard
          :icon="card.icon"
          :iconStyle="card.iconStyle"
          :count="card.count"
          :description="card.description"
          :decimals="0"
          :showArrow="card.showArrow"
          separator=","
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t180') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" v-for="card in statsCards" :key="card.id" class="mb-5">
        <ArtStatsCard
          :icon="card.icon"
          :iconStyle="card.customIconStyle"
          :boxStyle="card.boxStyle"
          :title="card.title"
          :description="card.description"
          :textColor="card.textColor"
          :showArrow="card.showArrow"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t181') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" v-for="card in progressCards" :key="card.id" class="mb-5">
        <ArtProgressCard :percentage="card.percentage" :title="card.title" :color="card.color" />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t182') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" v-for="card in progressCards" :key="card.id" class="mb-5">
        <ArtProgressCard
          :percentage="card.percentage"
          :title="card.title"
          :color="card.color"
          :icon="card.icon"
          :iconStyle="card.iconStyle"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t183') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" class="mb-5">
        <ArtLineChartCard
          :isMiniChart="true"
          :value="2545"
          :label="$t('admin.t187')"
          date="quađi7ngày"
          :percentage="1.2"
          :height="9.5"
          :chartData="[120, 132, 101, 134, 90, 230, 210]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="mb-5">
        <ArtBarChartCard
          :isMiniChart="true"
          :value="15480"
          :label="$t('admin.t188')"
          date="quađi 14 ngày"
          :percentage="-4.15"
          :height="9.5"
          :barWidth="'45%'"
          :chartData="[120, 100, 150, 140, 90, 120, 130]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="mb-5">
        <ArtLineChartCard
          :isMiniChart="true"
          :value="2545"
          :label="$t('admin.t189')"
          date="quađi 30 ngày"
          :percentage="1.2"
          :height="9.5"
          :showAreaColor="true"
          :chartData="[150, 180, 160, 200, 180, 220, 240]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="mb-5">
        <ArtDonutChartCard
          :value="36358"
          :title="$t('admin.t190')"
          :percentage="18"
          percentageLabel="sođinăm"
          :data="[50, 40]"
          :height="9.5"
          currentValue="2022"
          previousValue="2021"
          :radius="['50%', '70%']"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t184') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" class="mb-5">
        <ArtLineChartCard
          :value="2545"
          :label="$t('admin.t191')"
          :percentage="1.2"
          :height="11"
          :chartData="[120, 132, 101, 134, 90, 230, 210]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="mb-5">
        <ArtBarChartCard
          :value="15480"
          :label="$t('admin.t192')"
          :percentage="-4.15"
          :height="11"
          :chartData="[120, 100, 150, 140, 90, 120, 130, 110]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="mb-5">
        <ArtLineChartCard
          :value="2545"
          :label="$t('admin.t193')"
          :percentage="1.2"
          :height="11"
          :showAreaColor="true"
          :chartData="[150, 180, 160, 200, 180, 220, 240]"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="6" class="mb-5">
        <ArtDonutChartCard
          :value="36358"
          :title="$t('admin.t194')"
          :percentage="-18"
          percentageLabel="so2021năm"
          :data="[70, 30]"
          :height="11"
          currentValue="12tháng"
          previousValue="11tháng"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t185') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :lg="8" class="mb-5">
        <ArtDataListCard
          :list="dataList"
          :title="$t('admin.t195')"
          subtitle="nayngàyChờ xử lýnhiệmvụ"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="8" class="mb-5">
        <ArtDataListCard
          :maxCount="4"
          :list="dataList"
          :title="$t('admin.t196')"
          subtitle="cậnkỳsốngđộngDanh sách"
          :showMoreButton="true"
          @more="handleMore"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :lg="8" class="mb-5">
        <ArtTimelineListCard
          :list="timelineData"
          :title="$t('admin.t197')"
          subtitle="2024năm12tháng20ngày"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t186') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="6" v-for="card in imageCards" :key="card.id" class="mb-5">
        <ArtImageCard
          :imageUrl="card.imageUrl"
          :title="card.title"
          :category="card.category"
          :readTime="card.readTime"
          :views="card.views"
          :comments="card.comments"
          :date="card.date"
          @click="handleImageCardClick(card)"
        />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import cover1 from '@imgs/cover/img1.webp'
  import cover2 from '@imgs/cover/img2.webp'
  import cover3 from '@imgs/cover/img3.webp'
  import cover4 from '@imgs/cover/img4.webp'

  defineOptions({ name: 'TemplateCards' })

  const statsCards = [
    {
      id: 1,
      title: 'tácbánsinhsản phẩm',
      count: 1235,
      description: 'giàytử、bòconquần、pháiđốiphục、taybảng',
      icon: 'ri:bar-chart-box-line',
      boxStyle: '!bg-theme/10',
      customIconStyle: '!text-theme !text-3xl',
      iconStyle: 'bg-info',
      textColor: 'var(--theme-color)',
      showArrow: false,
    },
    {
      id: 2,
      title: 'NguoiDung hoạt động',
      count: 5000,
      description: 'ngàyNguoiDung hoạt độngsiêuqua5,000+',
      icon: 'ri:account-box-2-line',
      boxStyle: '!bg-warning/10',
      customIconStyle: '!text-warning !text-3xl',
      iconStyle: 'bg-warning',
      textColor: 'var(--art-warning)',
      showArrow: false,
    },
    {
      id: 3,
      title: 'tổngThu nhập',
      count: 35000,
      description: 'thángThu nhậpsiêuqua¥350,000+',
      icon: 'ri:money-cny-box-line',
      boxStyle: '!bg-secondary/10',
      customIconStyle: '!text-secondary !text-3xl',
      iconStyle: 'bg-secondary',
      textColor: 'var(--art-secondary)',
      showArrow: false,
    },
    {
      id: 4,
      title: 'kháchkhoảnBìnhgiá',
      count: 4800,
      description: 'đềuĐánh giá4.8/5',
      icon: 'ri:message-3-line',
      boxStyle: '!bg-error/10',
      customIconStyle: '!text-error !text-3xl',
      iconStyle: 'bg-error',
      textColor: 'var(--art-error)',
      showArrow: false,
    },
  ]

  const progressCards = [
    {
      id: 1,
      title: 'hoànthànhvàođộ',
      percentage: 75,
      color: 'var(--art-success)',
      icon: 'ri:arrow-up-circle-line',
      iconStyle: 'bg-success/12 text-success',
    },
    {
      id: 2,
      title: 'mụcmụcvàođộ',
      percentage: 65,
      color: 'var(--theme-color)',
      icon: 'ri:twitch-line',
      iconStyle: 'bg-theme/12 text-theme',
    },
    {
      id: 3,
      title: 'họctậpvàođộ',
      percentage: 45,
      color: 'var(--art-error)',
      icon: 'ri:game-line',
      iconStyle: '!bg-error/12 text-error',
    },
    {
      id: 4,
      title: 'nhiệmvụvàođộ',
      percentage: 90,
      color: 'var(--art-secondary)',
      icon: 'ri:flag-2-line',
      iconStyle: 'bg-secondary/12 text-secondary',
    },
  ]

  const imageCards = [
    {
      id: 1,
      imageUrl: cover1,
      title: 'AIkỹthuậttạiyliệulãnhTêncủamớiỨng dụngvớipháttriểntrướccảnh',
      category: 'xãnộp',
      readTime: '2phầnchuông',
      views: 9125,
      comments: 3,
      date: '12tháng19ngày tuầnmột',
    },
    {
      id: 2,
      imageUrl: cover2,
      title: 'đạiDữ liệuphầnphângiúplựcxínghiệpsáchcủathựcthựcánví dụ',
      category: 'kỹthuật',
      readTime: '3phầnchuông',
      views: 7234,
      comments: 5,
      date: '12tháng20ngày tuầnhai',
    },
    {
      id: 3,
      imageUrl: cover3,
      title: 'đồngkhốiliênkỹthuậttạicungứngliênQuản lýtrongcủaỨng dụng',
      category: 'khoakỹ',
      readTime: '4phầnchuông',
      views: 5678,
      comments: 8,
      date: '12tháng21ngày tuầnba',
    },
    {
      id: 4,
      imageUrl: cover4,
      title: 'vânkếkỹthuậtpháttriểnXu hướngvớiChưađếntriểnvọng',
      category: 'vânkỹthuật',
      readTime: '5phầnchuông',
      views: 4321,
      comments: 6,
      date: '12tháng22ngày tuầnbốn',
    },
  ]

  const dataList = [
    {
      title: 'mớithêmdốccủadòng',
      status: 'vàodòngtrong',
      time: '5phầnchuông',
      class: 'bg-theme/12 text-theme',
      icon: 'ri:camera-4-line',
    },
    {
      title: 'vềtài liệuDữ liệu',
      status: 'vàodòngtrong',
      time: '10phầnchuông',
      class: 'bg-secondary/12 text-secondary',
      icon: 'ri:bar-chart-box-line',
    },
    {
      title: 'kháchkhoảnsẽnghị',
      status: 'Chờ xử lý',
      time: '15phầnchuông',
      class: 'bg-warning/12 text-warning',
      icon: 'ri:user-3-line',
    },
    {
      title: 'sàngvịnhiệmvụđoànđội',
      status: 'vàodòngtrong',
      time: '20phầnchuông',
      class: 'bg-error/12 text-error',
      icon: 'ri:account-circle-line',
    },
    {
      title: 'phátgửinhắnphongchotiểuvương',
      status: 'Đã hoàn thành',
      time: '20phầnchuông',
      class: 'bg-success/12 text-success',
      icon: 'ri:message-3-line',
    },
  ]

  const timelineData = [
    {
      time: 'trêntrưa 09:30',
      status: 'rgb(73, 190, 255)',
      content: 'Bộđến John Doe chiếctrảcủa 385.90 mỹnguyên',
    },
    {
      time: 'trêntrưa 10:00',
      status: 'rgb(54, 158, 255)',
      content: 'mớitácbánGhi chép',
      code: 'ML-3467',
    },
    {
      time: 'trêntrưa 12:00',
      status: 'rgb(103, 232, 207)',
      content: 'hướng Michael chiếctrảrồi 64.95 mỹnguyên',
    },
    {
      time: 'dướitrưa 14:30',
      status: 'rgb(255, 193, 7)',
      content: 'HeThongduyhộThongBao',
      code: 'MT-2023',
    },
    {
      time: 'dướitrưa 15:45',
      status: 'rgb(255, 105, 105)',
      content: 'chặtgấpĐơn hàngHủygợitỉnh',
      code: 'OR-9876',
    },
    {
      time: 'dướitrưa 17:00',
      status: 'rgb(103, 232, 207)',
      content: 'hoànthànhmỗingàytácbánbáobảng',
    },
  ]

  const handleMore = () => {
    ElMessage.info('Xem thêm')
  }

  interface ImageCard {
    id: number
    imageUrl: string
    title: string
    category: string
    readTime: string
    views: number
    comments: number
    date: string
  }

  const handleImageCardClick = (card: ImageCard) => {
    console.log('NhấnThẻ:', card)
  }
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .page-title {
    @apply my-5 text-xl font-medium first:mt-0;
  }
</style>
