<!-- khóihoaHiệu quả | lễhoaHiệu quả -->
<template>
  <canvas
    ref="canvasRef"
    class="fixed top-0 left-0 z-[9999] w-full h-full pointer-events-none"
  ></canvas>
</template>

<script setup lang="ts">
  import { useEventListener } from '@vueuse/core'
  import { mittBus } from '@/utils/sys'
  import type { Handler } from 'mitt'
  import bp from '@/assets/images/ceremony/hb.png'
  import sd from '@/assets/images/ceremony/sd.png'
  import yd from '@/assets/images/ceremony/yd.png'

  defineOptions({ name: 'ArtFireworksEffect' })

  /**
   * khóihoaHeThongCauHinhGiao diện (Interface)
   * Định nghĩarồikhóihoaHiệu quảcủanêncóCó thểCauHinhTham số
   */
  interface FireworkConfig {
    /** Hồ đối tượngKích thước - TrướcxâycủaHạtDoiTuongSố lượng */
    readonly POOL_SIZE: number
    /** mỗilầnnổnổsinhsinhcủaHạtSố lượng */
    readonly PARTICLES_PER_BURST: number
    /** cácloạiHình dạngcủathướctấcCauHinh */
    readonly SIZES: {
      /** vuônghìnhHạtcủaRộngcao */
      readonly RECTANGLE: { readonly WIDTH: number; readonly HEIGHT: number }
      /** đúngphươnghìnhHạtcủabiêntrường */
      readonly SQUARE: { readonly SIZE: number }
      /** hìnhHạtcủathẳng */
      readonly CIRCLE: { readonly SIZE: number }
      /** baVaihìnhHạtcủabiêntrường */
      readonly TRIANGLE: { readonly SIZE: number }
      /** bầu dụcHạtcủaRộngcao */
      readonly OVAL: { readonly WIDTH: number; readonly HEIGHT: number }
      /** Hình ảnhHạtcủaRộngcao */
      readonly IMAGE: { readonly WIDTH: number; readonly HEIGHT: number }
    }
    /** XoayđóngTham số */
    readonly ROTATION: {
      /** Cơ bảnXoayTốc độ */
      readonly BASE_SPEED: number
      /** Ngẫu nhiênXoayTốc độThêmlượng */
      readonly RANDOM_SPEED: number
      /** Xoaysuybớthệsố - khốngchếXoayTốc độchuyểnbớt */
      readonly DECAY: number
    }
    /** vậtlýHiệu quảTham số */
    readonly PHYSICS: {
      /** trùnglựcthêmTốc độ */
      readonly GRAVITY: number
      /** dướirơiTốc độNgưỡng - siêuquanàygiá trịBắt đầunhạtra */
      readonly VELOCITY_THRESHOLD: number
      /** Độ trong suốtsuybớtTốc độ */
      readonly OPACITY_DECAY: number
    }
    /** khóihoaHạtMàu sắcCauHinh(mangĐộ trong suốt) */
    readonly COLORS: readonly string[]
    /** khóihoaHạtHình dạngCauHinh(vuônghìnhrahiệnXác suấthơncao) */
    readonly SHAPES: readonly string[]
  }

  /**
   * đơnchiếckhóihoaHạtDoiTuong
   * Bao gồmHạtcủaViTri、Tốc độ、ngoàiquanbằngnêncóThuocTinh
   */
  interface Firework {
    /** XTọatiêuViTri */
    x: number
    /** YTọatiêuViTri */
    y: number
    /** XphươnghướngTốc độ */
    vx: number
    /** YphươnghướngTốc độ */
    vy: number
    /** HạtMàu sắc (RGBAcáchkiểu) */
    color: string
    /** khitrướcXoayGóc */
    rotation: number
    /** XoayTốc độ */
    rotationSpeed: number
    /** Thu phóngTỷ lệ */
    scale: number
    /** HạtHình dạngloạikiểu */
    shape: string
    /** Độ trong suốt (0-1) */
    opacity: number
    /** làphủởsốngđộngTrạng thái */
    active: boolean
    /** Hình ảnhURL (khishapevìimagegiờkhiếndùng) */
    imageUrl?: string
  }

  /**
   * Hình ảnhCacheGiao diện (Interface)
   * dùngởCachetrướcLoadingcủaHình ảnhtàinguồn
   */
  interface ImageCache {
    [url: string]: HTMLImageElement
  }

  /**
   * khóihoaHiệu quảcủatoànbộCauHinh
   * khiếndùng as const Đảm bảoCauHinhcủaKhôngCó thểbiếntính
   */
  const CONFIG: FireworkConfig = {
    // tínhnăngđóngCauHinh
    POOL_SIZE: 600, // Hồ đối tượngKích thước，ảnhcùnggiờtồntạicủanhấtđạiHạtsố
    PARTICLES_PER_BURST: 200, // mỗilầnnổnổcủaHạtSố lượng，ảnhTrực quanHiệu quảmậtđộ

    // HạtthướctấcCauHinh
    SIZES: {
      RECTANGLE: { WIDTH: 24, HEIGHT: 12 }, // vuônghìnhHạtthướctấc
      SQUARE: { SIZE: 12 }, // đúngphươnghìnhHạtthướctấc
      CIRCLE: { SIZE: 12 }, // hìnhHạtthướctấc
      TRIANGLE: { SIZE: 10 }, // baVaihìnhHạtthướctấc
      OVAL: { WIDTH: 24, HEIGHT: 12 }, // bầu dụcHạtthướctấc
      IMAGE: { WIDTH: 30, HEIGHT: 30 } // Hình ảnhHạtthướctấc
    },

    // XoayHoatAnhCauHinh
    ROTATION: {
      BASE_SPEED: 2, // Cơ bảnXoayTốc độ
      RANDOM_SPEED: 3, // tránngoàiNgẫu nhiênXoayTốc độphạmvi
      DECAY: 0.98 // XoayTốc độsuybớthệsố (vượttiểusuybớtvượtkhoái)
    },

    // vậtlýHiệu quảCauHinh
    PHYSICS: {
      GRAVITY: 0.525, // trùnglựcthêmTốc độ，ảnhHạtdướirơiTốc độ
      VELOCITY_THRESHOLD: 10, // Tốc độNgưỡng，siêuquagiờBắt đầuĐộ trong suốtsuybớt
      OPACITY_DECAY: 0.02 // Độ trong suốtsuybớtTốc độ，ảnhHạtThôngthấtkhoáimạn
    },

    // HạtMàu sắcCauHinh - khiếndùngRGBAcáchkiểuchiếctrìĐộ trong suốt
    COLORS: [
      'rgba(255, 68, 68, 1)', // đỏmàuhệ
      'rgba(255, 68, 68, 0.9)',
      'rgba(255, 68, 68, 0.8)',
      'rgba(255, 116, 188, 1)', // phấnmàuhệ
      'rgba(255, 116, 188, 0.9)',
      'rgba(255, 116, 188, 0.8)',
      'rgba(68, 68, 255, 0.8)', // xanhmàuhệ
      'rgba(92, 202, 56, 0.7)', // xanh lámàuhệ
      'rgba(255, 68, 255, 0.8)', // tửmàuhệ
      'rgba(68, 255, 255, 0.7)', // thanhmàuhệ
      'rgba(255, 136, 68, 0.7)', // cammàuhệ
      'rgba(68, 136, 255, 1)', // xanhmàuhệ
      'rgba(250, 198, 122, 0.8)' // vàngmàuhệ
    ],

    // HạtHình dạngCauHinh - vuônghìnhrahiệnXác suấthơncao，doanhhơnphongphúcủaTrực quanHiệu quả
    SHAPES: [
      'rectangle',
      'rectangle',
      'rectangle',
      'rectangle',
      'rectangle',
      'rectangle',
      'rectangle',
      'circle',
      'triangle',
      'oval'
    ]
  } as const

  /** Canvas DOM nguyêntốtríchdùng */
  const canvasRef = ref<HTMLCanvasElement>()
  /** Canvas 2D Vẽtrêndướivăn */
  const ctx = ref<CanvasRenderingContext2D | null>(null)

  /**
   * khóihoaHeThongCốt lõiloại
   * tráchQuản lýHạtsinhmệnhtuầnkỳ、RendervàHoatAnh
   */
  class FireworkSystem {
    /** HạtHồ đối tượng - TrướcxâycủaHạtDoiTuongMảng */
    private particlePool: Firework[] = []
    /** khitrướcsốngđộngcủaHạtMảng */
    private activeParticles: Firework[] = []
    /** Hồ đối tượngChỉ mụcCon trỏ - dùngởVòng lặpphầnPhânHạt */
    private poolIndex = 0
    /** Hình ảnhtàinguồnCache */
    private imageCache: ImageCache = {}
    /** HoatAnhID - dùngởHủyHoatAnh */
    private animationId = 0
    /** CanvasChiều rộngCache */
    private canvasWidth = 0
    /** CanvasChiều caoCache */
    private canvasHeight = 0

    constructor() {
      this.initializePool()
    }

    /**
     * ban đầuđầuhóaHồ đối tượng
     * TrướcxâyđịnhSố lượngcủaHạtDoiTuong，tránhmiễnvậndònggiờphimxây
     */
    private initializePool(): void {
      for (let i = 0; i < CONFIG.POOL_SIZE; i++) {
        this.particlePool.push(this.createParticle())
      }
    }

    /**
     * xâymộtchiếcmớicủaHạtDoiTuong
     * Quay lạiban đầuđầuhóaTrạng tháicủaHạt
     */
    private createParticle(): Firework {
      return {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        color: '',
        rotation: 0,
        rotationSpeed: 0,
        scale: 1,
        shape: 'circle',
        opacity: 1,
        active: false
      }
    }

    /**
     * từHồ đối tượngLấyCó thểdùngHạt (tínhnăngTốihóabảnquyển)
     * khiếndùngVòng lặpChỉ mụcmàphiArray.find()，ThoiGianphụctạpđộtừO(n)giảmđếnO(1)
     * @returns Có thểdùngcủaHạtDoiTuonghoặcnull
     */
    private getAvailableParticle(): Firework | null {
      for (let i = 0; i < CONFIG.POOL_SIZE; i++) {
        const index = (this.poolIndex + i) % CONFIG.POOL_SIZE
        const particle = this.particlePool[index]

        if (!particle.active) {
          this.poolIndex = (index + 1) % CONFIG.POOL_SIZE
          particle.active = true
          return particle
        }
      }
      return null
    }

    /**
     * trướcLoadingđơnchiếcHình ảnhtàinguồn
     * @param url Hình ảnhURL
     * @returns Promise<HTMLImageElement>
     */
    async preloadImage(url: string): Promise<HTMLImageElement> {
      // nếuquảĐãCache，thẳngtiếpQuay lại
      if (this.imageCache[url]) {
        return this.imageCache[url]
      }

      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous' // XuLyvượtTênhỏiđề
        img.onload = () => {
          this.imageCache[url] = img
          resolve(img)
        }
        img.onerror = reject
        img.src = url
      })
    }

    /**
     * trướcLoadingnêncócầncầncủaHình ảnhtàinguồn
     * tạiComponentban đầuđầuhóagiờđiềudùng，Đảm bảoHình ảnhready
     */
    async preloadAllImages(): Promise<void> {
      const imageUrls = [bp, sd, yd]
      try {
        await Promise.all(imageUrls.map((url) => this.preloadImage(url)))
      } catch (error) {
        console.error('Image preloading failed:', error)
      }
    }

    /**
     * xâykhóihoanổnổHiệu quả
     * @param imageUrl Có thểvịcủaHình ảnhURL，nếuquảgợicungkhiếndùngHình ảnhHạt
     */
    createFirework(imageUrl?: string): void {
      // Ngẫu nhiênXác địnhnổnổkhởiđầuViTri
      const startX = Math.random() * this.canvasWidth
      const startY = this.canvasHeight

      // liệulàphủcóHình ảnhXác địnhCó thểdùngHình dạng
      const availableShapes = imageUrl && this.imageCache[imageUrl] ? ['image'] : CONFIG.SHAPES

      // lôlượngxâyHạtMảng，bớtthiểuphimcủaMảngHanhDong
      const particles: Firework[] = []

      for (let i = 0; i < CONFIG.PARTICLES_PER_BURST; i++) {
        const particle = this.getAvailableParticle()
        if (!particle) continue

        // kếHạtphátxạGócvàTốc độ (khôiphụcnguyênđầupháp)
        const angle = (Math.PI * i) / (CONFIG.PARTICLES_PER_BURST / 2) // quạthìnhPhân bố
        const speed = (12 + Math.random() * 6) * 1.5 // Ngẫu nhiênTốc độ
        const spread = Math.random() * Math.PI * 2 // 360độNgẫu nhiênmở

        // thẳngtiếpThuocTinhphúgiá trị，tránhmiễnObject.assigncủatínhnăngmởtác
        particle.x = startX
        particle.y = startY
        // phụctạpcủaTốc độkế，môphỏngthậtthựckhóihoanổnổquỹtích
        particle.vx = Math.cos(angle) * Math.cos(spread) * speed * (Math.random() * 0.5 + 0.5)
        particle.vy = Math.sin(angle) * speed - 15 // Lênban đầuđầuTốc độ
        particle.color = CONFIG.COLORS[Math.floor(Math.random() * CONFIG.COLORS.length)]
        particle.rotation = Math.random() * 360
        particle.rotationSpeed =
          (Math.random() * CONFIG.ROTATION.RANDOM_SPEED + CONFIG.ROTATION.BASE_SPEED) *
          (Math.random() > 0.5 ? 1 : -1) // Ngẫu nhiênXoayphươnghướng
        particle.scale = 0.8 + Math.random() * 0.4 // Ngẫu nhiênThu phóng
        particle.shape = availableShapes[Math.floor(Math.random() * availableShapes.length)]
        particle.opacity = 1
        particle.imageUrl = imageUrl && this.imageCache[imageUrl] ? imageUrl : undefined

        particles.push(particle)
      }

      // lôlượngThêm mớiđếnsốngđộngHạtMảng，bớtthiểuđalầnMảngHanhDong
      this.activeParticles.push(...particles)
    }

    /**
     * Cập nhậtnêncóHạtcủavậtlýTrạng thái (tínhnăngTốihóabảnquyển)
     * baobaoViTri、Tốc độ、Xoay、Độ trong suốtbằng
     */
    private updateParticles(): void {
      const { GRAVITY, VELOCITY_THRESHOLD, OPACITY_DECAY } = CONFIG.PHYSICS
      const { DECAY } = CONFIG.ROTATION

      // khiếndùngngượcthứkhắpLịch，tránhmiễnXóanguyêntốgiờcủaChỉ mụchỗnloạnhỏiđề
      for (let i = this.activeParticles.length - 1; i >= 0; i--) {
        const particle = this.activeParticles[i]

        // Cập nhậtHạtViTri (đềuthêmvậnđộng)
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += GRAVITY // trùnglựcảnh

        // Cập nhậtXoayTrạng thái
        particle.rotation += particle.rotationSpeed
        particle.rotationSpeed *= DECAY // XoayTốc độsuybớt

        // Độ trong suốtsuybớtLogic - khiHạtdướirơiTốc độsiêuquaNgưỡnggiờBắt đầunhạtra
        if (particle.vy > VELOCITY_THRESHOLD) {
          particle.opacity -= OPACITY_DECAY
          if (particle.opacity <= 0) {
            this.recycleParticle(i)
            continue
          }
        }

        // biêngiaoTìm - Dichiasiêuramàn hìnhmànphạmvicủaHạt
        if (this.isOutOfBounds(particle)) {
          this.recycleParticle(i)
        }
      }
    }

    /**
     * vềBộHạtđếnHồ đối tượng
     * @param index cầnvềBộcủaHạttạisốngđộngMảngtrongcủaChỉ mục
     */
    private recycleParticle(index: number): void {
      const particle = this.activeParticles[index]
      particle.active = false // tiêughivìphisốngđộngTrạng thái
      this.activeParticles.splice(index, 1) // từsốngđộngMảngtrongDichia
    }

    /**
     * TìmHạtlàphủsiêuramàn hìnhmànbiêngiao
     * @param particle cầnTìmcủaHạt
     * @returns làphủsiêurabiêngiao
     */
    private isOutOfBounds(particle: Firework): boolean {
      const margin = 100 // biêngiaoBộxungđồng
      return (
        particle.x < -margin ||
        particle.x > this.canvasWidth + margin ||
        particle.y < -margin ||
        particle.y > this.canvasHeight + margin
      )
    }

    /**
     * VẽđơnchiếcHạt
     * @param particle cầnVẽcủaHạtDoiTuong
     */
    private drawParticle(particle: Firework): void {
      if (!ctx.value) return

      // LưutồnkhitrướcCanvasTrạng thái
      ctx.value.save()
      ctx.value.globalAlpha = particle.opacity // CaiDatĐộ trong suốt
      ctx.value.translate(particle.x, particle.y) // DiđộngđếnHạtViTri
      ctx.value.rotate((particle.rotation * Math.PI) / 180) // Ứng dụngXoay
      ctx.value.scale(particle.scale, particle.scale) // Ứng dụngThu phóng

      // RenderHạtHình dạng
      this.renderShape(particle)

      // khôiphụcCanvasTrạng thái
      ctx.value.restore()
    }

    /**
     * liệuHạtloạikiểuRenderđốiứngcủaHình dạng
     * @param particle cầnRendercủaHạt
     */
    private renderShape(particle: Firework): void {
      if (!ctx.value) return

      const { SIZES } = CONFIG
      ctx.value.fillStyle = particle.color

      switch (particle.shape) {
        case 'rectangle':
          // Vẽvuônghình
          ctx.value.fillRect(
            -SIZES.RECTANGLE.WIDTH / 2,
            -SIZES.RECTANGLE.HEIGHT / 2,
            SIZES.RECTANGLE.WIDTH,
            SIZES.RECTANGLE.HEIGHT
          )
          break

        case 'square':
          // Vẽđúngphươnghình
          ctx.value.fillRect(
            -SIZES.SQUARE.SIZE / 2,
            -SIZES.SQUARE.SIZE / 2,
            SIZES.SQUARE.SIZE,
            SIZES.SQUARE.SIZE
          )
          break

        case 'circle':
          // Vẽhình
          ctx.value.beginPath()
          ctx.value.arc(0, 0, SIZES.CIRCLE.SIZE / 2, 0, Math.PI * 2)
          ctx.value.fill()
          break

        case 'triangle':
          // VẽbaVaihình
          ctx.value.beginPath()
          ctx.value.moveTo(0, -SIZES.TRIANGLE.SIZE)
          ctx.value.lineTo(SIZES.TRIANGLE.SIZE, SIZES.TRIANGLE.SIZE)
          ctx.value.lineTo(-SIZES.TRIANGLE.SIZE, SIZES.TRIANGLE.SIZE)
          ctx.value.closePath()
          ctx.value.fill()
          break

        case 'oval':
          // Vẽbầu dục
          ctx.value.beginPath()
          ctx.value.ellipse(0, 0, SIZES.OVAL.WIDTH / 2, SIZES.OVAL.HEIGHT / 2, 0, 0, Math.PI * 2)
          ctx.value.fill()
          break

        case 'image':
          // VẽHình ảnh
          this.renderImage(particle)
          break
      }
    }

    /**
     * RenderHình ảnhloạikiểucủaHạt
     * @param particle Bao gồmHình ảnhURLcủaHạtDoiTuong
     */
    private renderImage(particle: Firework): void {
      if (!ctx.value || !particle.imageUrl) return

      const img = this.imageCache[particle.imageUrl]
      if (img?.complete) {
        const { WIDTH, HEIGHT } = CONFIG.SIZES.IMAGE
        ctx.value.drawImage(img, -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT)
      }
    }

    /**
     * RendernêncósốngđộngHạtđếnCanvas
     * xóachiaCanvasđồng thờitrùngmớiVẽnêncóHạt
     */
    private render(): void {
      if (!ctx.value || !canvasRef.value) return

      // xóachiachỉnhchiếcCanvas
      ctx.value.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      // CaiDathỗnhợpmôkiểuvì"biếnsáng"，ThêmcườngTrực quanHiệu quả
      ctx.value.globalCompositeOperation = 'lighter'

      // RendernêncósốngđộngHạt
      for (const particle of this.activeParticles) {
        this.drawParticle(particle)
      }
    }

    /**
     * HoatAnhchủVòng lặp
     * khiếndùngđầuHàmDuy trìthisLiênđịnh
     */
    private animate = (): void => {
      this.updateParticles() // Cập nhậtHạtTrạng thái
      this.render() // RenderHạt
      this.animationId = requestAnimationFrame(this.animate) // Vui lòngcầudướimột
    }

    /**
     * Cập nhậtCanvasthướctấcCache
     * tạisổdiệnKích thướcsửabiếngiờđiềudùng
     * @param width mớicủaCanvasChiều rộng
     * @param height mớicủaCanvasChiều cao
     */
    updateCanvasSize(width: number, height: number): void {
      this.canvasWidth = width
      this.canvasHeight = height
    }

    /**
     * bậtđộngHoatAnhVòng lặp
     */
    start(): void {
      this.animate()
    }

    /**
     * dừngthúcHoatAnhVòng lặp
     * tạiComponentUnmountgiờđiềudùng，tránhmiễntrongtồn
     */
    stop(): void {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = 0
      }
    }

    /**
     * LấykhitrướcsốngđộngHạtSố lượng
     * dùngởđiềuthửvàtínhnăngGiámkhống
     * @returns sốngđộngHạtSố lượng
     */
    getActiveParticleCount(): number {
      return this.activeParticles.length
    }
  }

  /** khóihoaHeThongthựcví dụ */
  const fireworkSystem = new FireworkSystem()

  /**
   * XuLyphímkhoáinhanhphím
   * Lắng nghe Ctrl+Shift+P hoặc Cmd+Shift+P tổhợpphímKích hoạtkhóihoa
   * @param event phímSuKienDoiTuong
   */
  const handleKeyPress = (event: KeyboardEvent): void => {
    const isFireworkShortcut =
      (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'p') ||
      (event.metaKey && event.shiftKey && event.key.toLowerCase() === 'p')

    if (isFireworkShortcut) {
      event.preventDefault()
      fireworkSystem.createFirework()
    }
  }

  /**
   * điềuchỉnhCanvasCanvasKích thước
   * ứngsổdiệnKích thướcbiếnhóa，Đảm bảoCanvasđầucuốiphủlấpchỉnhchiếcthịdiện
   */
  const resizeCanvas = (): void => {
    if (!canvasRef.value) return

    const { innerWidth, innerHeight } = window
    canvasRef.value.width = innerWidth
    canvasRef.value.height = innerHeight
    fireworkSystem.updateCanvasSize(innerWidth, innerHeight)
  }

  /**
   * XuLyngoàibộKích hoạtcủakhóihoaSuKien
   * thông qua mittBus SuKientổngđườngtiếpBộKích hoạtlệnh
   * @param event SuKienDữ liệu，Có thểnăngBao gồmHình ảnhURL
   */
  const handleFireworkTrigger: Handler<unknown> = (event: unknown) => {
    const imageUrl = event as string | undefined
    fireworkSystem.createFirework(imageUrl)
  }

  /**
   * ComponentMountgiờcủaban đầuđầuhóaLogic
   */
  onMounted(async () => {
    if (!canvasRef.value) return

    // LấyCanvas 2DVẽtrêndướivăn
    ctx.value = canvasRef.value.getContext('2d')
    if (!ctx.value) return

    // CaiDatban đầuđầuCanvasKích thước
    resizeCanvas()

    // trướcLoadingnêncóHình ảnhtàinguồn
    await fireworkSystem.preloadAllImages()

    // bậtđộngHoatAnhVòng lặp
    fireworkSystem.start()

    // DangKySuKienLắng nghethiết bị
    useEventListener(window, 'keydown', handleKeyPress) // phímkhoáinhanhphím
    useEventListener(window, 'resize', resizeCanvas) // sổdiệnKích thướcbiếnhóa
    mittBus.on('triggerFireworks', handleFireworkTrigger) // ngoàibộKích hoạtSuKien
  })

  /**
   * ComponentUnmountgiờcủaxóalýLogic
   * dừngthúcHoatAnhVòng lặpđồng thờiDichiaSuKienLắng nghethiết bị，Phòngthúctrongtồn
   */
  onUnmounted(() => {
    fireworkSystem.stop()
    mittBus.off('triggerFireworks', handleFireworkTrigger)
  })
</script>
