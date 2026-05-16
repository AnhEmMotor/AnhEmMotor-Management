import type { App } from 'vue'
import { setupAuthDirective, type AuthDirective } from './core/auth'
import { setupHighlightDirective, type HighlightDirective } from './business/highlight'
import { setupRippleDirective, type RippleDirective } from './business/ripple'
import { setupRolesDirective, type RolesDirective } from './core/roles'

export function setupGlobDirectives(app: App) {
  setupAuthDirective(app) // QuyenHanlệnh
  setupRolesDirective(app) // VaiTroQuyenHanlệnh
  setupHighlightDirective(app) // caosánglệnh
  setupRippleDirective(app) // sóngvânlệnh
}

export type { AuthDirective, HighlightDirective, RippleDirective, RolesDirective }
