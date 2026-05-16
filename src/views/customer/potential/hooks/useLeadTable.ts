import { ref, onMounted, reactive } from 'vue'
import { fetchGetLeadList, Lead } from '@/api/lead'
import { ElMessage } from 'element-plus'

export function useLeadTable() {
  const data = ref<Lead[]>([])
  const loading = ref(false)
  
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const columns = [
    { title: 'Họ tên', dataIndex: 'fullName', slot: 'fullName' },
    { title: 'Số điện thoại', dataIndex: 'phoneNumber' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Xe quan tâm', dataIndex: 'interestedVehicle' },
    { title: 'Điểm số', dataIndex: 'score', slot: 'score' },
    { title: 'Trạng thái', dataIndex: 'status', slot: 'status' },
    { title: 'Ngày tạo', dataIndex: 'createdAt', slot: 'createdAt' },
    { title: 'Thao tác', dataIndex: 'operation', slot: 'operation', width: 120 }
  ]

  const selectedIds = ref<number[]>([])
  const salesList = ref([
    { id: 1, name: 'Admin', color: '#ff4d4f' },
    { id: 2, name: 'Sale Nguyễn Văn A', color: '#1890ff' },
    { id: 3, name: 'Sale Trần Thị B', color: '#52c41a' }
  ])

  const toggleSelect = (id: number) => {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
      selectedIds.value.splice(index, 1)
    } else {
      selectedIds.value.push(id)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.value.length === data.value.length) {
      selectedIds.value = []
    } else {
      selectedIds.value = data.value.map(item => item.id)
    }
  }

  const handleAssignBulk = (saleId: number) => {
    ElMessage.success(`Đã giao ${selectedIds.value.length} khách hàng cho nhân viên mới`)
    selectedIds.value = []
  }

  const getPriority = (lead: Lead) => {
    // Logic phân loại:
    // 1. Cấp bách (Urgent): Đang lái thử hoặc thương lượng -> Màu Đỏ
    if (lead.status === 'TestDrive' || lead.status === 'Negotiating') {
      return { level: 3, label: 'CẤP BÁCH', icon: 'ri:fire-fill', color: '#ef4444' }
    }
    // 2. Tiềm năng (High): Có chọn xe cụ thể -> Màu Cam
    if (lead.interestedVehicle) {
      return { level: 2, label: 'TIỀM NĂNG', icon: 'ri:star-fill', color: '#f97316' }
    }
    // 3. Theo dõi (Low): Mới hoặc không có xe cụ thể -> Màu Xanh/Xám
    return { level: 1, label: 'THEO DÕI', icon: 'ri:folder-user-fill', color: '#64748b' }
  }

  const refreshData = async () => {
    loading.value = true
    try {
      const res = await fetchGetLeadList()
      let leads = Array.isArray(res) ? res : (res as any).items || []
      
      // Sắp xếp thông minh: Cấp bách (3) -> Tiềm năng (2) -> Theo dõi (1)
      data.value = leads.sort((a: any, b: any) => {
        const pA = getPriority(a).level
        const pB = getPriority(b).level
        return pB - pA
      })

      pagination.total = data.value.length
    } catch (err: any) {
      ElMessage.error('Lỗi khi lấy dữ liệu: ' + err.message)
    } finally {
      loading.value = false
    }
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    refreshData()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    refreshData()
  }

  const handleSearch = (params: any) => {
    console.log('Search:', params)
    refreshData()
  }

  const handleReset = () => {
    refreshData()
  }

  onMounted(() => {
    refreshData()
  })

  return {
    data,
    loading,
    pagination,
    columns,
    handleSizeChange,
    handleCurrentChange,
    handleSearch,
    handleReset,
    selectedIds,
    salesList,
    toggleSelect,
    toggleSelectAll,
    handleAssignBulk,
    refreshData,
    getPriority
  }
}
