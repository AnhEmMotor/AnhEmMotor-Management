<!-- VideophátphóngcụComponent：https://h5player.bytedance.com/-->
<template>
  <div :id="playerId" />
</template>

<script setup lang="ts">
  import Player from 'xgplayer'
  import 'xgplayer/dist/index.min.css'

  defineOptions({ name: 'ArtVideoPlayer' })

  interface Props {
    /** phátphóngthiết bịContainer ID */
    playerId: string
    /** VideonguồnURL */
    videoUrl: string
    /** VideoẢnh bìaảnhURL */
    posterUrl: string
    /** làphủtừđộngphátphóng */
    autoplay?: boolean
    /** âmlượngKích thước(0-1) */
    volume?: number
    /** Có thểvịcủaphátphóngsuất */
    playbackRates?: number[]
    /** làphủVòng lặpphátphóng */
    loop?: boolean
    /** làphủtĩnhâm */
    muted?: boolean
    commonStyle?: VideoPlayerStyle
  }

  const props = withDefaults(defineProps<Props>(), {
    playerId: '',
    videoUrl: '',
    posterUrl: '',
    autoplay: false,
    volume: 1,
    loop: false,
    muted: false
  })

  // CaiDatThuocTinhMacDinhgiá trị

  // phátphóngthiết bịthựcví dụtríchdùng
  const playerInstance = ref<Player | null>(null)

  // phátphóngthiết bịKiểu dángGiao diện (Interface)Định nghĩa
  interface VideoPlayerStyle {
    progressColor?: string // Thanh tiến trìnhNềnmàu
    playedColor?: string // ĐãphátphóngbộphầnMàu sắc
    cachedColor?: string // CachebộphầnMàu sắc
    sliderBtnStyle?: Record<string, string> // Thanh trượtNútKiểu dáng
    volumeColor?: string // âmlượngkhốngchếthiết bịMàu sắc
  }

  // MacDinhKiểu dángCauHinh
  const defaultStyle: VideoPlayerStyle = {
    progressColor: 'rgba(255, 255, 255, 0.3)',
    playedColor: '#00AEED',
    cachedColor: 'rgba(255, 255, 255, 0.6)',
    sliderBtnStyle: {
      width: '10px',
      height: '10px',
      backgroundColor: '#00AEED'
    },
    volumeColor: '#00AEED'
  }

  // ComponentMountgiờban đầuđầuhóaphátphóngthiết bị
  onMounted(() => {
    playerInstance.value = new Player({
      id: props.playerId,
      lang: 'zh', // CaiDatgiaomặtNgôn ngữvìtrongvăn
      volume: props.volume,
      autoplay: props.autoplay,
      screenShot: true, // Bậtcắtảnhcôngnăng
      url: props.videoUrl,
      poster: props.posterUrl,
      fluid: true, // BậtchuyểnkiểuBố cục，từthíchứngContainerKích thước
      playbackRate: props.playbackRates,
      loop: props.loop,
      muted: props.muted,
      commonStyle: {
        ...defaultStyle,
        ...props.commonStyle
      }
    })

    // phátphóngSuKienLắng nghethiết bị
    playerInstance.value.on('play', () => {
      console.log('Video is playing')
    })

    // TamDungSuKienLắng nghethiết bị
    playerInstance.value.on('pause', () => {
      console.log('Video is paused')
    })

    // LỗiSuKienLắng nghethiết bị
    playerInstance.value.on('error', (error) => {
      console.error('Error occurred:', error)
    })
  })

  // ComponentUnmounttrướcxóalýphátphóngthiết bịthựcví dụ
  onBeforeUnmount(() => {
    if (playerInstance.value) {
      playerInstance.value.destroy()
    }
  })
</script>
