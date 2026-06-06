import fs from 'fs';

const filePath = 'src/views/contract/templates/edit.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Back button UI
content = content.replace(
  `<el-button
          circle
          plain
          @click="goBack"
          class="!w-10 !h-10 !border-slate-200 hover:!border-slate-800"
        >
          <ArtSvgIcon icon="ri:arrow-left-line" class="text-lg" />
        </el-button>`,
  `<el-button
          circle
          plain
          @click="goBack"
          class="!w-10 !h-10 !border-red-200 hover:!border-red-600 mr-2 text-red-500 transition-colors"
        >
          <ArtSvgIcon icon="ri:arrow-left-line" class="text-lg" />
        </el-button>`
);

// 2. Import button & Input File
content = content.replace(
  `<div class="flex items-center gap-3">
        <el-button
          @click="handlePreview"`,
  `<div class="flex items-center gap-3">
        <el-button
          @click="() => fileInput?.click()"
          class="!h-10 !px-5 !rounded-xl !border-2 !border-slate-200 !text-slate-600 !font-black !text-[10px] !uppercase !tracking-widest hover:!border-slate-800 transition-all"
        >
          <ArtSvgIcon icon="ri:folder-upload-line" class="mr-1" />
          Nhập từ File (.docx)
        </el-button>
        <input type="file" ref="fileInput" accept=".docx" class="hidden" @change="handleImportFile" />
        <el-button
          @click="handlePreview"`
);

// 3. Version Label instead of input
content = content.replace(
  `<el-input
              v-model="form.version"
              disabled
              class="!rounded-xl !bg-slate-50"
              size="default"
            >
              <template #suffix>
                <span class="text-[10px] font-black text-slate-400">v{{ form.version }}</span>
              </template>
            </el-input>`,
  `<div class="h-[34px] flex items-center gap-2 mt-1">
              <span class="text-[14px] font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">v{{ form.version }}.0</span>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">Hệ thống sinh</span>
            </div>`
);

// 4. Token list HTML
const newGroupHtml = `
              <!-- Supplier Group -->
              <div>
                <div class="flex items-center gap-2 mb-2 px-1">
                  <span class="size-5 rounded-md bg-orange-100 flex-cc text-orange-600">
                    <ArtSvgIcon icon="ri:building-line" class="text-xs" />
                  </span>
                  <span class="text-[10px] font-black text-orange-700 uppercase tracking-wider"
                    >Nhà cung cấp / Đối tác</span
                  >
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
`;
content = content.replace(
  `</div>
          </div>
        </div>

        <!-- Syntax Warning Panel -->`,
  newGroupHtml + `
        </div>

        <!-- Syntax Warning Panel -->`
);

// 5. Script part - Add ref
content = content.replace(
  `const tokenSearch = ref('')`,
  `const tokenSearch = ref('')\n  const fileInput = ref<HTMLInputElement | null>(null)`
);

// 6. Script part - Supplier Tokens & Method
const supplierTokensCode = `
  const supplierTokens = [
    { key: '{{SupplierName}}', label: 'Tên NCC', group: 'supplier' },
    { key: '{{CreditLimit}}', label: 'Hạn mức tín dụng', group: 'supplier' },
    { key: '{{DiscountPolicy}}', label: 'Chiết khấu', group: 'supplier' },
    { key: '{{TargetVolume}}', label: 'Sản lượng cam kết', group: 'supplier' },
  ]

  const filteredSupplierTokens = computed(() =>
    tokenSearch.value
      ? supplierTokens.filter(
          (t) =>
            t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
            t.label.toLowerCase().includes(tokenSearch.value.toLowerCase()),
        )
      : supplierTokens,
  )

  const handleImportFile = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      ElMessage.info('Chức năng trích xuất nội dung từ file ' + file.name + ' đang được phát triển.');
      // Xóa file input để có thể chọn lại file cũ
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    }
  }
`;

content = content.replace(
  `const filteredFinanceTokens = computed(() =>`,
  supplierTokensCode + `\n  const filteredFinanceTokens = computed(() =>`
);

// Update save dynamicFields
content = content.replace(
  `vehicle: vehicleTokens,
          finance: financeTokens,`,
  `vehicle: vehicleTokens,
          finance: financeTokens,
          supplier: supplierTokens,`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patched edit.vue successfully');
