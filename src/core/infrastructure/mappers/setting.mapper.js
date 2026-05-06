const settingMapper = {
  toModel(dto) {
    const defaults = {
      deposit: 0,
      stockLevel: 0,
      maxOrder: 0,
      maxCount: 0,
    }
    if (!dto) return defaults
    return {
      deposit: Number(dto['Deposit_ratio']) || defaults.deposit,
      stockLevel: Number(dto['Inventory_alert_level']) || defaults.stockLevel,
      maxOrder: Number(dto['Order_value_exceeds']) || defaults.maxOrder,
      maxCount: Number(dto['Z-bike_threshold_for_meeting']) || defaults.maxCount,
    }
  },

  toDTO(model) {
    if (!model) return {}
    return {
      Deposit_ratio: String(model.deposit),
      Inventory_alert_level: String(model.stockLevel),
      Order_value_exceeds: String(model.maxOrder),
      'Z-bike_threshold_for_meeting': String(model.maxCount),
    }
  },

  toParams(model) {
    if (!model) return ''
    const params = new URLSearchParams()
    if (model.deposit) params.append('deposit', model.deposit)
    return params.toString()
  },
}

export default settingMapper



