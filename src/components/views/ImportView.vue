<script setup>
import { ref, computed } from 'vue';
import TopHeader from '@/components/import/TopHeader.vue';
import Sidebar from '@/components/import/Sidebar.vue';
import MainContent from '@/components/import/MainContent.vue';

// Dữ liệu giả lập cho các phiếu nhập
const allInventoryItems = ref([
    {
        id: 'PN000001',
        time: '10/10/2025 10:20',
        supplierCode: 'NCC00001',
        supplierName: 'NCC ĐỒNG NAI',
        payable: 3500000000,
        status: 'Đã nhập hàng',
        isOpen: true, // Mặc định mở
        branch: 'Chi nhánh trung tâm',
        creator: 'Kim Ngân',
        importer: 'Kim Ngân',
        importDate: '2025-10-10',
        products: [
            { code: 'SP000002', name: 'VARIO', quantity: 100, unitPrice: 35000000, discount: 0, importPrice: 35000000, total: 3500000000 }
        ],
        notes: '',
        paid: 3500000000,
    },
    {
        id: 'PN000002',
        time: '10/10/2025 09:30',
        supplierCode: 'NCC00002',
        supplierName: 'NCC PHÚ THỌ',
        payable: 3440700000,
        status: 'Phiếu tạm',
        isOpen: false,
        branch: 'Chi nhánh TP.HCM',
        creator: 'Trần Văn A',
        importer: 'Lê Thị B',
        importDate: '2025-10-10',
        products: [
            { code: 'SP001001', name: 'SH Mode 2024', quantity: 30, unitPrice: 65000000, discount: 300000, importPrice: 64700000, total: 1941000000 },
            { code: 'SP001002', name: 'Vision 2023', quantity: 50, unitPrice: 30000000, discount: 0, importPrice: 30000000, total: 1500000000 }
        ],
        notes: 'Nhập hàng đầu tháng, số lượng lớn.',
        paid: 1200000000,
    },
    {
        id: 'PN000003',
        time: '09/10/2025 15:00',
        supplierCode: 'NCC00003',
        supplierName: 'NCC QUẢNG NAM',
        payable: 0,
        status: 'Đã hủy',
        isOpen: false,
        branch: 'Chi nhánh Đà Nẵng',
        creator: 'Nguyễn Văn C',
        importer: 'Đã hủy',
        importDate: '2025-10-09',
        products: [
            { code: 'SP002001', name: 'Sirius 2024', quantity: 40, unitPrice: 12500000, discount: 0, importPrice: 12500000, total: 500000000 }
        ],
        notes: 'Đã hủy do lỗi đặt hàng sai mẫu mã.',
        paid: 0,
    },
     {
        id: 'PN000004',
        time: '08/10/2025 11:45',
        supplierCode: 'NCC00004',
        supplierName: 'NCC MIỀN TÂY',
        payable: 6000000000,
        status: 'Đã nhập hàng',
        isOpen: false,
        branch: 'Chi nhánh Cần Thơ',
        creator: 'Phạm Văn D',
        importer: 'Phạm Văn D',
        importDate: '2025-10-08',
        products: [
            { code: 'SP003001', name: 'Exciter 155', quantity: 50, unitPrice: 40000000, discount: 0, importPrice: 40000000, total: 2000000000 },
            { code: 'SP003002', name: 'Winner X', quantity: 100, unitPrice: 40000000, discount: 0, importPrice: 40000000, total: 4000000000 }
        ],
        notes: '',
        paid: 6000000000,
    },
    {
        id: 'PN000005',
        time: '07/10/2025 16:10',
        supplierCode: 'NCC00005',
        supplierName: 'NCC HÀ NỘI',
        payable: 600000000,
        status: 'Phiếu tạm',
        isOpen: false,
        branch: 'Chi nhánh Hà Nội',
        creator: 'Lê Văn E',
        importer: 'Trần Thị F',
        importDate: '2025-10-07',
        products: [
            { code: 'SP004001', name: 'Air Blade 2023', quantity: 20, unitPrice: 40000000, discount: 0, importPrice: 40000000, total: 800000000 }
        ],
        notes: 'Đang chờ xác nhận từ kho trước khi thanh toán nốt.',
        paid: 200000000,
    },
]);

// Trạng thái của các bộ lọc
const statusFilters = ref({
    'Phiếu tạm': true,
    'Đã nhập hàng': true,
    'Đã hủy': true
});

// Lọc danh sách phiếu nhập dựa trên trạng thái được chọn
const filteredItems = computed(() => {
    const visibleStatuses = Object.keys(statusFilters.value).filter(status => statusFilters.value[status]);
    return allInventoryItems.value.filter(item => visibleStatuses.includes(item.status));
});

// Tính tổng tiền cần trả NCC dựa trên danh sách đã lọc
const totalPayable = computed(() => {
    return filteredItems.value.reduce((total, item) => total + item.payable, 0);
});

// Cập nhật trạng thái bộ lọc
function updateStatusFilter(newFilters) {
    statusFilters.value = newFilters;
}

// Xử lý việc mở/đóng chi tiết phiếu
function handleToggleDetail(itemId) {
    const item = allInventoryItems.value.find(i => i.id === itemId);
    if (item) {
        item.isOpen = !item.isOpen;
    }
}
</script>

<template>
    <div class="flex flex-col h-screen overflow-hidden">
        <TopHeader />
        <div class="flex flex-1 overflow-hidden">
            <Sidebar :filters="statusFilters" @update:filters="updateStatusFilter" />
            <MainContent 
                :items="filteredItems" 
                :totalPayable="totalPayable"
                @toggle-detail="handleToggleDetail"
            />
        </div>
    </div>
</template>
