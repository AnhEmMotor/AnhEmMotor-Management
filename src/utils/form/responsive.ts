export type ResponsiveBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface BreakpointConfig {
  threshold: number

  fallback: number
}

const BREAKPOINT_CONFIG: Record<ResponsiveBreakpoint, BreakpointConfig | null> = {
  xs: { threshold: 12, fallback: 24 }, // taymáy：tiểuở 12 giờkhiếndùngđầyRộng
  sm: { threshold: 12, fallback: 12 }, // bản：tiểuở 12 giờkhiếndùngnửaRộng
  md: { threshold: 8, fallback: 8 }, // trongbằngmàn hìnhmàn：tiểuở 8 giờkhiếndùngbaphầncủamộtRộng
  lg: null, // đạimàn hìnhmàn：thẳngtiếpkhiếndùngCaiDatcủa span
  xl: null // siêuđạimàn hìnhmàn：thẳngtiếpkhiếndùngCaiDatcủa span
}

export function calculateResponsiveSpan(
  itemSpan: number | undefined,
  defaultSpan: number,
  breakpoint: ResponsiveBreakpoint
): number {
  const finalSpan = itemSpan ?? defaultSpan
  const config = BREAKPOINT_CONFIG[breakpoint]

  if (!config) {
    return finalSpan
  }

  return finalSpan >= config.threshold ? finalSpan : config.fallback
}

export function createResponsiveSpanCalculator(defaultSpan: number) {
  return (itemSpan: number | undefined, breakpoint: ResponsiveBreakpoint): number => {
    return calculateResponsiveSpan(itemSpan, defaultSpan, breakpoint)
  }
}
