// QuyenHanTaiLieu：https://www.artd.pro/docs/zh/guide/in-depth/permission.html
import { AppRouteRecord } from '@/types/router'
import { routeModules } from '../modules'

/**
 * Hoạt độngRouting（cầncầnQuyenHanmớinăngTruy cậpcủaRouting）
 * dùngởRenderMenulấyvàliệuMenuQuyenHanHoạt độngLoadingRouting，nếuquảkhôngcóQuyenHanvôphápTruy cập
 */
export const asyncRoutes: AppRouteRecord[] = routeModules
