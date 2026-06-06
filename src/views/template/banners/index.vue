<template>
  <div class="pt-5">
    <h1 class="page-title">{{ $t('admin.t172') }}</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="12" class="mb-5">
        <ArtBasicBanner
          :title="$t('admin.t175')"
          subtitle="HeThongLượt truy cậpcùngso sánhTăng trưởng 23%，nêncóphụcvụvậndòngổnđịnh，Dữ liệuGiámkhốngBình thường。"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="12" class="mb-5">
        <ArtBasicBanner
          :title="$t('admin.t176')"
          subtitle="ở Vue 3 + TypeScript + Element Plus cấuxâycủahiệnđạihóaQuản lýHeThong。"
          titleColor="#333"
          subtitleColor="#666"
          boxStyle="!bg-[#D4F1F7]"
          :buttonConfig="{
            show: true,
            text: 'Bắt đầuthămtra',
            color: 'var(--art-success)',
            textColor: '#fff',
            radius: '6px',
          }"
          @buttonClick="handleBannerClick"
        />
      </ElCol>
    </ElRow>

    <h1 class="page-title">{{ $t('admin.t173') }}</h1>

    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="12" class="mb-5">
        <ArtBasicBanner
          :title="$t('admin.t177')"
          subtitle="thêmvàotôichúngcủangàyvănquanđosốngđộng，pháthiệnvũtrụcủabí mậtbí"
          boxStyle="!bg-[#FF8AAB]"
          :buttonConfig="{
            show: true,
            text: 'lậplàvới',
            color: '#FF5A89',
            textColor: '#fff',
          }"
          :imageConfig="{
            src: icon3,
          }"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="12" class="mb-5">
        <ArtBasicBanner
          boxStyle="!bg-[#70B1FF]"
          :imageConfig="{
            src: icon5,
          }"
        >
          <template #title>
            <h2 style="margin: 0; font-size: 1.6rem; color: #fff !important">{{
              $t('admin.t174')
            }}</h2>
          </template>

          <template #subtitle>
            <div style="margin-top: 12px">
              <p style="position: relative; z-index: 10; font-style: italic"
                >linhsốngCauHinh，cườngđạimởtriển，chiếctrìTùy chỉnhchènkheNoiDung</p
              >
            </div>
          </template>

          <template #button>
            <div style="margin-top: 12px">
              <ElButton type="primary" color="#04A1FF"> XemTaiLieu </ElButton>
            </div>
          </template>
        </ArtBasicBanner>
      </ElCol>
    </ElRow>

    <h1 class="page-title">tượngCauHinhphươngán（Preset môkiểu）</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="12" class="mb-5">
        <ArtBasicBanner v-bind="PresetBanners.marketing" />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="12" class="mb-5">
        <ArtBasicBanner v-bind="PresetBanners.info" />
      </ElCol>
    </ElRow>

    <h1 class="page-title">Thẻ</h1>
    <ElRow :gutter="20">
      <ElCol :xs="24" :sm="12" :md="12" :lg="6" class="mb-5">
        <ArtCardBanner
          title="HeThongvậndòngBình thường"
          description="nêncóCốt lõiphụcvụvậndòngổnđịnh，ứngThoiGiantạiBình thườngphạmvitrong。"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="12" :lg="6" class="mb-5">
        <ArtCardBanner
          :image="icon2"
          title="trùngcầnTinNhanThongBao"
          description="bạncó 3 điềuChờ xử lýcủatrùngcầnTinNhan，Vui lòngvàgiờXem。"
          :button="{
            show: true,
            text: 'XemChiTiet',
            color: 'var(--art-warning)',
            textColor: '#fff',
          }"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="12" :lg="6" class="mb-5">
        <ArtCardBanner
          :image="icon3"
          title="Dữ liệuphầnphânbáobáo"
          description="quyểntuầnnghiệpvụDữ liệuphầnphânbáobáoĐã hoàn thành，Vui lòngXemđóngphímtiêu。"
          :button="{
            show: true,
            text: 'Tải xuốngbáobáo',
            color: 'var(--art-error)',
            textColor: '#fff',
          }"
        />
      </ElCol>
      <ElCol :xs="24" :sm="12" :md="12" :lg="6" class="mb-5">
        <ArtCardBanner
          :image="icon4"
          title="bảnquyểnCập nhậtgợitỉnh"
          description="Art Design Pro v2.1.0 ĐãĐăng tải，Bao gồmtínhnăngTốihóavàmớicôngnăng。"
          :button="{
            show: true,
            text: 'lậplàCập nhật',
            color: 'var(--theme-color)',
            textColor: '#fff',
          }"
          :cancelButton="{
            show: true,
            text: 'chútsaugợitỉnh',
            color: '#eee',
            textColor: '#333',
          }"
          @click="handleConfirm"
          @cancel="handleCancel"
        />
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import icon2 from '@imgs/3d/icon2.webp'
  import icon3 from '@imgs/3d/icon3.webp'
  import icon4 from '@imgs/3d/icon4.webp'
  import icon5 from '@imgs/3d/icon7.webp'

  defineOptions({ name: 'TemplateBanners' })

  const handleBannerClick = () => {
    console.log('banner clicked')
  }

  const handleConfirm = () => {
    console.log('confirm clicked')
  }

  const handleCancel = () => {
    console.log('cancel clicked')
  }

  const PresetBanners = {
    marketing: {
      title: 'hạngiờTốiưu đãisốngđộng',
      subtitle:
        'tinhvịthươngsản phẩm 48 tiểugiờchớpmua，nhấtcaochia sẻnhận 7 Tốiưu đãi，Số lượngcóhạn！',
      titleColor: 'var(--art-gray-900)',
      subtitleColor: 'var(--art-gray-900)',
      boxStyle: '!bg-success/15',
      meteorConfig: { enabled: true, count: 15 },
      buttonConfig: {
        show: true,
        text: 'lậplàcướpmua',
        color: 'var(--art-success)',
        textColor: '#fff',
      },
    },
    info: {
      title: 'phụcvụđếnkỳgợitỉnh',
      subtitle:
        'bạncủaNâng caophụcvụtươngtại 7 ngàysauđếnkỳ，Vui lòngvàgiờtiếpphílấytiếptiếpchia sẻnhậnĐầy đủcôngnăng。',
      titleColor: 'var(--art-gray-900)',
      subtitleColor: 'var(--art-gray-900)',
      boxStyle: '!bg-theme/15',
      meteorConfig: { enabled: true, count: 15 },
      buttonConfig: {
        show: true,
        text: 'lậplàtiếpphí',
        color: 'var(--art-secondary)',
        textColor: '#fff',
      },
    },
  } as const
</script>

<style scoped>
  @reference '@styles/core/tailwind.css';

  .page-title {
    @apply my-5 text-xl font-medium first:mt-0;
  }
</style>
