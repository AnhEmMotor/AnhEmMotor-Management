<template>
  <div class="contract-editor-page min-h-screen bg-[#F8FAFC] font-inter text-[#0F172A] pb-10">
    <!-- Top Toolbar -->
    <div
      class="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-[100] shadow-sm flex justify-between items-center"
    >
      <div class="flex items-center gap-4">
        <el-button
          circle
          plain
          @click="goBack"
          class="!w-10 !h-10 !border-red-200 hover:!border-red-600 !mr-6 text-red-500 transition-colors"
        >
          <ArtSvgIcon icon="ri:arrow-left-line" class="text-lg" />
        </el-button>
        <div class="h-8 w-px bg-slate-200"></div>
        <div class="flex items-center gap-3">
          <div
            class="size-9 rounded-lg flex-cc text-white"
            :class="isEditMode ? 'bg-blue-600' : 'bg-emerald-500'"
          >
            <ArtSvgIcon :icon="isEditMode ? 'ri:edit-2-line' : 'ri:add-line'" class="text-lg" />
          </div>
          <div>
            <el-input
              v-model="form.name"
              :placeholder="t('menus.contract.templateName')"
              class="!w-72 !font-black !text-sm"
              size="default"
            />
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[10px] font-mono font-bold text-slate-400">
                {{ form.code || 'CONTRACT_' + (form.type || 'SALES').toUpperCase() + '_DEFAULT' }}
              </span>
              <el-tag
                v-if="templateData.isUsed"
                type="warning"
                size="small"
                effect="dark"
                class="!text-[9px] !font-black !uppercase"
              >
                Đã sử dụng
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <el-button
          @click="() => fileInput?.click()"
          class="!h-10 !px-5 !rounded-xl !border-2 !border-slate-200 !text-slate-600 !font-black !text-[10px] !uppercase !tracking-widest hover:!border-slate-800 transition-all"
        >
          <ArtSvgIcon icon="ri:folder-upload-line" class="mr-1" />
          Nhập từ File (.docx)
        </el-button>
        <input type="file" ref="fileInput" accept=".docx" class="hidden" @change="handleImportFile" />
        <el-button
          @click="handlePreview"
          class="!h-10 !px-5 !rounded-xl !border-2 !border-slate-200 !text-slate-600 !font-black !text-[10px] !uppercase !tracking-widest hover:!border-slate-800 transition-all"
        >
          <ArtSvgIcon icon="ri:eye-line" class="mr-1" />
          {{ t('menus.contract.templatePreview') }}
        </el-button>
        <el-button
          @click="handleSave"
          :loading="saving"
          type="primary"
          class="!h-10 !px-6 !rounded-xl !font-black !text-[10px] !uppercase !tracking-widest !shadow-xl hover:!shadow-2xl active:!scale-95 transition-all"
        >
          <ArtSvgIcon icon="ri:save-line" class="mr-1" />
          {{ t('menus.contract.templateSave') }}
        </el-button>
      </div>
    </div>

    <!-- Meta Info Bar -->
    <div class="max-w-[1600px] mx-auto px-8 pt-6">
      <div class="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div class="col-span-3">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
            >
              {{ t('menus.contract.templateCode') }}
            </label>
            <el-input
              v-model="form.code"
              placeholder="VD: CONTRACT_SALES_DEFAULT"
              class="!rounded-xl"
              size="default"
            />
          </div>
          <div class="col-span-3">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
            >
              {{ t('menus.contract.templateType') }}
            </label>
            <el-select
              v-model="form.type"
              placeholder="Chọn loại..."
              class="!w-full !rounded-xl"
              size="default"
            >
              <el-option :label="t('menus.contract.typeSales')" value="Sales" />
              <el-option :label="t('menus.contract.typeFinance')" value="Finance" />
              <el-option :label="t('menus.contract.typeSupplier')" value="Supplier" />
              <el-option :label="t('menus.contract.typeAppendix')" value="Appendix" />
            </el-select>
          </div>
          <div class="col-span-2">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
            >
              {{ t('menus.contract.templateVersion') }}
            </label>
            <div class="h-[34px] flex items-center gap-2 mt-1">
              <span class="text-[14px] font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">v{{ form.version }}.0</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">Hệ thống sinh</span>
            </div>
          </div>
          <div class="col-span-2">
            <label
              class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1"
            >
              {{ t('menus.contract.templateStatus') }}
            </label>
            <el-select v-model="form.status" class="!w-full !rounded-xl" size="default">
              <el-option :label="t('menus.contract.statusActive')" :value="1" />
              <el-option :label="t('menus.contract.statusInactive')" :value="2" />
            </el-select>
          </div>
          <div class="col-span-2 flex items-end">
            <div
              v-if="templateData.isUsed"
              class="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:information-line" class="text-amber-500 text-lg" />
              <span class="text-[11px] font-bold text-amber-700 leading-tight">
                Mẫu đã phát sinh<br />hợp đồng thực tế
              </span>
            </div>
            <div
              v-else
              class="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:checkbox-circle-line" class="text-emerald-500 text-lg" />
              <span class="text-[11px] font-bold text-emerald-700 leading-tight">
                Có thể chỉnh sửa<br />nội dung trực tiếp
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Split Screen Editor -->
    <div
      class="max-w-[1600px] mx-auto px-4 md:px-8 pt-4 md:pt-6 flex flex-col lg:flex-row gap-4 md:gap-6 items-start"
    >
      <!-- Left Column: Token Dictionary (30%) -->
      <div class="w-[30%] shrink-0 space-y-4 sticky top-[140px]">
        <div class="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100">
            <h3
              class="m-0 text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2"
            >
              <ArtSvgIcon icon="ri:code-box-line" class="text-blue-500" />
              {{ t('menus.contract.templateDynamicFields') }}
            </h3>
            <p class="m-0 text-[10px] font-bold text-slate-400 mt-1">
              Click để chèn vào vị trí con trỏ
            </p>
          </div>

          <div class="p-4">
            <el-input
              v-model="tokenSearch"
              :placeholder="'Tìm biến...'"
              clearable
              size="small"
              class="!mb-4"
            >
              <template #prefix>
                <ArtSvgIcon icon="ri:search-line" class="text-slate-400 text-xs" />
              </template>
            </el-input>

            <div class="space-y-4">
              <!-- Customer Group -->
              <div>
                <div class="flex items-center gap-2 mb-2 px-1">
                  <span class="size-5 rounded-md bg-blue-100 flex-cc text-blue-600">
                    <ArtSvgIcon icon="ri:user-line" class="text-xs" />
                  </span>
                  <span class="text-[10px] font-black text-blue-700 uppercase tracking-wider">Khách hàng</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="token in filteredCustomerTokens"
                    :key="token.key"
                    @click="insertToken(token.key)"
                    class="px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95"
                  >
                    {{ token.key }}
                  </button>
                </div>
              </div>

              <!-- Vehicle Group -->
              <div>
                <div class="flex items-center gap-2 mb-2 px-1">
                  <span class="size-5 rounded-md bg-emerald-100 flex-cc text-emerald-600">
                    <ArtSvgIcon icon="ri:motorbike-line" class="text-xs" />
                  </span>
                  <span class="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Xe máy</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="token in filteredVehicleTokens"
                    :key="token.key"
                    @click="insertToken(token.key)"
                    class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95"
                  >
                    {{ token.key }}
                  </button>
                </div>
              </div>

              <!-- Finance Group -->
              <div>
                <div class="flex items-center gap-2 mb-2 px-1">
                  <span class="size-5 rounded-md bg-violet-100 flex-cc text-violet-600">
                    <ArtSvgIcon icon="ri:money-dollar-circle-line" class="text-xs" />
                  </span>
                  <span class="text-[10px] font-black text-violet-700 uppercase tracking-wider">Tài chính</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="token in filteredFinanceTokens"
                    :key="token.key"
                    @click="insertToken(token.key)"
                    class="px-3 py-1.5 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white border border-violet-200 hover:border-violet-600 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95"
                  >
                    {{ token.key }}
                  </button>
                </div>
              </div>

              <!-- Supplier Group -->
              <div>
                <div class="flex items-center gap-2 mb-2 px-1">
                  <span class="size-5 rounded-md bg-orange-100 flex-cc text-orange-600">
                    <ArtSvgIcon icon="ri:building-4-line" class="text-xs" />
                  </span>
                  <span class="text-[10px] font-black text-orange-700 uppercase tracking-wider">Nhà cung cấp / Đối tác</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="token in filteredSupplierTokens"
                    :key="token.key"
                    @click="insertToken(token.key)"
                    class="px-3 py-1.5 bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white border border-orange-200 hover:border-orange-600 rounded-lg text-[11px] font-mono font-bold transition-all active:scale-95"
                  >
                    {{ token.key }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Syntax Warning Panel -->
        <div
          v-if="syntaxError"
          class="bg-red-50 border-2 border-red-200 rounded-[20px] p-5 animate-pulse"
        >
          <div class="flex items-start gap-3">
            <ArtSvgIcon icon="ri:error-warning-line" class="text-red-500 text-xl shrink-0 mt-0.5" />
            <div>
              <h4 class="m-0 text-[11px] font-black text-red-700 uppercase">Lỗi cú pháp</h4>
              <p class="m-0 text-[11px] font-bold text-red-600 mt-1">{{ syntaxError }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Editor Workspace (70%) -->
      <div class="flex-1 min-w-0">
        <div
          class="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden min-h-[700px] flex flex-col"
        >
          <div
            class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"
          >
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {{ t('menus.contract.templateContent') }}
            </span>
            <div class="flex items-center gap-2">
              <span
                v-if="syntaxValid !== null"
                class="flex items-center gap-1.5 text-[10px] font-black"
              >
                <ArtSvgIcon
                  :icon="syntaxValid ? 'ri:checkbox-circle-line' : 'ri:close-circle-line'"
                  :class="syntaxValid ? 'text-emerald-500' : 'text-red-500'"
                />
                {{ syntaxValid ? 'Cú pháp hợp lệ' : 'Có lỗi cú pháp' }}
              </span>
            </div>
          </div>
          <div class="flex-1 editor-container">
            <ArtWangEditor
              v-model="editorHtml"
              :height="editorHeight"
              :placeholder="'Nhập nội dung mẫu hợp đồng tại đây... Sử dụng các biến động bên trái để tạo mẫu động.'"
              class="contract-editor"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Dialog -->
    <el-dialog
      v-model="previewVisible"
      :title="t('menus.contract.templatePreview')"
      width="90vw"
      top="5vh"
      destroy-on-close
      custom-class="contract-preview-dialog"
    >
      <div class="a4-preview">
        <div class="a4-page" v-html="previewHtml"></div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">Đóng</el-button>
        <el-button type="primary" @click="handlePrint">
          <ArtSvgIcon icon="ri:printer-line" class="mr-1" />
          In A4
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import {
    getContractTemplateById,
    createContractTemplate,
    updateContractTemplate,
    validateContractTemplateSyntax,
  } from '@/api/contract-template.api'
  import { useCommon } from '@/hooks/core/useCommon'

  defineOptions({ name: 'ContractTemplateEditor' })

  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  const isEditMode = computed(() => !!route.params.id)
  const saving = ref(false)
  const syntaxError = ref('')
  const syntaxValid = ref<boolean | null>(null)
  const tokenSearch = ref('')
  const previewVisible = ref(false)
  const previewHtml = ref('')
  const editorHtml = ref('')
  const editorHeight = ref('600px')
  const fileInput = ref<HTMLInputElement | null>(null)
  const templateData = reactive({
    isUsed: false,
    id: '' as string | undefined,
  })

  const form = reactive({
    name: '',
    code: '',
    type: 'Sales',
    version: 1,
    status: 1 as number,
  })

  const customerTokens = [
    { key: '{{CustomerName}}', label: 'Tên khách hàng', group: 'customer' },
    { key: '{{CustomerIdCard}}', label: 'Số CCCD', group: 'customer' },
    { key: '{{CustomerAddress}}', label: 'Địa chỉ', group: 'customer' },
    { key: '{{CustomerPhone}}', label: 'Số điện thoại', group: 'customer' },
    { key: '{{CustomerEmail}}', label: 'Email', group: 'customer' },
  ]

  const vehicleTokens = [
    { key: '{{VehicleName}}', label: 'Tên xe', group: 'vehicle' },
    { key: '{{ChassisNumber}}', label: 'Số khung', group: 'vehicle' },
    { key: '{{EngineNumber}}', label: 'Số máy', group: 'vehicle' },
    { key: '{{VehiclePrice}}', label: 'Đơn giá', group: 'vehicle' },
    { key: '{{VehicleColor}}', label: 'Màu xe', group: 'vehicle' },
    { key: '{{LicensePlate}}', label: 'Biển số', group: 'vehicle' },
  ]

  const financeTokens = [
    { key: '{{DepositAmount}}', label: 'Tiền cọc', group: 'finance' },
    { key: '{{RemainingAmount}}', label: 'Tiền còn lại', group: 'finance' },
    { key: '{{LoanAmount}}', label: 'Số tiền vay', group: 'finance' },
    { key: '{{MonthlyPayment}}', label: 'Trả góp/tháng', group: 'finance' },
    { key: '{{ContractDate}}', label: 'Ngày ký', group: 'finance' },
  ]

  const supplierTokens = [
    { key: '{{SupplierName}}', label: 'Tên NCC', group: 'supplier' },
    { key: '{{CreditLimit}}', label: 'Hạn mức tín dụng', group: 'supplier' },
    { key: '{{DiscountPolicy}}', label: 'Chính sách chiết khấu', group: 'supplier' },
    { key: '{{TargetVolume}}', label: 'Sản lượng cam kết', group: 'supplier' },
  ]

  const filteredCustomerTokens = computed(() =>
    tokenSearch.value
      ? customerTokens.filter(
          (t) =>
            t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
            t.label.toLowerCase().includes(tokenSearch.value.toLowerCase()),
        )
      : customerTokens,
  )

  const filteredVehicleTokens = computed(() =>
    tokenSearch.value
      ? vehicleTokens.filter(
          (t) =>
            t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
            t.label.toLowerCase().includes(tokenSearch.value.toLowerCase()),
        )
      : vehicleTokens,
  )

  const filteredFinanceTokens = computed(() =>
    tokenSearch.value
      ? financeTokens.filter(
          (t) =>
            t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
            t.label.toLowerCase().includes(tokenSearch.value.toLowerCase()),
        )
      : financeTokens,
  )

  const filteredSupplierTokens = computed(() =>
    tokenSearch.value
      ? supplierTokens.filter(
          (t) =>
            t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
            t.label.toLowerCase().includes(tokenSearch.value.toLowerCase()),
        )
      : supplierTokens,
  )

  const handleImportFile = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    try {
      let mammoth: any
      try {
            // @vite-ignore
            mammoth = await import('mammoth')
      } catch (e) {
        ElMessage.warning('Vui lòng cài đặt thư viện mammoth (pnpm add mammoth) để sử dụng tính năng này')
        return
      }
      
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      
      if (result.value) {
        editorHtml.value = result.value
        ElMessage.success('Nhập file thành công!')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('Lỗi khi đọc file Word')
    } finally {
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
  }

  const validateSyntax = async () => {
    if (!editorHtml.value) {
      syntaxValid.value = null
      syntaxError.value = ''
      return
    }
    try {
      const res = await validateContractTemplateSyntax(editorHtml.value)
      syntaxValid.value = res.data.valid
      syntaxError.value = ''
    } catch (err: any) {
      syntaxValid.value = false
      syntaxError.value = err?.response?.data?.error || t('menus.contract.validateSyntaxError')
    }
  }

  const insertToken = (token: string) => {
    const editorEl = document.querySelector('.contract-editor .w-e-text-container') as HTMLElement
    if (editorEl) {
      editorEl.focus()
    }

    // Access WangEditor via exposed ref
    const artWangEditor = document.querySelector('.contract-editor')
    const editorInstance = (artWangEditor as any)?.__vueParentComponent?.ctx?.$refs?.artWangEditor

    // WangEditor exposes insertHtml method - use DOM Range API as fallback
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      const span = document.createElement('span')
      span.textContent = token
      span.style.cssText =
        'background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:4px;font-weight:bold;border:1px dashed #f59e0b;'
      range.insertNode(span)
      range.setStartAfter(span)
      range.setEndAfter(span)
      selection.removeAllRanges()
      selection.addRange(range)

      // Sync back to editor model
      const editorContent = (artWangEditor as any)?.__vueParentComponent?.ctx?.editorHtml
      if (editorContent !== undefined) {
        // The v-model will sync automatically on next tick
      }
    } else {
      // Append to end if no selection
      editorHtml.value += token
    }

    validateSyntax()
  }

  const goBack = () => {
    router.push({ name: 'ContractTemplates' })
  }

  const handlePreview = () => {
    const sampleData = (previewHtml.value = getPreviewContent(editorHtml.value))
    previewVisible.value = true
  }

  const getPreviewContent = (content: string) => {
    const previewData: Record<string, string> = {
      '{{CustomerName}}': 'Nguyễn Văn A',
      '{{CustomerIdCard}}': '079123456789',
      '{{CustomerAddress}}': '123 Đồng Khởi, P. Tân Biên, TP. Biên Hòa, Đồng Nai',
      '{{CustomerPhone}}': '0912 345 678',
      '{{CustomerEmail}}': 'nguyenvana@email.com',
      '{{VehicleName}}': 'Honda Winner X V3 2024',
      '{{ChassisNumber}}': 'VNX-2024-00001',
      '{{EngineNumber}}': 'ENG-2024-00001',
      '{{VehiclePrice}}': '46.990.000đ',
      '{{VehicleColor}}': 'Đen mờ',
      '{{LicensePlate}}': '60K1-12345',
      '{{DepositAmount}}': '5.000.000đ',
      '{{RemainingAmount}}': '41.990.000đ',
      '{{LoanAmount}}': '30.000.000đ',
      '{{MonthlyPayment}}': '2.500.000đ',
      '{{ContractDate}}': new Date().toLocaleDateString('vi-VN'),
    }

    let html = content
    for (const [key, value] of Object.entries(previewData)) {
      html = html.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value)
    }

    return `
    <div style="font-family: 'Times New Roman', serif; color: #000; max-width: 210mm; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px;">
        <h2 style="margin: 0; font-size: 18pt; font-weight: bold; text-transform: uppercase;">
          HỢP ĐỒNG MUA BÁN XE MÁY
        </h2>
        <p style="margin: 8px 0 0; font-size: 10pt; color: #555;">(Bản xem thử - Dữ liệu giả định)</p>
      </div>
      ${html}
      <div style="margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; border-top: 1px solid #ccc; padding-top: 20px;">
        <div>
          <p style="font-weight: bold; margin: 0 0 30px;">ĐẠI LÝ ANH EM MOTOR</p>
          <p style="margin: 5px 0; border-bottom: 1px solid #999; height: 20px;"></p>
          <p style="margin: 5px 0; border-bottom: 1px solid #999; height: 20px;"></p>
          <p style="font-size: 9pt; margin: 5px 0;">(Ký, ghi rõ họ tên, đóng dấu)</p>
        </div>
        <div>
          <p style="font-weight: bold; margin: 0 0 30px;">BÊN MUA (BÊN B)</p>
          <p style="margin: 5px 0; border-bottom: 1px solid #999; height: 20px;"></p>
          <p style="margin: 5px 0; border-bottom: 1px solid #999; height: 20px;"></p>
          <p style="font-size: 9pt; margin: 5px 0;">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>
    </div>
  `
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(`
      <html>
      <head><title>Xem trước Hợp đồng - A4</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Times New Roman', serif; }
      </style>
      </head>
      <body>${previewHtml.value}</body>
      </html>
    `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const handleSave = async () => {
    if (!form.name) {
      ElMessage.error('Vui lòng nhập tên mẫu hợp đồng')
      return
    }
    if (!editorHtml.value) {
      ElMessage.error(t('menus.contract.emptyContentWarning'))
      return
    }

    syntaxValid.value = null
    syntaxError.value = ''
    try {
      await validateSyntax()
      if (syntaxValid.value === false) {
        ElMessage.error(t('menus.contract.validateSyntaxError'))
        return
      }
    } catch {
      // ignore validation error, proceed with save
    }

    saving.value = true
    try {
      const payload: any = {
        name: form.name,
        type: form.type,
        code: form.code,
        content: editorHtml.value,
        dynamicFields: JSON.stringify({
          customer: customerTokens,
          vehicle: vehicleTokens,
          finance: financeTokens,
          supplier: supplierTokens,
        }),
        isActive: form.status === 1,
      }

      if (isEditMode.value && templateData.id) {
        await updateContractTemplate(templateData.id, payload)
      } else {
        await createContractTemplate(payload)
      }

      ElMessage.success(t('menus.contract.saveSuccess'))
      router.push({ name: 'ContractTemplates' })
    } catch (err: any) {
      ElMessage.error(err?.response?.data?.message || 'Không thể lưu mẫu hợp đồng')
    } finally {
      saving.value = false
    }
  }

  const loadTemplate = async (id: string) => {
    try {
      const res = await getContractTemplateById(id)
      const data = res.data
      form.name = data.name
      form.type = data.type
      form.code = data.code
      form.version = data.version
      form.status = data.status
      templateData.isUsed = data.isUsed
      templateData.id = data.id
      editorHtml.value = data.content || ''
    } catch {
      ElMessage.error('Không thể tải thông tin mẫu hợp đồng')
    }
  }

  onMounted(async () => {
    useCommon().scrollToTop()
    if (isEditMode.value) {
      const id = route.params.id as string
      await loadTemplate(id)
    }
  })
</script>

<style scoped lang="scss">
  .editor-container {
    :deep(.w-e-text-container) {
      min-height: 500px;
    }
  }

  .a4-preview {
    max-height: 80vh;
    overflow-y: auto;
    background: #525659;
    padding: 20px;
    border-radius: 12px;
  }

  .a4-page {
    background: white;
    max-width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border-radius: 2px;
  }

  :deep(.contract-preview-dialog) {
    border-radius: 24px;
    overflow: hidden;

    .el-dialog__header {
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
      background: #f8fafc;

      .el-dialog__title {
        font-weight: 900;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
    }

    .el-dialog__body {
      padding: 0;
    }

    .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid #f1f5f9;
      background: #f8fafc;
    }
  }

  @media (max-width: 1024px) {
    .contract-editor-page {
      :deep(.max-w-\[1600px\]) {
        max-width: 100%;
      }
    }
  }
</style>
