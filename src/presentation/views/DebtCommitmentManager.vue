<script setup>
import { ref, computed } from 'vue'
import Button from '@components/ui/button/BaseButton.vue'
import Input from '@components/ui/input/BaseInput.vue'
import RoundBadge from '@components/ui/RoundBadge.vue'
import IconFileExport from '@/assets/icons/IconFileExport.svg'

const activeTab = ref('suppliers')

const supplierDebts = ref([
  { id: 1, name: 'Honda Việt Nam', totalPurchased: 5000000000, paid: 3500000000, balance: 1500000000, lastOrder: '2024-04-20', deadline: '2024-05-20', status: 'Pending' },
  { id: 2, name: 'Đại lý Cấp 1 Toàn Thắng', totalPurchased: 1200000000, paid: 1200000000, balance: 0, lastOrder: '2024-03-15', deadline: '-', status: 'Cleared' },
  { id: 3, name: 'Phụ tùng Mạnh Quang', totalPurchased: 150000000, paid: 50000000, balance: 100000000, lastOrder: '2024-04-28', deadline: '2024-05-10', status: 'Overdue' }
])

const bankInstallments = ref([
  { id: 101, customer: 'Nguyễn Văn A', bank: 'FE Credit', amount: 25000000, status: 'Pending Disbursement', contact: '0901234567 (Mr. Bình)', daysPending: 5 },
  { id: 102, customer: 'Trần Thị B', bank: 'Home Credit', amount: 18000000, status: 'Approved', contact: '0987654321 (Ms. Lan)', daysPending: 2 },
  { id: 103, customer: 'Lê Văn C', bank: 'HD Saison', amount: 45000000, status: 'Bank Delayed', contact: '0912345678 (Mr. Hùng)', daysPending: 12 }
])

const formatCurrency = (val) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}
</script>

<template>
  <div class="p-6 rounded-xl shadow-lg bg-white">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Quản lý Công nợ & Cam kết</h1>
        <p class="text-gray-500 text-sm">Theo dõi số tiền nợ NCC và hồ sơ giải ngân ngân hàng</p>
      </div>
      <Button text="Xuất báo cáo" :icon="IconFileExport" color="secondary" />
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200 mb-6">
      <button 
        @click="activeTab = 'suppliers'"
        :class="['px-6 py-3 text-sm font-medium transition-colors border-b-2', activeTab === 'suppliers' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
      >
        Công nợ Nhà cung cấp
      </button>
      <button 
        @click="activeTab = 'banks'"
        :class="['px-6 py-3 text-sm font-medium transition-colors border-b-2', activeTab === 'banks' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700']"
      >
        Đối tác Ngân hàng (Trả góp)
      </button>
    </div>

    <!-- Supplier Debt Table -->
    <div v-if="activeTab === 'suppliers'" class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
          <tr>
            <th class="p-4 text-left">Nhà cung cấp</th>
            <th class="p-4 text-right">Tổng nhập hàng</th>
            <th class="p-4 text-right">Đã thanh toán</th>
            <th class="p-4 text-right">Còn nợ (Công nợ)</th>
            <th class="p-4 text-center">Hạn thanh toán</th>
            <th class="p-4 text-center">Trạng thái</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="s in supplierDebts" :key="s.id" class="hover:bg-gray-50 transition-colors">
            <td class="p-4 font-medium text-gray-800">{{ s.name }}</td>
            <td class="p-4 text-right">{{ formatCurrency(s.totalPurchased) }}</td>
            <td class="p-4 text-right text-green-600">{{ formatCurrency(s.paid) }}</td>
            <td class="p-4 text-right font-bold" :class="s.balance > 0 ? 'text-red-600' : 'text-gray-400'">
              {{ formatCurrency(s.balance) }}
            </td>
            <td class="p-4 text-center">{{ s.deadline }}</td>
            <td class="p-4 text-center">
              <RoundBadge :color="s.status === 'Cleared' ? 'green' : (s.status === 'Overdue' ? 'red' : 'yellow')">
                {{ s.status === 'Cleared' ? 'Đã đối soát' : (s.status === 'Overdue' ? 'Quá hạn' : 'Đang treo') }}
              </RoundBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bank Installment Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
          <tr>
            <th class="p-4 text-left">Khách hàng</th>
            <th class="p-4 text-left">Ngân hàng</th>
            <th class="p-4 text-right">Số tiền vay</th>
            <th class="p-4 text-center">Thời gian treo</th>
            <th class="p-4 text-left">Đầu mối liên hệ</th>
            <th class="p-4 text-center">Trạng thái</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="b in bankInstallments" :key="b.id" class="hover:bg-gray-50 transition-colors">
            <td class="p-4 font-medium text-gray-800">{{ b.customer }}</td>
            <td class="p-4">{{ b.bank }}</td>
            <td class="p-4 text-right font-medium text-blue-600">{{ formatCurrency(b.amount) }}</td>
            <td class="p-4 text-center">
              <span :class="b.daysPending > 10 ? 'text-red-600 font-bold' : 'text-gray-600'">{{ b.daysPending }} ngày</span>
            </td>
            <td class="p-4 text-gray-500 italic">{{ b.contact }}</td>
            <td class="p-4 text-center">
              <RoundBadge :color="b.status === 'Bank Delayed' ? 'red' : (b.status === 'Approved' ? 'green' : 'yellow')">
                {{ b.status }}
              </RoundBadge>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
        💡 <strong>Mẹo:</strong> Nếu ngân hàng chậm giải ngân (> 7 ngày), Admin nên liên hệ trực tiếp với đầu mối tại mục 7.1 để thúc đẩy hồ sơ.
      </div>
    </div>
  </div>
</template>
