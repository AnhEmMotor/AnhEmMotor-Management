import type { ECharts, EChartsOption } from 'echarts';

const ECHARTS_INSTANCE_ATTRIBUTE = '_echarts_instance_';

interface ChartPalette {
  text: string;
  secondaryText: string;
  line: string;
  splitLine: string;
  tooltipBackground: string;
  tooltipBorder: string;
}

function getChartPalette(isDark: boolean): ChartPalette {
  if (isDark) {
    return {
      text: '#e5e7eb',
      secondaryText: '#cbd5e1',
      line: '#4b5563',
      splitLine: '#374151',
      tooltipBackground: 'rgba(17, 24, 39, 0.96)',
      tooltipBorder: '#4b5563',
    };
  }

  return {
    text: '#374151',
    secondaryText: '#6b7280',
    line: '#d1d5db',
    splitLine: '#e5e7eb',
    tooltipBackground: 'rgba(255, 255, 255, 0.96)',
    tooltipBorder: '#d1d5db',
  };
}

function createPatches(
  currentValue: unknown,
  createPatch: () => Record<string, unknown>
): Record<string, unknown>[] | undefined {
  const count = Array.isArray(currentValue) ? currentValue.length : currentValue ? 1 : 0;
  return count > 0 ? Array.from({ length: count }, createPatch) : undefined;
}

function applyEChartsTheme(chart: ECharts, isDark: boolean): void {
  const palette = getChartPalette(isDark);
  const currentOptions = chart.getOption() as Record<string, unknown>;
  const axisPatch = () => ({
    nameTextStyle: { color: palette.secondaryText },
    axisLabel: { color: palette.secondaryText },
    axisLine: { lineStyle: { color: palette.line } },
    splitLine: { lineStyle: { color: palette.splitLine } },
    axisPointer: { label: { color: palette.text } },
  });
  const themedOptions: Record<string, unknown> = {
    backgroundColor: 'transparent',
    textStyle: { color: palette.text },
  };
  const title = createPatches(currentOptions.title, () => ({
    textStyle: { color: palette.text },
    subtextStyle: { color: palette.secondaryText },
  }));
  const legend = createPatches(currentOptions.legend, () => ({
    textStyle: { color: palette.text },
  }));
  const tooltip = createPatches(currentOptions.tooltip, () => ({
    backgroundColor: palette.tooltipBackground,
    borderColor: palette.tooltipBorder,
    textStyle: { color: palette.text },
  }));
  const radar = createPatches(currentOptions.radar, () => ({
    axisName: { color: palette.secondaryText },
    axisLine: { lineStyle: { color: palette.line } },
    splitLine: { lineStyle: { color: palette.splitLine } },
  }));
  const visualMap = createPatches(currentOptions.visualMap, () => ({
    textStyle: { color: palette.text },
  }));

  if (title) themedOptions.title = title;
  if (legend) themedOptions.legend = legend;
  if (tooltip) themedOptions.tooltip = tooltip;
  if (radar) themedOptions.radar = radar;
  if (visualMap) themedOptions.visualMap = visualMap;

  for (const axisName of ['xAxis', 'yAxis', 'radiusAxis', 'angleAxis'] as const) {
    const patch = createPatches(currentOptions[axisName], axisPatch);
    if (patch) themedOptions[axisName] = patch;
  }

  chart.setOption(themedOptions as EChartsOption, { lazyUpdate: true });
}

export async function syncEChartsTheme(): Promise<void> {
  const chartElements = document.querySelectorAll<HTMLElement>(`[${ECHARTS_INSTANCE_ATTRIBUTE}]`);
  if (chartElements.length === 0) return;

  const { getInstanceByDom } = await import('echarts');
  const isDark = document.documentElement.classList.contains('dark');

  chartElements.forEach((element) => {
    const chart = getInstanceByDom(element);
    if (chart && !chart.isDisposed()) applyEChartsTheme(chart, isDark);
  });
}

export function installEChartsThemeSync(): () => void {
  let animationFrameId = 0;
  const scheduleSync = () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animationFrameId = requestAnimationFrame(() => {
      animationFrameId = 0;
      void syncEChartsTheme();
    });
  };
  const observer = new MutationObserver(scheduleSync);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  observer.observe(document.body ?? document.documentElement, {
    attributes: true,
    attributeFilter: [ECHARTS_INSTANCE_ATTRIBUTE],
    subtree: true,
  });
  scheduleSync();

  return () => {
    observer.disconnect();
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  };
}
