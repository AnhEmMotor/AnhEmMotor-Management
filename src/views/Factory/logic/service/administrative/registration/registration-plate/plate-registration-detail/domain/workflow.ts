import type { PlateRegistrationWorkflowStatus } from './models'

export const PLATE_REGISTRATION_WORKFLOW_STEPS: Array<{
  key: PlateRegistrationWorkflowStatus
  title: string
  description: string
}> = [
  {
    key: 'Preparation',
    title: 'Chuẩn bị hồ sơ',
    description:
      'Nhân viên thủ tục thực hiện. Giai đoạn này hệ thống không gửi thông báo tự động cho khách.',
  },
  {
    key: 'PreTaxPaid',
    title: 'Đã nộp thuế trước bạ',
    description:
      'Sau khi hoàn tất đóng thuế, hệ thống tự động kích hoạt gửi tin nhắn Zalo/SMS để thông báo tiến độ cho khách.',
  },
  {
    key: 'PlateBilled',
    title: 'Đã bấm biển số',
    description:
      'Sau khi xe đã bấm biển số xong, hệ thống tự động bắn tin nhắn Zalo/SMS cập nhật tình trạng cho khách.',
  },
  {
    key: 'WaitingCavet',
    title: 'Đang chờ cà-vẹt (Giấy hẹn)',
    description:
      'Giai đoạn chờ cấp giấy chứng nhận đăng ký xe chính thức. Hệ thống tự động gửi Zalo/SMS báo cho khách biết xe đang trong trạng thái chờ.',
  },
  {
    key: 'Completed',
    title: 'Hoàn tất (Đã nhận Cà-vẹt)',
    description:
      'Khi giấy tờ đã về đến showroom, hệ thống tự động gửi xác nhận để khách đến nhận xe và Cà-vẹt gốc.',
  },
]

export const nextWorkflowStatus = (
  current: PlateRegistrationWorkflowStatus,
): PlateRegistrationWorkflowStatus | null => {
  const idx = PLATE_REGISTRATION_WORKFLOW_STEPS.findIndex((s) => s.key === current)
  if (idx < 0) return null
  return PLATE_REGISTRATION_WORKFLOW_STEPS[idx + 1]?.key ?? null
}

export const isLastWorkflowStatus = (current: PlateRegistrationWorkflowStatus): boolean => {
  const idx = PLATE_REGISTRATION_WORKFLOW_STEPS.findIndex((s) => s.key === current)
  return idx === PLATE_REGISTRATION_WORKFLOW_STEPS.length - 1
}
