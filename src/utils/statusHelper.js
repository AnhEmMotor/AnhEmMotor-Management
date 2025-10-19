export const statusMaps = {
  motorcycle: {
    unconfirmed: { text: 'Chưa Xác Nhận', color: 'bg-yellow-100 text-yellow-800', canCancel: true },
    completed: { text: 'Đã Hoàn Thành', color: 'bg-green-100 text-green-800', canCancel: false },
  },
  parts: {
    unconfirmed: { text: 'Chưa Xác Nhận', color: 'bg-yellow-100 text-yellow-800', canCancel: true },
    completed: { text: 'Đã Hoàn Thành', color: 'bg-green-100 text-green-800', canCancel: false },
  },
  accessories: {
    unconfirmed: { text: 'Chưa Xác Nhận', color: 'bg-yellow-100 text-yellow-800', canCancel: true },
    completed: { text: 'Đã Hoàn Thành', color: 'bg-green-100 text-green-800', canCancel: false },
  },
}

export function getStatusInfo(type, status) {
  return (
    statusMaps[type]?.[status] || {
      text: status,
      color: 'bg-gray-100 text-gray-800',
      canCancel: false,
    }
  )
}
