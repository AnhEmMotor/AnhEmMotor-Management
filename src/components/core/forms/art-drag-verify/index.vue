<!-- Kéo thảnghiệmtínhComponent -->
<template>
  <div
    ref="dragVerify"
    class="drag_verify"
    :style="dragVerifyStyle"
    @mousemove="dragMoving"
    @mouseup="dragFinish"
    @mouseleave="dragFinish"
    @touchmove="dragMoving"
    @touchend="dragFinish"
  >
    <!-- Thanh tiến trình -->
    <div
      class="dv_progress_bar"
      :class="{ goFirst2: isOk }"
      ref="progressBar"
      :style="progressBarStyle"
    >
    </div>

    <!-- Gợi ývănquyển -->
    <div class="dv_text" :style="textStyle" ref="messageRef">
      <slot name="textBefore" v-if="$slots.textBefore"></slot>
      {{ message }}
      <slot name="textAfter" v-if="$slots.textAfter"></slot>
    </div>

    <!-- Thanh trượtXuLythiết bị -->
    <div
      class="dv_handler dv_handler_bg"
      :class="{ goFirst: isOk }"
      @mousedown="dragStart"
      @touchstart="dragStart"
      ref="handler"
      :style="handlerStyle"
    >
      <ArtSvgIcon :icon="value ? successIcon : handlerIcon" class="text-g-600"></ArtSvgIcon>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ArtDragVerify' })

  // SuKienĐịnh nghĩa
  const emit = defineEmits(['handlerMove', 'update:value', 'passCallback'])

  // ComponentThuocTinhGiao diện (Interface)Định nghĩa
  interface PropsType {
    /** làphủthông quanghiệmtính */
    value: boolean
    /** ComponentChiều rộng */
    width?: number | string
    /** ComponentChiều cao */
    height?: number
    /** MacDinhGợi ývănquyển */
    text?: string
    /** ThanhCongGợi ývănquyển */
    successText?: string
    /** Nềnmàu */
    background?: string
    /** Thanh tiến trìnhNềnmàu */
    progressBarBg?: string
    /** hoànthànhTrạng tháiNềnmàu */
    completedBg?: string
    /** làphủVai */
    circle?: boolean
    /** VaiKích thước */
    radius?: string
    /** Thanh trượtIcon */
    handlerIcon?: string
    /** ThanhCongIcon */
    successIcon?: string
    /** Thanh trượtNềnmàu */
    handlerBg?: string
    /** vănquyểnKích thước */
    textSize?: string
    /** vănquyểnMàu sắc */
    textColor?: string
  }

  // ThuocTinhMacDinhgiá trịCaiDat
  const props = withDefaults(defineProps<PropsType>(), {
    value: false,
    width: '100%',
    height: 40,
    text: 'Thanh trượtkéođộng',
    successText: 'success',
    background: '#eee',
    progressBarBg: '#1385FF',
    completedBg: '#57D187',
    circle: false,
    radius: 'calc(var(--custom-radius) / 3 + 2px)',
    handlerIcon: 'solar:double-alt-arrow-right-linear',
    successIcon: 'ri:check-fill',
    handlerBg: '#fff',
    textSize: '13px',
    textColor: '#333'
  })

  // ComponentTrạng tháiGiao diện (Interface)Định nghĩa
  interface StateType {
    isMoving: boolean // làphủĐangKéo thả
    x: number // Kéo thảkhởiđầuViTri
    isOk: boolean // làphủnghiệmtínhThanhCong
  }

  // ứngkiểuTrạng tháiĐịnh nghĩa
  const state = reactive(<StateType>{
    isMoving: false,
    x: 0,
    isOk: false
  })

  // giảicấuứngkiểuTrạng thái
  const { isOk } = toRefs(state)

  // DOM nguyêntốtríchdùng
  const dragVerify = ref()
  const messageRef = ref()
  const handler = ref()
  const progressBar = ref()

  // SuKienbiếnlượng - dùngởcấmthúctrangmặttrượtđộng
  let startX: number, startY: number, moveX: number, moveY: number

  /**
   * Bắt đầuSuKienXuLy
   * @param e SuKienDoiTuong
   */
  const onTouchStart = (e: any) => {
    startX = e.targetTouches[0].pageX
    startY = e.targetTouches[0].pageY
  }

  /**
   * DiđộngSuKienXuLy - đoánlàphủvìhướngtrượtđộng，nếuquảlàtrởthúcMacDinhdòngvì
   * @param e SuKienDoiTuong
   */
  const onTouchMove = (e: any) => {
    moveX = e.targetTouches[0].pageX
    moveY = e.targetTouches[0].pageY

    // nếuquảhướngDiđộngKhoảng cáchđạiởdọchướngDiđộngKhoảng cách，trởthúcMacDinhdòngvì（Phòngthúctrangmặttrượtđộng）
    if (Math.abs(moveX - startX) > Math.abs(moveY - startY)) {
      e.preventDefault()
    }
  }

  // toànbộSuKienLắng nghethiết bịThêm mới
  document.addEventListener('touchstart', onTouchStart)
  document.addEventListener('touchmove', onTouchMove, { passive: false })

  // Lấysốgiá trịhìnhkiểucủaChiều rộng
  const getNumericWidth = (): number => {
    if (typeof props.width === 'string') {
      // nếuquảlàChuỗi，thửthửtừDOMnguyêntốLấythựctếChiều rộng
      return dragVerify.value?.offsetWidth || 260
    }
    return props.width
  }

  // LấyKiểu dángChuỗihìnhkiểucủaChiều rộng
  const getStyleWidth = (): string => {
    if (typeof props.width === 'string') {
      return props.width
    }
    return props.width + 'px'
  }

  // ComponentMountsaucủaban đầuđầuhóa
  onMounted(() => {
    // CaiDat CSS Tùy chỉnhThuocTinh
    dragVerify.value?.style.setProperty('--textColor', props.textColor)

    // bằngđợiDOMCập nhậtsauCaiDatChiều rộngđóngThuocTinh
    nextTick(() => {
      const numericWidth = getNumericWidth()
      dragVerify.value?.style.setProperty('--width', Math.floor(numericWidth / 2) + 'px')
      dragVerify.value?.style.setProperty('--pwidth', -Math.floor(numericWidth / 2) + 'px')
    })

    // trùngphụcThêm mớiSuKienLắng nghethiết bị（Đảm bảoSuKienLiênđịnh）
    document.addEventListener('touchstart', onTouchStart)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
  })

  // ComponentUnmounttrướcxóalýSuKienLắng nghethiết bị
  onBeforeUnmount(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchmove', onTouchMove)
  })

  // Thanh trượtKiểu dángkế
  const handlerStyle = {
    left: '0',
    width: props.height + 'px',
    height: props.height + 'px',
    background: props.handlerBg
  }

  // chủContainerKiểu dángkế
  const dragVerifyStyle = computed(() => ({
    width: getStyleWidth(),
    height: props.height + 'px',
    lineHeight: props.height + 'px',
    background: props.background,
    borderRadius: props.circle ? props.height / 2 + 'px' : props.radius
  }))

  // Thanh tiến trìnhKiểu dángkế
  const progressBarStyle = {
    background: props.progressBarBg,
    height: props.height + 'px',
    borderRadius: props.circle
      ? props.height / 2 + 'px 0 0 ' + props.height / 2 + 'px'
      : props.radius
  }

  // vănquyểnKiểu dángkế
  const textStyle = computed(() => ({
    fontSize: props.textSize
  }))

  // Hiển thịTinNhankếThuocTinh
  const message = computed(() => {
    return props.value ? props.successText : props.text
  })

  /**
   * Kéo thảBắt đầuXuLyHàm
   * @param e ChuộttiêuhoặcSuKienDoiTuong
   */
  const dragStart = (e: any) => {
    if (!props.value) {
      state.isMoving = true
      handler.value.style.transition = 'none'
      // kếKéo thảkhởiđầuViTri
      state.x =
        (e.pageX || e.touches[0].pageX) - parseInt(handler.value.style.left.replace('px', ''), 10)
    }
    emit('handlerMove')
  }

  /**
   * Kéo thảDiđộngXuLyHàm
   * @param e ChuộttiêuhoặcSuKienDoiTuong
   */
  const dragMoving = (e: any) => {
    if (state.isMoving && !props.value) {
      const numericWidth = getNumericWidth()
      // kếkhitrướcViTri
      let _x = (e.pageX || e.touches[0].pageX) - state.x

      // tạicóhiệuphạmvitrongDiđộng
      if (_x > 0 && _x <= numericWidth - props.height) {
        handler.value.style.left = _x + 'px'
        progressBar.value.style.width = _x + props.height / 2 + 'px'
      } else if (_x > numericWidth - props.height) {
        // Kéo thảđếncuốiđầu，Kích hoạtnghiệmtínhThanhCong
        handler.value.style.left = numericWidth - props.height + 'px'
        progressBar.value.style.width = numericWidth - props.height / 2 + 'px'
        passVerify()
      }
    }
  }

  /**
   * Kéo thảKếtthúcXuLyHàm
   * @param e ChuộttiêuhoặcSuKienDoiTuong
   */
  const dragFinish = (e: any) => {
    if (state.isMoving && !props.value) {
      const numericWidth = getNumericWidth()
      // kếnhấtcuốiViTri
      let _x = (e.pageX || e.changedTouches[0].pageX) - state.x

      if (_x < numericWidth - props.height) {
        // ChưaKéo thảđếncuốiđầu，Đặt lạiViTri
        state.isOk = true
        handler.value.style.left = '0'
        handler.value.style.transition = 'all 0.2s'
        progressBar.value.style.width = '0'
        state.isOk = false
      } else {
        // Kéo thảđếncuốiđầu，Duy trìnghiệmtínhThanhCongTrạng thái
        handler.value.style.transition = 'none'
        handler.value.style.left = numericWidth - props.height + 'px'
        progressBar.value.style.width = numericWidth - props.height / 2 + 'px'
        passVerify()
      }
      state.isMoving = false
    }
  }

  /**
   * nghiệmtínhthông quaXuLyHàm
   */
  const passVerify = () => {
    emit('update:value', true)
    state.isMoving = false
    // Cập nhậtKiểu dángvìThanhCongTrạng thái
    progressBar.value.style.background = props.completedBg
    messageRef.value.style['-webkit-text-fill-color'] = 'unset'
    messageRef.value.style.animation = 'slidetounlock2 2s cubic-bezier(0, 0.2, 1, 1) infinite'
    messageRef.value.style.color = '#fff'
    emit('passCallback')
  }

  /**
   * Đặt lạinghiệmtínhTrạng tháiHàm
   */
  const reset = () => {
    // Đặt lạiThanh trượtViTri
    handler.value.style.left = '0'
    progressBar.value.style.width = '0'
    progressBar.value.style.background = props.progressBarBg
    // Đặt lạivănquyểnKiểu dáng
    messageRef.value.style['-webkit-text-fill-color'] = 'transparent'
    messageRef.value.style.animation = 'slidetounlock 2s cubic-bezier(0, 0.2, 1, 1) infinite'
    messageRef.value.style.color = props.background
    // Đặt lạiTrạng thái
    emit('update:value', false)
    state.isOk = false
    state.isMoving = false
    state.x = 0
  }

  // lộlộĐặt lạiPhuongThucchochaComponent
  defineExpose({
    reset
  })
</script>

<style lang="scss" scoped>
  .drag_verify {
    position: relative;
    box-sizing: border-box;
    overflow: hidden;
    text-align: center;
    border: 1px solid var(--default-border-dashed);

    .dv_handler {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: move;

      i {
        padding-left: 0;
        font-size: 14px;
        color: #999;
      }

      .el-icon-circle-check {
        margin-top: 9px;
        color: #6c6;
      }
    }

    .dv_progress_bar {
      position: absolute;
      width: 0;
      height: 34px;
    }

    .dv_text {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: transparent;
      user-select: none;
      background: linear-gradient(
        to right,
        var(--textColor) 0%,
        var(--textColor) 40%,
        #fff 50%,
        var(--textColor) 60%,
        var(--textColor) 100%
      );
      -webkit-background-clip: text;
      background-clip: text;
      animation: slidetounlock 2s cubic-bezier(0, 0.2, 1, 1) infinite;
      -webkit-text-fill-color: transparent;
      text-size-adjust: none;

      * {
        -webkit-text-fill-color: var(--textColor);
      }
    }
  }

  .goFirst {
    left: 0 !important;
    transition: left 0.5s;
  }

  .goFirst2 {
    width: 0 !important;
    transition: width 0.5s;
  }
</style>

<style lang="scss">
  @keyframes slidetounlock {
    0% {
      background-position: var(--pwidth) 0;
    }

    100% {
      background-position: var(--width) 0;
    }
  }

  @keyframes slidetounlock2 {
    0% {
      background-position: var(--pwidth) 0;
    }

    100% {
      background-position: var(--pwidth) 0;
    }
  }
</style>
