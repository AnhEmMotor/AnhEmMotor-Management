import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export function useCustomerProfile() {
  const activeTab = ref('timeline')
  const isVerified = ref(false)

  // Dữ liệu khách hàng giả lập
  const customerInfo = reactive({
    id: 'AEM-2024-089',
    fullName: 'Nguyễn Hoàng Long',
    phone: '0988.123.456',
    status: 'Purchasing', // Potential | Purchasing | Official
    cccd: '',
    address: {
      province: 'Đồng Nai',
      city: 'Biên Hòa',
      ward: ''
    }
  })

  // Danh sách Phường/Xã tại Biên Hòa
  const wardsInBienHoa = [
    'Trảng Dài',
    'Long Bình',
    'Hố Nai',
    'Tân Hiệp',
    'Long Bình Tân',
    'Phước Tân',
    'Tam Phước',
    'Quang Vinh',
    'Thanh Bình',
    'Quyết Thắng'
  ]

  // Timeline tương tác
  const timelineEvents = ref([
    {
      id: 1,
      type: 'ai',
      content: 'Khách hỏi về mức tiêu hao xăng của Winner X',
      time: '10:30 - 02/05/2024',
      icon: 'ri:robot-line',
      color: '#6366f1'
    },
    {
      id: 2,
      type: 'sale',
      content: 'Đã tư vấn qua điện thoại: Khách thích màu Đỏ Đen, đang cân nhắc trả góp 0%',
      time: '14:20 - 02/05/2024',
      icon: 'ri:user-voice-line',
      color: '#f59e0b'
    },
    {
      id: 3,
      type: 'milestone',
      content: 'Đã đến Showroom xem xe trực tiếp',
      time: '09:00 - 03/05/2024',
      icon: 'ri:map-pin-line',
      color: '#ef4444'
    }
  ])

  const handleVerify = () => {
    if (!customerInfo.cccd || !customerInfo.address.ward) {
      ElMessage.warning('Vui lòng hoàn thiện CCCD và Địa chỉ trước khi xác thực')
      return
    }
    isVerified.value = !isVerified.value
    if (isVerified.value) {
      ElMessage.success('Đã xác thực hồ sơ. Dữ liệu hiện đã được khóa để đảm bảo an toàn.')
    }
  }

  const addNote = (note: string) => {
    timelineEvents.value.unshift({
      id: Date.now(),
      type: 'sale',
      content: note,
      time: 'Vừa xong',
      icon: 'ri:edit-line',
      color: '#f59e0b'
    })
  }

  return {
    activeTab,
    isVerified,
    customerInfo,
    wardsInBienHoa,
    timelineEvents,
    handleVerify,
    addNote
  }
}
