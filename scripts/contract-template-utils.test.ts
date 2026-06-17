import assert from 'node:assert/strict'

import {
  buildPreviewHtml,
  extractUsedTokenGroups,
  filterTokenGroups,
  getTokenGroupByKey,
  parseDynamicFields,
} from '../src/views/contract/templates/contract-template.utils'

const customerGroup = getTokenGroupByKey('customer')
assert.equal(customerGroup?.tone, 'amber')

const vehicleGroup = getTokenGroupByKey('vehicle')
assert.equal(vehicleGroup?.tone, 'emerald')

const fallbackGroups = parseDynamicFields('')
assert.ok(fallbackGroups.customer.length > 0)
assert.ok(fallbackGroups.vehicle.length > 0)
assert.ok(fallbackGroups.finance.length > 0)
assert.ok(fallbackGroups.supplier.length > 0)

const flatGroups = parseDynamicFields(
  JSON.stringify([
    { key: '{{CustomerName}}', label: 'Customer name', group: 'customer' },
    { key: '{{VehicleName}}', label: 'Vehicle name', group: 'vehicle' },
  ]),
)
assert.equal(flatGroups.customer.length, 1)
assert.equal(flatGroups.vehicle.length, 1)

const filteredGroups = filterTokenGroups(fallbackGroups, 'VehicleName')
assert.equal(filteredGroups.customer.length, 0)
assert.equal(filteredGroups.vehicle.length, 1)

const usedGroups = extractUsedTokenGroups(
  '<p>{{CustomerName}} - {{VehicleName}} - {{UnknownField}}</p>',
  fallbackGroups,
)
assert.equal(usedGroups.groups.customer.length, 1)
assert.equal(usedGroups.groups.vehicle.length, 1)
assert.deepEqual(usedGroups.unknownTokens, ['{{UnknownField}}'])

const previewHtml = buildPreviewHtml('<p>{{CustomerName}} - {{VehicleName}} - {{UnknownField}}</p>')
assert.ok(previewHtml.includes('contract-unresolved-token'))
assert.ok(previewHtml.includes('<span class="contract-unresolved-token">{{CustomerName}}</span>'))
assert.ok(previewHtml.includes('<span class="contract-unresolved-token">{{VehicleName}}</span>'))
assert.ok(previewHtml.includes('{{UnknownField}}'))
