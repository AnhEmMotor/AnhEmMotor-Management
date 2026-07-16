import { computed } from "vue";
import { useWindowSize } from "@vueuse/core";

const BP = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export function useResponsive() {
  const { width } = useWindowSize();

  const isMobile = computed(() => width.value < BP.md);
  const isTablet = computed(() => width.value >= BP.md && width.value < BP.lg);
  const isDesktop = computed(() => width.value >= BP.lg);
  const isLarge = computed(() => width.value >= BP.xl);

  const lt = (bp: keyof typeof BP) => computed(() => width.value < BP[bp]);
  const gt = (bp: keyof typeof BP) => computed(() => width.value >= BP[bp]);
  const between = (lo: keyof typeof BP, hi: keyof typeof BP) =>
    computed(() => width.value >= BP[lo] && width.value < BP[hi]);

  const colSpan = (
    sm: number,
    md: number,
    lg = md,
    xl = lg,
  ) =>
    computed(() => {
      if (width.value >= BP.xl) return xl;
      if (width.value >= BP.lg) return lg;
      if (width.value >= BP.md) return md;
      return sm;
    });

  const sidebarWidth = computed(() => (width.value < 800 ? 0 : 220));

  const containerClass = (mobile = "p-2", tablet = "p-3", desktop = "p-4") =>
    computed(() => {
      if (width.value < BP.md) return mobile;
      if (width.value < BP.lg) return tablet;
      return desktop;
    });

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    lt,
    gt,
    between,
    colSpan,
    sidebarWidth,
    containerClass,
    bp: BP,
  };
}
