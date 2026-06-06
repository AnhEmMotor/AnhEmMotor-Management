<template>
  <div class="finance-contract-detail">
    <el-card shadow="never" class="mb-4">
      <div class="flex items-center w-full">
        <div class="w-3/4 pr-8">
          <div class="text-sm text-gray-500 mb-4 font-medium">Trạng thái vòng đời giải ngân</div>
          
          <div class="relative flex w-full">
            <div class="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 z-0"></div>
            <div 
              class="absolute top-4 left-[12.5%] h-0.5 bg-blue-500 z-0 transition-all duration-300"
              :style="{ width: `${Math.min(Math.max(pipelineActiveStep, 0), 3) * 25}%` }"
            ></div>
            
            <div v-for="(step, index) in ['Đang gửi thẩm định', 'Chờ phê duyệt', 'Chờ giải ngân', 'Đã giải ngân']" :key="index" class="flex-1 flex flex-col items-center relative z-10">
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 bg-white transition-colors duration-300"
                :class="[
                  pipelineActiveStep > index ? 'border-blue-500 text-blue-500' : '',
                  pipelineActiveStep === index ? 'border-blue-500 bg-blue-500 text-white' : '',
                  pipelineActiveStep < index ? 'border-gray-300 text-gray-400' : ''
                ]"
              >
                <el-icon v-if="pipelineActiveStep > index"><Check /></el-icon>
                <span v-else>{{ index + 1 }}</span>
              </div>
              <div 
                class="mt-2 text-center text-sm px-1 w-full break-words" 
                :class="pipelineActiveStep >= index ? 'text-gray-900 font-medium' : 'text-gray-400'"
              >
                {{ step }}
              </div>
            </div>
          </div>
        </div>

        <div class="w-1/4 flex justify-end items-center border-l pl-6 border-gray-100">
          <el-button type="primary" @click="handlePrint" :disabled="!contract.id">
            In hợp đồng
          </el-button>
        </div>
      </div>
    </el-card>

    <div v-if="showDisbursementLateAlert" class="mb-4">
      <el-alert
        type="error"
        :closable="false"
        show-icon
        title="Cảnh báo chậm giải ngân"
        :description="lateAlertDescription"
      />
    </div>

    <div v-if="showCavetStuckAlert" class="mb-4">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="Cảnh báo treo Cavet"
        description="Danh sách các xe quá 7 ngày chưa giao trả Cavet đã tất toán nợ gốc"
      />
    </div>

    <el-row :gutter="20">
      <!-- Left -->
      <el-col :span="10">
        <el-card shadow="never" class="form-card" body-style="height: 650px; overflow-y: auto;">
          <template #header>
            <div class="card-header font-bold">Thông tin Finance Contract</div>
          </template>

          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="Mã hợp đồng tài chính">{{
              contract.contractNumber || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="Sales Order ID">{{
              contract.salesOrderId || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="Khách hàng">{{
              contract.customer360?.fullName || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="Công ty tài chính">{{
              contract.financialPartner?.name || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="Gói tín dụng">
              <div class="text-sm">
                <div>Kỳ hạn: {{ contract.creditPackage?.termMonths ?? '-' }} tháng</div>
                <div>Biên độ lãi: {{ contract.creditPackage?.interestRateRange || '-' }}</div>
                <div
                  >Trả góp/tháng:
                  {{ formatCurrency(contract.creditPackage?.monthlyPaymentAmount ?? 0) }}</div
                >
              </div>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider />

          <!-- Upload evidence -->
          <div class="mb-4">
            <h4 class="mb-2 font-bold">Chứng từ đối soát chuyển khoản giải ngân</h4>
            <p class="text-xs text-gray-500 mb-2"
              >Tải lên ảnh/bản scan ủy nhiệm chi/bill chuyển khoản từ công ty tài chính.</p
            >
            <el-upload
              drag
              :http-request="customUploadRequest"
              :disabled="!canUploadEvidence"
              class="w-full"
            >
              <el-icon class="el-icon--upload">
                <UploadFilled />
              </el-icon>
              <div class="el-upload__text"> Kéo thả file hoặc <em>Bấm vào đây</em> để tải lên </div>
              <template #tip>
                <div class="el-upload__tip">Chỉ hỗ trợ PDF/JPG/PNG (tối đa 10MB)</div>
              </template>
            </el-upload>

            <div
              v-if="contract.evidence?.disbursementTransferProofUrl"
              class="mt-2 text-green-600 text-sm"
            >
              Đã tải lên chứng từ đối soát.
            </div>
          </div>

          <el-divider />

          <!-- Cavet state -->
          <div class="mb-4">
            <h4 class="mb-2 font-bold">Trường quản lý Cavet gốc</h4>
            <el-radio-group v-model="cavetForm.state">
              <el-radio label="FinancialCompanyHolds">Công ty tài chính giữ</el-radio>
              <el-radio label="StoreHoldsOnBehalf">Cửa hàng giữ hộ</el-radio>
              <el-radio label="DeliveredToCustomer">Đã giao khách</el-radio>
            </el-radio-group>

            <div v-if="cavetForm.state === 'StoreHoldsOnBehalf'" class="mt-3">
              <el-date-picker
                v-model="cavetForm.receivedDate"
                type="date"
                placeholder="Ngày nhận"
                class="w-full"
              />
              <el-input
                v-model="cavetForm.receiverName"
                placeholder="Người nhận vật lý"
                class="mt-2"
              />
              <el-input
                v-model="cavetForm.storageLocation"
                placeholder="Vị trí lưu kho tủ hồ sơ"
                class="mt-2"
              />
            </div>
          </div>

          <el-button
            type="primary"
            class="w-full"
            :disabled="!canUpdateCavet"
            @click="handleSaveCavet"
          >
            Lưu trạng thái Cavet
          </el-button>

          <el-divider />

          <!-- Validation card -->
          <div>
            <h4 class="mb-2 font-bold">Đối soát giải ngân (Validation Card)</h4>
            <p class="text-xs text-gray-500 mb-2"
              >Nhập số tiền giải ngân thực tế để hệ thống tự động đối chiếu.</p
            >

            <el-input-number
              v-model="disbursementForm.actualAmount"
              :min="0"
              :step="1000"
              :precision="0"
              class="w-full"
              :class="{ 'is-invalid': !isAmountMatched && disbursementForm.actualAmount != null }"
              placeholder="Số tiền giải ngân thực tế"
            />

            <div class="mt-2 text-sm" :class="isAmountMatched ? 'text-green-600' : 'text-red-600'">
              {{
                isAmountMatched
                  ? 'Khớp lệnh 100% ✓'
                  : 'Lệch tiền đối soát! (bị bôi đỏ nếu sai 1 đồng)'
              }}
            </div>

            <el-date-picker
              v-model="disbursementForm.actualDate"
              type="date"
              placeholder="Ngày giải ngân thực tế"
              class="w-full mt-2"
            />

            <el-button
              type="success"
              class="w-full mt-3"
              :disabled="!canSubmitDisbursementPayment || !disbursementForm.actualAmount"
              @click="handleSubmitDisbursementPayment"
            >
              Xác nhận đã giải ngân
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- Right -->
      <el-col :span="14">
        <el-card shadow="never" body-style="padding: 0; background-color: #f3f4f6; height: 720px;">
          <div class="preview-toolbar p-2 bg-gray-200 border-b">
            <span class="text-sm font-bold text-gray-600"
              >Trình xem trước Finance Contract (A4)</span
            >
          </div>

          <div class="a4-preview-container p-6" style="height: calc(100% - 44px); overflow-y: auto">
            <div
              class="a4-paper bg-white shadow-lg p-8 mx-auto"
              style="width: 210mm; min-height: 297mm; max-width: 100%"
            >
              <h2 class="text-center font-bold text-xl mb-4">HỢP ĐỒNG TÀI CHÍNH TRẢ GÓP</h2>
              <p class="text-right italic mb-6">Số: {{ contract.contractNumber || '-' }}</p>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">THÔNG TIN KHÁCH HÀNG</h3>
                <p><strong>Họ tên:</strong> {{ contract.customer360?.fullName || '-' }}</p>
                <p><strong>CCCD:</strong> {{ contract.customer360?.cccd || '-' }}</p>
                <p><strong>Địa chỉ:</strong> {{ contract.customer360?.address || '-' }}</p>
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">THÔNG TIN ĐỐI TÁC TÀI CHÍNH</h3>
                <p><strong>Công ty:</strong> {{ contract.financialPartner?.name || '-' }}</p>
                <p
                  ><strong>Liên hệ đầu mối:</strong>
                  {{ contract.financialPartner?.contactPhone || '-' }}</p
                >
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">GÓI VAY TRẢ GÓP</h3>
                <p
                  ><strong>Kỳ hạn:</strong> {{ contract.creditPackage?.termMonths ?? '-' }} tháng</p
                >
                <p
                  ><strong>Lãi suất:</strong>
                  {{ contract.creditPackage?.interestRateRange || '-' }}</p
                >
                <p
                  ><strong>Trả góp/tháng:</strong>
                  {{ formatCurrency(contract.creditPackage?.monthlyPaymentAmount ?? 0) }}</p
                >
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">GIẢI NGÂN</h3>
                <p
                  ><strong>Ngày dự kiến:</strong>
                  {{ formatDate(contract.disbursement?.expectedDate) }}</p
                >
                <p
                  ><strong>Ngày thực tế:</strong>
                  {{ formatDate(contract.disbursement?.actualDate) }}</p
                >
                <p
                  ><strong>Tiền dự kiến:</strong>
                  {{ formatCurrency(contract.disbursement?.expectedAmount ?? 0) }}</p
                >
                <p
                  ><strong>Tiền thực tế:</strong>
                  {{ formatCurrency(contract.disbursement?.actualAmount ?? 0) }}</p
                >
              </div>

              <div class="section mb-4">
                <h3 class="font-bold mb-2">CAVET GỐC</h3>
                <p><strong>Trạng thái:</strong> {{ cavetLabel(cavetForm.state) }}</p>
                <p v-if="cavetForm.state === 'StoreHoldsOnBehalf'"
                  ><strong>Ngày nhận:</strong> {{ formatDateShort(cavetForm.receivedDate) }}</p
                >
                <p v-if="cavetForm.state === 'StoreHoldsOnBehalf'"
                  ><strong>Người nhận:</strong> {{ cavetForm.receiverName || '-' }}</p
                >
                <p v-if="cavetForm.state === 'StoreHoldsOnBehalf'"
                  ><strong>Vị trí lưu:</strong> {{ cavetForm.storageLocation || '-' }}</p
                >
              </div>

              <div class="signature-section mt-10 flex justify-between px-10">
                <div class="text-center">
                  <p class="font-bold">ĐẠI DIỆN SHOWROOM</p>
                  <p class="italic text-xs">(Ký, ghi rõ họ tên và đóng dấu)</p>
                </div>
                <div class="text-center">
                  <p class="font-bold">KHÁCH HÀNG</p>
                  <p class="italic text-xs">(Ký, ghi rõ họ tên)</p>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { UploadFilled, Check } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    FinanceContractApi,
    type FinanceContractDetailDto,
    type FinanceContractStatus,
  } from '@/api/finance-contract.api'

  const route = useRoute()

  const contract = ref<FinanceContractDetailDto>({
    id: '',
    salesOrderId: '',
    contractNumber: '',
    status: 'Draft',
  } as any)

  const disbursementForm = reactive<{ actualAmount: number | null; actualDate: string | null }>({
    actualAmount: null,
    actualDate: null,
  })

  const cavetForm = reactive<{
    state: 'FinancialCompanyHolds' | 'StoreHoldsOnBehalf' | 'DeliveredToCustomer'
    receivedDate?: string | null
    receiverName?: string
    storageLocation?: string
  }>({
    state: 'FinancialCompanyHolds',
    receivedDate: null,
    receiverName: '',
    storageLocation: '',
  })

  const contractStatusType = computed(() => {
    const st = contract.value.status as FinanceContractStatus
    if (st === 'Draft') return 'info'
    if (st === 'Approved') return 'success'
    if (st === 'Disbursed') return 'primary'
    if (st === 'Settled') return 'success'
    return 'warning'
  })

  const pipelineActiveStep = computed(() => {
    const st = contract.value.status as FinanceContractStatus
    switch (st) {
      case 'Draft':
      case 'Submitted':
        return 0
      case 'Approved':
        return 1
      case 'PendingDisbursement':
        return 2
      case 'Disbursed':
      case 'Settled':
        return 3
      default:
        return 0
    }
  })

  const expectedAmount = computed(() => contract.value.disbursement?.expectedAmount ?? 0)

  const isAmountMatched = computed(() => {
    if (disbursementForm.actualAmount == null) return true
    return Number(disbursementForm.actualAmount) === Number(expectedAmount.value)
  })

  const canUploadEvidence = computed(() => {
    return contract.value.status === 'Draft' || contract.value.status === 'Approved'
  })

  const canUpdateCavet = computed(() => {
    return contract.value.status === 'Disbursed' || contract.value.status === 'Settled'
  })

  const canSubmitDisbursementPayment = computed(() => {
    return contract.value.status === 'PendingDisbursement' && isAmountMatched.value
  })

  const showDisbursementLateAlert = computed(() => {
    const exp = contract.value.disbursement?.expectedDate
    if (!exp) return false
    if (contract.value.status === 'Disbursed' || contract.value.status === 'Settled') return false
    const now = new Date().getTime()
    const t = new Date(exp).getTime()
    return now > t
  })

  const lateAlertDescription = computed(() => {
    const exp = contract.value.disbursement?.expectedDate
    const phone = contract.value.financialPartner?.contactPhone
    const expText = exp ? formatDate(exp) : ''
    return `Hệ thống phát hiện đã quá hạn dự kiến (${expText}).${phone ? ` SĐT đầu mối: ${phone}` : ''}`
  })

  // Placeholder (Backend sẽ cung cấp danh sách xe treo Cavet ở Dashboard)
  const showCavetStuckAlert = computed(() => false)

  const cavetLabel = (state: string) => {
    switch (state) {
      case 'FinancialCompanyHolds':
        return 'Công ty tài chính giữ'
      case 'StoreHoldsOnBehalf':
        return 'Cửa hàng giữ hộ'
      case 'DeliveredToCustomer':
        return 'Đã giao khách'
      default:
        return state
    }
  }

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'Draft': return 'Bản nháp'
      case 'Submitted': return 'Đã gửi duyệt'
      case 'Approved': return 'Đã duyệt'
      case 'PendingDisbursement': return 'Chờ giải ngân'
      case 'Disbursed': return 'Đã giải ngân'
      case 'Settled': return 'Đã tất toán'
      default: return st
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatDateShort = (dateString?: string | null) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return String(dateString)
    return d.toLocaleDateString('vi-VN')
  }

  const handlePrint = () => {
    window.print()
  }

  const customUploadRequest = async (options: any) => {
    try {
      const id = contract.value.id
      if (!id) return

      const file: File = options.file
      await FinanceContractApi.uploadDisbursementEvidence({ financeContractId: id, file })

      ElMessage.success('Tải lên chứng từ thành công.')
      await fetchDetail()
      options.onSuccess?.({})
    } catch {
      ElMessage.error('Tải lên thất bại.')
    }
  }

  const handleSaveCavet = async () => {
    if (!canUpdateCavet.value) return
    await FinanceContractApi.updateCavetState(contract.value.id, {
      state: cavetForm.state,
      receivedDate: cavetForm.receivedDate || undefined,
      receiverName: cavetForm.receiverName,
      storageLocation: cavetForm.storageLocation,
    })
    ElMessage.success('Đã lưu trạng thái Cavet.')
    await fetchDetail()
  }

  const handleSubmitDisbursementPayment = async () => {
    if (!canSubmitDisbursementPayment.value || disbursementForm.actualAmount == null) return

    await FinanceContractApi.updateDisbursementPayment(
      contract.value.id,
      disbursementForm.actualAmount,
      disbursementForm.actualDate || undefined,
    )

    ElMessage.success('Đã xác nhận giải ngân.')
    await fetchDetail()
  }

  const fetchDetail = async () => {
    const id = (route.params.id as string) || (route.query.id as string)
    if (!id) return
    try {
      const res = await FinanceContractApi.getFinanceContractDetail(id)
      contract.value = res

      if (res.cavet?.state) {
        cavetForm.state = res.cavet.state
        cavetForm.receivedDate = res.cavet.receivedDate || null
        cavetForm.receiverName = res.cavet.receiverName || ''
        cavetForm.storageLocation = res.cavet.storageLocation || ''
      }

      // optional: preload disbursement form
      disbursementForm.actualAmount = res.disbursement?.actualAmount ?? null
      disbursementForm.actualDate = res.disbursement?.actualDate ?? null
    } catch (error: any) {
      // Handle dummy data for demo purposes when API returns 404
      if (['1', '2', '3'].includes(id)) {
        contract.value = {
          id: id,
          salesOrderId: `ORD-20260530-0${id}`,
          contractNumber: id === '1' ? 'HDTC-FE-001' : id === '2' ? 'HDTC-HC-042' : 'HDTC-HD-088',
          status: id === '1' ? 'PendingDisbursement' : id === '2' ? 'Approved' : 'Settled',
          customer360: {
            fullName: id === '1' ? 'Trần Thị B' : id === '2' ? 'Nguyễn Văn A' : 'Lê Văn C',
            cccd: '079123456789',
            address: 'TP.HCM'
          },
          financialPartner: {
            name: id === '1' ? 'FE Credit' : id === '2' ? 'Home Credit' : 'HD Saison',
            contactPhone: '0901234567'
          },
          creditPackage: {
            termMonths: id === '1' ? 24 : id === '2' ? 12 : 6,
            interestRateRange: '1.2% - 1.5%',
            monthlyPaymentAmount: 2500000
          },
          disbursement: {
            expectedDate: id === '1' ? '2026-06-05' : id === '2' ? '2026-06-01' : '2026-04-15',
            expectedAmount: id === '1' ? 45000000 : id === '2' ? 30000000 : 20000000,
          }
        } as any;
        cavetForm.state = id === '1' ? 'FinancialCompanyHolds' : 'StoreHoldsOnBehalf';
      } else {
        throw error;
      }
    }
  }

  onMounted(() => {
    fetchDetail()
  })
</script>

<style scoped lang="scss">
  .finance-contract-detail {
    padding: 16px;
  }

  .is-invalid {
    :deep(.el-input__wrapper) {
      border-color: #f5222d !important;
      box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.1) !important;
    }
  }

  .a4-preview-container {
    height: 600px;
    overflow-y: auto;
  }

  .a4-paper {
    font-family: 'Times New Roman', Times, serif;
    font-size: 14px;
    line-height: 1.5;
    color: #000;
  }

  .section h3 {
    font-size: 15px;
    text-transform: uppercase;
  }

  :deep(.el-step__title) {
    white-space: nowrap;
  }

  :deep(.el-step__description) {
    white-space: nowrap;
  }
</style>
