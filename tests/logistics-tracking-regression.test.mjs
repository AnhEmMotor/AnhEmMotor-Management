import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const managementRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendRoot = resolve(managementRoot, '..', 'AnhEmMotor-Backend');
const readManagementFile = (path) => readFileSync(resolve(managementRoot, path), 'utf8');
const readBackendFile = (path) => readFileSync(resolve(backendRoot, path), 'utf8');

const trackingPage = readManagementFile('src/modules/Order/view/logistics/tracking/index.vue');
const shipmentRepository = readBackendFile(
  'Infrastructure/Repositories/Logistics/Shipment/ShipmentRepository.cs'
);
const logisticsSeeder = readBackendFile('Infrastructure/Seeders/LogisticsDataSeeder.cs');
const logisticsController = readBackendFile('WebAPI/Controllers/V1/LogisticsController.cs');
const trackingHandler = readBackendFile(
  'Application/Features/Logistics/Queries/GetShipmentTracking/GetShipmentTrackingQueryHandler.cs'
);

assert.doesNotMatch(
  shipmentRepository,
  /s\.OutputId\s*!=\s*null/,
  'Active tracking must include standalone seeded shipments without an Output relation'
);
assert.doesNotMatch(
  logisticsSeeder,
  /if \(await context\.Shipments\.AnyAsync[^]*?\)\)\s*return;/,
  'Logistics seed data must not be skipped merely because another shipment exists'
);
assert.match(trackingPage, /@keyup\.enter=["']searchShipment["']/);
assert.match(trackingPage, /@click=["']searchShipment["']/);
assert.match(trackingPage, /async function searchShipment\(\)/);
assert.match(trackingPage, /getShipmentTracking\(query\)/);
assert.match(
  trackingPage,
  /https:\/\/tile\.openstreetmap\.org\/\{z\}\/\{x\}\/\{y\}\.png/,
  'Tracking map must use the canonical OpenStreetMap tile hostname'
);
assert.doesNotMatch(
  trackingPage,
  /\{s\}\.tile\.openstreetmap\.org/,
  'Tracking map must not depend on the deprecated OpenStreetMap a/b/c subdomains'
);
assert.match(
  trackingPage,
  /openStreetMapLayer\.once\(['"]tileerror['"][^]*?basemaps\.cartocdn\.com\/light_all/,
  'Tracking map must fall back when the OpenStreetMap tile service is unavailable'
);
assert.match(
  trackingPage,
  /© OpenStreetMap contributors © CARTO/,
  'Fallback map tiles must retain the required provider attribution'
);
assert.match(
  trackingPage,
  /new ResizeObserver\([^]*?invalidateSize/,
  'Tracking map must recalculate its viewport when the tab or layout is resized'
);
assert.doesNotMatch(
  trackingPage,
  /flyToBounds/,
  'Selecting a shipment must not run an expensive zoom animation'
);
assert.match(
  trackingPage,
  /fitBounds\([^]*?maxZoom:\s*15[^]*?animate:\s*false/,
  'Tracking map must fit the route without animation'
);
assert.match(
  trackingPage,
  /const map = shallowRef<L\.Map \| null>\(null\)/,
  'Leaflet map instances must not be wrapped in a Vue reactive proxy'
);
assert.match(
  trackingPage,
  /const markersLayer = shallowRef<L\.LayerGroup \| null>\(null\)[^]*?const polylineLayer = shallowRef<L\.LayerGroup \| null>\(null\)/,
  'Leaflet layer instances must preserve their raw object identity'
);
assert.doesNotMatch(
  trackingPage,
  /map\.value\.stop\(\)/,
  'Non-animated map updates must not trigger an unnecessary Leaflet view reset'
);
const drawTrackingSection = trackingPage.slice(
  trackingPage.indexOf('async function drawTrackingData()'),
  trackingPage.indexOf('function getMilestoneColor')
);
assert.ok(
  drawTrackingSection.indexOf('await fetchRoadRoute') < drawTrackingSection.indexOf('L.polyline'),
  'Tracking map must wait for the real road route instead of displaying a straight placeholder'
);
assert.doesNotMatch(
  drawTrackingSection,
  /L\.polyline\(\[startCoords,\s*destCoords\]/,
  'Tracking map must never display a misleading straight route while OSRM is loading'
);
assert.match(
  trackingPage,
  /await nextTick\(\)[^]*?await drawTrackingData\(\)/,
  'Shipment loading must remain active until the real route has been drawn'
);
assert.match(
  trackingPage,
  /v-loading=["']loadingDetails["'][^>]*element-loading-text=["']Đang tải tuyến đường\.\.\.["']/,
  'Tracking map must show a route loading state instead of a placeholder line'
);
assert.match(
  trackingPage,
  /const roadRouteCache = new Map[^]*?roadRouteCache\.get[^]*?roadRouteCache\.set/,
  'Resolved road routes must be cached for immediate repeat views'
);
assert.match(logisticsController, /result\.OrderId\s*==\s*0/);
assert.match(trackingHandler, /Description\s*=\s*"Đã lấy hàng"/);
assert.match(trackingHandler, /Description\s*=\s*"Đã đến bưu cục trung chuyển"/);
assert.match(trackingHandler, /Description\s*=\s*"Giao hàng thành công"/);

console.log('Logistics tracking regression checks passed.');
