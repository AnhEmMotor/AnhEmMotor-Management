import type { GuideSection } from '../data/guideData';
import { User } from '@element-plus/icons-vue';

export const sectionData: GuideSection = {
  id: 'hr',
  title: 'Quản Lý Nhân Sự (HR)',
  subtitle: 'Human Resources',
  description:
    'Hồ sơ nhân viên, quản lý ca làm việc, KPI và hệ thống tính lương tự động cho toàn bộ hệ thống đại lý.',
  icon: User,
  color: '#c026d3',
  shadowColor: 'rgba(192,38,211,0.15)',
  route: '/admin/hr',
  imageUrl: '/images/manual/hr_employee_list_1785990547958.png',
  pages: [
    {
      id: 'h-employees',
      title: 'Hồ sơ Nhân viên',
      route: '/admin/hr/employees',
      description: 'Quản lý danh bạ, hợp đồng lao động và thông tin cá nhân của đội ngũ nhân viên.',
      steps: [
        '1. Vào [Quản Lý Nhân Sự] -> [Hồ sơ Nhân viên].',
        '2. Nhấn [Thêm Nhân viên Mới]. Nhập thông tin CCCD, Ngày sinh, Địa chỉ thường trú.',
        '3. Tải lên Bản scan (File PDF/JPG) của Sơ yếu lý lịch, Bằng cấp, Giấy khám sức khỏe.',
        '4. Phân bổ nhân viên vào một Phòng ban (Ví dụ: Phòng Sales, Phòng Kế toán, Xưởng Dịch vụ).',
        '5. Nhập thông tin Ngân hàng (Số tài khoản, Chi nhánh) để Kế toán chuyển lương cuối tháng.',
        '6. Nếu nhân viên ký Hợp đồng lao động chính thức, nhập thời hạn hợp đồng. Hệ thống sẽ tự động gửi email nhắc nhở cho Bộ phận Nhân sự (HR) trước khi hợp đồng hết hạn 30 ngày.',
      ],
      tips: [
        'Hệ thống tự động liên kết Hồ sơ này với Tài khoản đăng nhập (User Account) ở phần Phân Quyền.',
        "Tính năng 'Gắn thẻ năng lực' giúp Quản đốc dễ dàng biết được thợ nào chuyên sửa xe ga, thợ nào chuyên xe số.",
      ],
    },
    {
      id: 'h-attendance',
      title: 'Chấm công & Phân ca',
      route: '/admin/hr/attendance',
      description: 'Tự động đồng bộ dữ liệu từ máy chấm công vân tay và quản lý xin nghỉ phép.',
      steps: [
        '1. Chuyển sang tab [Chấm công]. Hệ thống sẽ kéo log dữ liệu Check-in/Check-out từ máy vân tay (hoặc nhận diện khuôn mặt).',
        '2. Bộ phận HR xem Bảng công tổng hợp. Các ngày Đi trễ/Về sớm sẽ bị bôi đỏ.',
        '3. Xử lý Đơn xin nghỉ phép: Nhân viên gửi đơn qua App, Quản lý vào màn hình này để [Phê duyệt] hoặc [Từ chối].',
        '4. Nếu phê duyệt, hệ thống sẽ tự động cập nhật vào Bảng công cuối tháng.',
        '5. Quản lý phân ca làm việc (Ca sáng/Ca chiều/Ca gãy) cho các vị trí đặc thù như Thu ngân, Bảo vệ.',
      ],
      tips: [
        'Phần mềm hỗ trợ tính toán tự động các loại phép (Phép năm, Phép thai sản, Nghỉ không lương).',
        'Dữ liệu Chấm công này sẽ được đẩy thẳng sang phân hệ Kế toán để Chốt lương (Payroll).',
      ],
    },
  ],
};
