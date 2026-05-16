/**
 * ComponentLoadingthiết bị
 *
 * tráchHoạt độngLoading Vue Component
 *
 * @module router/core/ComponentLoader
 * @author Art Design Pro Team
 */

import { h } from 'vue'

export class ComponentLoader {
  private modules: Record<string, () => Promise<any>>

  constructor() {
    // Hoạt độngNhập file views mụclụcdướinêncó .vue Component
    this.modules = import.meta.glob('../../views/**/*.vue')
  }

  /**
   * LoadingComponent
   */
  load(componentPath: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    // cấuxâyCó thểnăngcủađường
    const fullPath = `../../views${componentPath}.vue`
    const fullPathWithIndex = `../../views${componentPath}/index.vue`

    // thửthửthẳngtiếpđường，lạithửthửThêm mới/indexcủađường
    const module = this.modules[fullPath] || this.modules[fullPathWithIndex]

    if (!module) {
      console.error(
        `[ComponentLoader] ChưatìmđếnComponent: ${componentPath}，thửthửquacủađường: ${fullPath} và ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    return module
  }

  /**
   * LoadingBố cụcComponent
   */
  loadLayout(): () => Promise<any> {
    return () => import('@/views/index/index.vue')
  }

  /**
   * Loading iframe Component
   */
  loadIframe(): () => Promise<any> {
    return () => import('@/views/outside/Iframe.vue')
  }

  /**
   * xâykhôngComponent
   */
  private createEmptyComponent(): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', {})
        }
      })
  }

  /**
   * xâyLỗiGợi ýComponent
   */
  private createErrorComponent(componentPath: string): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', { class: 'route-error' }, `ComponentChưatìmđến: ${componentPath}`)
        }
      })
  }
}
