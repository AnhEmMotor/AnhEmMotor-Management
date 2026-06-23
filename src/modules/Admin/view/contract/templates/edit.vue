<template>
  <div class="reporting-page contract-template-editor-page">
    <ReportPageHeader
      :title="
        isEditMode
          ? t('menus.contract.templateEditTitle')
          : t('menus.contract.templateCreateTitle')
      "
      :description="t('menus.contract.templateEditorDescription')"
      icon="ri:file-text-line"
    >
      <template #actions>
        <el-button
          @click="() => fileInput?.click()"
          class="!h-10 !px-5 !rounded-xl !border !border-white/14 !text-white !font-bold !text-[11px] !uppercase !tracking-widest hover:!border-white/30 hover:!bg-white/5 transition-all"
        >
          <ArtSvgIcon icon="ri:folder-upload-line" class="mr-1.5" />
          {{ t("menus.contract.templateImport") }}
        </el-button>
        <input
          type="file"
          ref="fileInput"
          accept=".docx"
          class="hidden"
          @change="handleImportFile"
        />
        <el-button
          @click="handlePreview"
          class="!h-10 !px-5 !rounded-xl !border !border-white/14 !text-white !font-bold !text-[11px] !uppercase !tracking-widest hover:!border-white/30 hover:!bg-white/5 transition-all"
        >
          <ArtSvgIcon icon="ri:eye-line" class="mr-1.5" />
          {{ t("menus.contract.templatePreview") }}
        </el-button>
        <el-button
          @click="handleSave"
          :loading="saving"
          type="primary"
          class="!h-10 !px-6 !rounded-xl !font-bold !text-[11px] !uppercase !tracking-widest !shadow-lg hover:!shadow-xl active:!scale-95 transition-all"
        >
          <ArtSvgIcon icon="ri:save-line" class="mr-1.5" />
          {{ t("menus.contract.templateSave") }}
        </el-button>
      </template>
    </ReportPageHeader>

    <!-- Meta Info Bar -->
    <ElCard class="reporting-card mb-5">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="col-span-3">
          <label
            class="text-[10px] font-black text-white uppercase tracking-widest mb-2 block px-1"
          >
            {{ t("menus.contract.templateName") }}
          </label>
          <el-input
            v-model="form.name"
            :placeholder="t('menus.contract.templateName')"
            class="!rounded-xl"
            size="default"
          />
        </div>
        <div class="col-span-3">
          <label
            class="text-[10px] font-black text-white uppercase tracking-widest mb-2 block px-1"
          >
            {{ t("menus.contract.templateCode") }}
          </label>
          <el-input
            v-model="form.code"
            :placeholder="t('menus.contract.templateCodePlaceholder')"
            class="!rounded-xl"
            size="default"
          />
        </div>
        <div class="col-span-2">
          <label
            class="text-[10px] font-black text-white uppercase tracking-widest mb-2 block px-1"
          >
            {{ t("menus.contract.templateType") }}
          </label>
          <el-select
            v-model="form.type"
            placeholder="Chọn loại..."
            class="!w-full !rounded-xl"
            size="default"
            popper-class="contract-template-select-popper"
          >
            <el-option :label="t('menus.contract.typeSales')" value="Sales" />
            <el-option
              :label="t('menus.contract.typeFinance')"
              value="Finance"
            />
            <el-option
              :label="t('menus.contract.typeSupplier')"
              value="Supplier"
            />
            <el-option
              :label="t('menus.contract.typeAppendix')"
              value="Appendix"
            />
          </el-select>
        </div>
        <div class="col-span-2">
          <label
            class="text-[10px] font-black text-white uppercase tracking-widest mb-2 block px-1"
          >
            {{ t("menus.contract.templateStatus") }}
          </label>
          <el-select
            v-model="form.status"
            class="!w-full !rounded-xl"
            size="default"
            popper-class="contract-template-select-popper"
          >
            <el-option :label="t('menus.contract.statusActive')" :value="1" />
            <el-option :label="t('menus.contract.statusInactive')" :value="2" />
          </el-select>
        </div>
        <div class="col-span-2 flex items-end">
          <div
            v-if="templateData.isUsed"
            class="w-full h-10 px-3 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center gap-2"
          >
            <ArtSvgIcon
              icon="ri:information-line"
              class="text-amber-400 text-base shrink-0"
            />
            <span class="text-[11px] font-bold text-amber-300 truncate">
              {{ t("menus.contract.cannotUpdateUsedTemplate") }}
            </span>
          </div>
          <div
            v-else
            class="w-full h-10 px-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-2"
          >
            <ArtSvgIcon
              icon="ri:checkbox-circle-line"
              class="text-emerald-400 text-base shrink-0"
            />
            <span class="text-[11px] font-bold text-emerald-300 truncate">
              Có thể chỉnh sửa nội dung trực tiếp
            </span>
          </div>
        </div>
      </div>
    </ElCard>

    <!-- Split Screen Editor -->
    <div class="flex flex-col lg:flex-row gap-4 md:gap-6 items-stretch">
      <!-- Left Column: Token Dictionary (30%) -->
      <div
        class="w-full lg:w-[30%] shrink-0 space-y-4 lg:sticky lg:top-[140px] lg:self-start"
      >
        <ElCard class="reporting-card">
          <template #header>
            <div class="flex items-center gap-2">
              <ArtSvgIcon icon="ri:code-box-line" class="text-[#ff6b6b]" />
              <span
                class="text-xs font-black uppercase tracking-widest text-white"
              >
                {{ t("menus.contract.templateDynamicFields") }}
              </span>
            </div>
            <p class="m-0 text-[10px] font-bold text-white mt-1.5">
              {{ t("menus.contract.templateDynamicFieldsHint") }}
            </p>
          </template>

          <el-input
            v-model="tokenSearch"
            :placeholder="t('menus.contract.tokenSearchPlaceholder')"
            clearable
            size="small"
            class="!mb-4"
          >
            <template #prefix>
              <ArtSvgIcon icon="ri:search-line" class="text-white text-xs" />
            </template>
          </el-input>

          <div class="space-y-5">
            <!-- Customer Group -->
            <div>
              <div class="flex items-center gap-2 mb-2.5 px-1">
                <span
                  class="size-5 rounded-md bg-amber-500/15 flex items-center justify-center text-amber-400"
                >
                  <ArtSvgIcon icon="ri:user-line" class="text-xs" />
                </span>
                <span
                  class="text-[10px] font-black text-amber-400 uppercase tracking-wider"
                  >Khách hàng</span
                >
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="token in filteredCustomerTokens"
                  :key="token.key"
                  @click="insertToken(token.key)"
                  class="token-btn token-btn--amber"
                >
                  {{ getTokenLabel(token.key) }}
                </button>
              </div>
            </div>

            <!-- Vehicle Group -->
            <div>
              <div class="flex items-center gap-2 mb-2.5 px-1">
                <span
                  class="size-5 rounded-md bg-emerald-500/15 flex items-center justify-center text-emerald-400"
                >
                  <ArtSvgIcon icon="ri:motorbike-line" class="text-xs" />
                </span>
                <span
                  class="text-[10px] font-black text-emerald-400 uppercase tracking-wider"
                  >Xe máy</span
                >
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="token in filteredVehicleTokens"
                  :key="token.key"
                  @click="insertToken(token.key)"
                  class="token-btn token-btn--emerald"
                >
                  {{ getTokenLabel(token.key) }}
                </button>
              </div>
            </div>

            <!-- Finance Group -->
            <div>
              <div class="flex items-center gap-2 mb-2.5 px-1">
                <span
                  class="size-5 rounded-md bg-violet-500/15 flex items-center justify-center text-violet-400"
                >
                  <ArtSvgIcon
                    icon="ri:money-dollar-circle-line"
                    class="text-xs"
                  />
                </span>
                <span
                  class="text-[10px] font-black text-violet-400 uppercase tracking-wider"
                  >Tài chính</span
                >
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="token in filteredFinanceTokens"
                  :key="token.key"
                  @click="insertToken(token.key)"
                  class="token-btn token-btn--violet"
                >
                  {{ getTokenLabel(token.key) }}
                </button>
              </div>
            </div>

            <!-- Supplier Group -->
            <div>
              <div class="flex items-center gap-2 mb-2.5 px-1">
                <span
                  class="size-5 rounded-md bg-orange-500/15 flex items-center justify-center text-orange-400"
                >
                  <ArtSvgIcon icon="ri:building-4-line" class="text-xs" />
                </span>
                <span
                  class="text-[10px] font-black text-orange-400 uppercase tracking-wider"
                  >Nhà cung cấp / Đối tác</span
                >
              </div>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="token in filteredSupplierTokens"
                  :key="token.key"
                  @click="insertToken(token.key)"
                  class="token-btn token-btn--orange"
                >
                  {{ getTokenLabel(token.key) }}
                </button>
              </div>
            </div>
          </div>
        </ElCard>

        <!-- Syntax Warning Panel -->
        <div
          v-if="syntaxError"
          class="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-5"
        >
          <div class="flex items-start gap-3">
            <ArtSvgIcon
              icon="ri:error-warning-line"
              class="text-red-400 text-xl shrink-0 mt-0.5"
            />
            <div>
              <h4 class="m-0 text-[11px] font-black text-red-400 uppercase">
                Lỗi cú pháp
              </h4>
              <p class="m-0 text-[11px] font-bold text-red-300/80 mt-1">
                {{ syntaxError }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Editor Workspace (70%) -->
      <div
        class="flex-1 min-w-0 flex flex-col lg:sticky lg:top-[140px] lg:self-start"
      >
        <ElCard class="reporting-card editor-card flex flex-col">
          <template #header>
            <div class="flex justify-between items-center">
              <span
                class="text-[10px] font-black text-white uppercase tracking-widest"
              >
                {{ t("menus.contract.templateContent") }}
              </span>
              <span
                v-if="syntaxValid !== null"
                class="flex items-center gap-1.5 text-[10px] font-black"
                :class="syntaxValid ? 'text-emerald-400' : 'text-red-400'"
              >
                <ArtSvgIcon
                  :icon="
                    syntaxValid
                      ? 'ri:checkbox-circle-line'
                      : 'ri:close-circle-line'
                  "
                />
                {{ syntaxValid ? "Cú pháp hợp lệ" : "Có lỗi cú pháp" }}
              </span>
            </div>
          </template>
          <div class="editor-container">
            <ArtWangEditor
              ref="editorRef"
              v-model="editorHtml"
              :height="editorHeight"
              :placeholder="'Nhập nội dung mẫu hợp đồng tại đây... Sử dụng các biến động bên trái để tạo mẫu động.'"
              class="contract-editor"
            />
          </div>
        </ElCard>
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
          <ArtSvgIcon icon="ri:printer-line" class="mr-1.5" />
          In A4
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import ReportPageHeader from "@/modules/Accountant/view/reporting/ReportPageHeader.vue";
import {
  getContractTemplateById,
  createContractTemplate,
  updateContractTemplate,
  validateContractTemplateSyntax,
} from "@/api/contract-template.api";
import { useCommon } from "@/common/composables/useCommon";
import "@/modules/Accountant/logic/reporting.scss";

defineOptions({ name: "ContractTemplateEditor" });

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const isEditMode = computed(() => !!route.params.id);
const saving = ref(false);
const syntaxError = ref("");
const syntaxValid = ref<boolean | null>(null);
const tokenSearch = ref("");
const previewVisible = ref(false);
const previewHtml = ref("");
const editorHtml = ref("");
const editorHeight = ref("100%");
const fileInput = ref<HTMLInputElement | null>(null);
const editorRef = ref<{
  setHtml?: (html: string) => void;
  getHtml?: () => string;
} | null>(null);

const templateData = reactive({
  isUsed: false,
  id: "" as string | undefined,
});

const form = reactive({
  name: "",
  code: "",
  type: "Sales",
  version: 1,
  status: 1 as number,
});

const customerTokens = [
  { key: "{{ContractNumber}}", group: "customer" },
  { key: "{{ContractDateText}}", group: "customer" },
  { key: "{{ContractLocation}}", group: "customer" },
  { key: "{{ShowroomName}}", group: "customer" },
  { key: "{{ShowroomTaxCode}}", group: "customer" },
  { key: "{{ShowroomAddress}}", group: "customer" },
  { key: "{{ShowroomPhone}}", group: "customer" },
  { key: "{{ShowroomRepresentative}}", group: "customer" },
  { key: "{{ShowroomRepresentativeTitle}}", group: "customer" },
  { key: "{{ShowroomRepresentativeIdCard}}", group: "customer" },
  { key: "{{ShowroomRepresentativeIdIssuedDate}}", group: "customer" },
  { key: "{{ShowroomRepresentativeIdIssuedPlace}}", group: "customer" },
  { key: "{{ShowroomFax}}", group: "customer" },
  { key: "{{ShowroomBankAccount}}", group: "customer" },
  { key: "{{ShowroomBankName}}", group: "customer" },
  { key: "{{CustomerName}}", group: "customer" },
  { key: "{{CustomerIdCard}}", group: "customer" },
  { key: "{{CustomerAddress}}", group: "customer" },
  { key: "{{CustomerPhone}}", group: "customer" },
  { key: "{{CustomerEmail}}", group: "customer" },
  { key: "{{CustomerRepresentativeTitle}}", group: "customer" },
  { key: "{{CustomerIdIssuedDate}}", group: "customer" },
  { key: "{{CustomerIdIssuedPlace}}", group: "customer" },
  { key: "{{CustomerFax}}", group: "customer" },
  { key: "{{CustomerBankAccount}}", group: "customer" },
  { key: "{{CustomerBankName}}", group: "customer" },
];

const vehicleTokens = [
  { key: "{{VehicleName}}", group: "vehicle" },
  { key: "{{ChassisNumber}}", group: "vehicle" },
  { key: "{{EngineNumber}}", group: "vehicle" },
  { key: "{{VehiclePrice}}", group: "vehicle" },
  { key: "{{VehiclePriceInWords}}", group: "vehicle" },
  { key: "{{VehicleColor}}", group: "vehicle" },
  { key: "{{LicensePlate}}", group: "vehicle" },
  { key: "{{PaymentDueDate}}", group: "vehicle" },
  { key: "{{PaymentMethod}}", group: "vehicle" },
  { key: "{{DeliveryDate}}", group: "vehicle" },
  { key: "{{DeliveryLocation}}", group: "vehicle" },
  { key: "{{TransportationResponsibleParty}}", group: "vehicle" },
  { key: "{{StorageFeePerDay}}", group: "vehicle" },
  { key: "{{InspectionAgency}}", group: "vehicle" },
  { key: "{{ComplaintDeadlineDays}}", group: "vehicle" },
  { key: "{{SellerResponseDays}}", group: "vehicle" },
  { key: "{{WarrantyProductName}}", group: "vehicle" },
  { key: "{{WarrantyMonths}}", group: "vehicle" },
  { key: "{{PenaltyPercent}}", group: "vehicle" },
  { key: "{{ContractCopies}}", group: "vehicle" },
  { key: "{{EachPartyCopies}}", group: "vehicle" },
];

const financeTokens = [
  { key: "{{DepositAmount}}", group: "finance" },
  { key: "{{RemainingAmount}}", group: "finance" },
  { key: "{{FinancialPartner}}", group: "finance" },
  { key: "{{FinancialPartnerContact}}", group: "finance" },
  { key: "{{FinanceContractNumber}}", group: "finance" },
  { key: "{{LoanAmount}}", group: "finance" },
  { key: "{{TermMonths}}", group: "finance" },
  { key: "{{InterestRate}}", group: "finance" },
  { key: "{{MonthlyPayment}}", group: "finance" },
  { key: "{{ExpectedDisbursementDate}}", group: "finance" },
  { key: "{{ActualDisbursementDate}}", group: "finance" },
  { key: "{{ExpectedDisbursementAmount}}", group: "finance" },
  { key: "{{ActualDisbursementAmount}}", group: "finance" },
  { key: "{{CavetStatus}}", group: "finance" },
  { key: "{{ContractDate}}", group: "finance" },
];

const supplierTokens = [
  { key: "{{SupplierName}}", group: "supplier" },
  { key: "{{SupplierContact}}", group: "supplier" },
  { key: "{{CreditLimit}}", group: "supplier" },
  { key: "{{DiscountPolicy}}", group: "supplier" },
  { key: "{{TargetVolume}}", group: "supplier" },
  { key: "{{EffectiveDate}}", group: "supplier" },
  { key: "{{ExpiryDate}}", group: "supplier" },
  { key: "{{ParentContractNumber}}", group: "supplier" },
  { key: "{{AppendixChangeContent}}", group: "supplier" },
];

const buildA4Template = (
  title: string,
  body: string,
  leftSign = "ĐẠI DIỆN SHOWROOM",
  rightSign = "KHÁCH HÀNG",
) => `
    <table>
      <tbody>
        <tr>
          <td>
            <p><strong>CÔNG TY TNHH ANH EM MOTOR</strong></p>
            <p>Địa chỉ: {{ShowroomAddress}}</p>
            <p>Điện thoại: {{ShowroomPhone}}</p>
          </td>
          <td>
            <p><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
            <p><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
          </td>
        </tr>
      </tbody>
    </table>
      <h1>${title}</h1>
      <p><em>Số: {{ContractNumber}}</em></p>
      ${body}
      <table>
        <tbody>
          <tr>
            <td>
              <p><strong>${leftSign}</strong></p>
              <p>(Ký, ghi rõ họ tên)</p>
            </td>
            <td>
              <p><strong>${rightSign}</strong></p>
              <p>(Ký, ghi rõ họ tên)</p>
            </td>
          </tr>
        </tbody>
      </table>
  `;

const salesGoodsContractTemplate = `
      <h1>HỢP ĐỒNG MUA BÁN HÀNG HÓA</h1>
      <p><em>Số: {{ContractNumber}}</em></p>

      <h2>THÔNG TIN BÊN MUA</h2>
      <p><strong>Họ tên:</strong> {{CustomerName}}</p>
      <p><strong>CCCD:</strong> {{CustomerIdCard}}</p>
      <p><strong>Địa chỉ:</strong> {{CustomerAddress}}</p>

      <h2>THÔNG TIN BÊN BÁN</h2>
      <p><strong>Đơn vị bán:</strong> {{ShowroomName}}</p>
      <p><strong>Địa chỉ:</strong> {{ShowroomAddress}}</p>

      <h2>HÀNG HÓA</h2>
      <p><strong>Tên hàng:</strong> {{VehicleName}}</p>
      <p><strong>Màu xe:</strong> {{VehicleColor}}</p>
      <p><strong>Số khung:</strong> {{ChassisNumber}}</p>
      <p><strong>Số máy:</strong> {{EngineNumber}}</p>
      <p><strong>Giá bán:</strong> {{VehiclePrice}}</p>
      <p><strong>Bằng chữ:</strong> {{VehiclePriceInWords}}</p>

      <h2>THANH TOÁN</h2>
      <p><strong>Tiền cọc:</strong> {{DepositAmount}}</p>
      <p><strong>Còn lại:</strong> {{RemainingAmount}}</p>
      <p><strong>Hình thức:</strong> {{PaymentMethod}}</p>

      <h2>BÀN GIAO</h2>
      <p><strong>Ngày giao:</strong> {{DeliveryDate}}</p>
      <p><strong>Địa điểm:</strong> {{DeliveryLocation}}</p>
      <p><strong>Bảo hành:</strong> {{WarrantyMonths}}</p>

      <h2>XÁC NHẬN</h2>
      <p>Hai bên xác nhận thông tin trên là đúng và đồng ý thực hiện hợp đồng mua bán hàng hóa này.</p>
    `;

const defaultTemplateContents: Record<string, string> = {
  Sales: `
      <table>
        <tbody>
          <tr>
            <td>
              <p><strong>ANH EM MOTOR</strong></p>
            </td>
            <td>
              <p><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
              <p><strong>Độc lập - Tự do - Hạnh phúc</strong></p>
              <p>________________________</p>
            </td>
          </tr>
        </tbody>
      </table>

      <h1>HỢP ĐỒNG MUA BÁN HÀNG HÓA</h1>
      <h2>Số: {{ContractNumber}}</h2>

      <p><em>- Căn cứ Bộ luật Dân sự 2015;</em></p>
      <p><em>- Căn cứ Luật Thương mại 2005 và các văn bản sửa đổi, bổ sung có liên quan;</em></p>
      <p><em>- Căn cứ nhu cầu và khả năng thực tế của các bên.</em></p>

      <p>Hôm nay, ngày {{ContractDateText}}, tại địa chỉ: {{ContractLocation}}</p>
      <p>Chúng tôi, gồm có:</p>

      <h2>BÊN BÁN (BÊN A)</h2>
      <p><strong>Tên doanh nghiệp:</strong> {{ShowroomName}}</p>
      <p><strong>Mã số doanh nghiệp/MST:</strong> {{ShowroomTaxCode}}</p>
      <p><strong>Địa chỉ trụ sở chính:</strong> {{ShowroomAddress}}</p>
      <p><strong>Điện thoại:</strong> {{ShowroomPhone}}</p>
      <p><strong>Người đại diện:</strong> {{ShowroomRepresentative}}</p>

      <h2>BÊN MUA (BÊN B)</h2>
      <p><strong>Họ tên:</strong> {{CustomerName}}</p>
      <p><strong>CCCD/CMND:</strong> {{CustomerIdCard}}</p>
      <p><strong>Địa chỉ:</strong> {{CustomerAddress}}</p>
      <p><strong>Điện thoại:</strong> {{CustomerPhone}}</p>

      <h2>ĐIỀU 1. HÀNG HÓA MUA BÁN</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>Tên xe</strong></td>
            <td>{{VehicleName}}</td>
          </tr>
          <tr>
            <td><strong>Màu xe</strong></td>
            <td>{{VehicleColor}}</td>
          </tr>
          <tr>
            <td><strong>Số khung</strong></td>
            <td>{{ChassisNumber}}</td>
          </tr>
          <tr>
            <td><strong>Số máy</strong></td>
            <td>{{EngineNumber}}</td>
          </tr>
          <tr>
            <td><strong>Biển số</strong></td>
            <td>{{LicensePlate}}</td>
          </tr>
          <tr>
            <td><strong>Giá bán</strong></td>
            <td>{{VehiclePrice}}</td>
          </tr>
        </tbody>
      </table>

      <h2>ĐIỀU 2. THANH TOÁN</h2>
      <p>Bên B đã đặt cọc cho Bên A số tiền: <strong>{{DepositAmount}}</strong>.</p>
      <p>Số tiền còn lại Bên B phải thanh toán trước khi nhận xe là: <strong>{{RemainingAmount}}</strong>.</p>
      <p>Phương thức thanh toán do hai bên thỏa thuận và được ghi nhận trên chứng từ thanh toán hợp lệ.</p>

      <h2>ĐIỀU 3. BÀN GIAO VÀ BẢO HÀNH</h2>
      <p>Bên A bàn giao xe, giấy tờ và phụ kiện kèm theo sau khi Bên B hoàn tất nghĩa vụ thanh toán.</p>
      <p>Chính sách bảo hành được thực hiện theo quy định của hãng và cam kết bán hàng của Anh Em Motor.</p>

      <h2>ĐIỀU 4. CAM KẾT CHUNG</h2>
      <p>Hai bên cam kết thông tin cung cấp là đúng sự thật và tự nguyện ký kết hợp đồng này.</p>
      <p>Hợp đồng được lập thành các bản có giá trị pháp lý như nhau, mỗi bên giữ một bản để thực hiện.</p>

      <table>
        <tbody>
          <tr>
            <td>
              <p><strong>BÊN BÁN (BÊN A)</strong></p>
              <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
            </td>
            <td>
              <p><strong>BÊN MUA (BÊN B)</strong></p>
              <p>(Ký, ghi rõ họ tên)</p>
            </td>
          </tr>
        </tbody>
      </table>
    `,
  Finance: `
      <h1>HỢP ĐỒNG TÀI CHÍNH TRẢ GÓP</h1>
      <p><em>Số: {{FinanceContractNumber}}</em></p>

      <h2>THÔNG TIN KHÁCH HÀNG</h2>
      <p><strong>Họ tên:</strong> {{CustomerName}}</p>
      <p><strong>CCCD:</strong> {{CustomerIdCard}}</p>
      <p><strong>Địa chỉ:</strong> {{CustomerAddress}}</p>

      <h2>THÔNG TIN ĐỐI TÁC TÀI CHÍNH</h2>
      <p><strong>Công ty:</strong> {{FinancialPartner}}</p>
      <p><strong>Liên hệ đầu mối:</strong> {{FinancialPartnerContact}}</p>

      <h2>GÓI VAY TRẢ GÓP</h2>
      <p><strong>Kỳ hạn:</strong> {{TermMonths}} tháng</p>
      <p><strong>Lãi suất:</strong> {{InterestRate}}</p>
      <p><strong>Trả góp/tháng:</strong> {{MonthlyPayment}}</p>

      <h2>GIẢI NGÂN</h2>
      <p><strong>Ngày dự kiến:</strong> {{ExpectedDisbursementDate}}</p>
      <p><strong>Ngày thực tế:</strong> {{ActualDisbursementDate}}</p>
      <p><strong>Tiền dự kiến:</strong> {{ExpectedDisbursementAmount}}</p>
      <p><strong>Tiền thực tế:</strong> {{ActualDisbursementAmount}}</p>

      <h2>CAVET GỐC</h2>
      <p><strong>Trạng thái:</strong> {{CavetStatus}}</p>
    `,
  Supplier: buildA4Template(
    "Hợp đồng nhà cung cấp",
    `
        <h2>I. Thông tin nhà cung cấp</h2>
        <p><strong>Tên nhà cung cấp:</strong> {{SupplierName}}</p>
        <p><strong>Đầu mối liên hệ:</strong> {{SupplierContact}}</p>
        <p><strong>Ngày hiệu lực:</strong> {{EffectiveDate}}</p>
        <p><strong>Ngày hết hạn:</strong> {{ExpiryDate}}</p>

        <h2>II. Điều khoản thương mại</h2>
        <table>
          <tbody>
            <tr>
              <td><strong>Hạn mức tín dụng</strong></td>
              <td>{{CreditLimit}}</td>
            </tr>
            <tr>
              <td><strong>Chính sách chiết khấu</strong></td>
              <td>{{DiscountPolicy}}</td>
            </tr>
            <tr>
              <td><strong>Sản lượng cam kết</strong></td>
              <td>{{TargetVolume}}</td>
            </tr>
          </tbody>
        </table>

        <h2>III. Cam kết thực hiện</h2>
        <p>Hai bên thống nhất thực hiện đúng chính sách giá nhập, công nợ, chiết khấu và sản lượng cam kết trong thời hạn hợp đồng.</p>
        <p>Mọi thay đổi phát sinh phải được lập thành phụ lục hợp đồng và có xác nhận của đại diện hợp pháp hai bên.</p>
      `,
    "ĐẠI DIỆN ANH EM MOTOR",
    "ĐẠI DIỆN NHÀ CUNG CẤP",
  ),
  Appendix: buildA4Template(
    "Phụ lục hợp đồng",
    `
        <p>Phụ lục này là một phần không tách rời của hợp đồng số <strong>{{ParentContractNumber}}</strong>, ký ngày <strong>{{ContractDate}}</strong>.</p>

        <h2>I. Nội dung điều chỉnh</h2>
        <p>Hai bên thống nhất điều chỉnh, bổ sung các nội dung sau:</p>
        <ol>
          <li>{{AppendixChangeContent}}</li>
          <li>Các điều khoản khác của hợp đồng gốc vẫn giữ nguyên hiệu lực.</li>
        </ol>

        <h2>II. Hiệu lực phụ lục</h2>
        <p>Phụ lục có hiệu lực từ ngày <strong>{{EffectiveDate}}</strong> và được lập thành các bản có giá trị pháp lý như nhau.</p>
      `,
    "ĐẠI DIỆN BÊN A",
    "ĐẠI DIỆN BÊN B",
  ),
};

defaultTemplateContents.Sales = salesGoodsContractTemplate;

const normalizeTemplateHtml = (content: string) =>
  content
    .replace(/<p(?:\s[^>]*)?>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/>\s+</g, "><")
    .trim();

const getDefaultTemplateContent = (type: string) =>
  normalizeTemplateHtml(
    defaultTemplateContents[type] || defaultTemplateContents.Sales,
  );

const isDefaultGeneratedContent = (content: string) => {
  const normalizedContent = normalizeTemplateHtml(content);
  return Object.values(defaultTemplateContents).some(
    (template) => normalizeTemplateHtml(template) === normalizedContent,
  );
};

const isA4TemplateContent = (content: string, type = form.type) => {
  if (type === "Sales") {
    return (
      content.includes("HỢP ĐỒNG MUA BÁN HÀNG HÓA") &&
      content.includes("THÔNG TIN BÊN MUA") &&
      content.includes("THÔNG TIN BÊN BÁN") &&
      content.includes("HÀNG HÓA") &&
      content.includes("THANH TOÁN")
    );
  }

  if (type === "Finance") {
    return (
      content.includes("HỢP ĐỒNG TÀI CHÍNH TRẢ GÓP") &&
      content.includes("THÔNG TIN KHÁCH HÀNG") &&
      content.includes("CAVET GỐC")
    );
  }

  return (
    content.includes("<table") &&
    content.includes("CÔNG TY TNHH ANH EM MOTOR") &&
    content.includes("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM")
  );
};

const shouldUseGeneratedA4Template = (content: string) => {
  const normalizedContent = normalizeTemplateHtml(content);
  return (
    !normalizedContent ||
    isDefaultGeneratedContent(normalizedContent) ||
    !isA4TemplateContent(normalizedContent)
  );
};

const syncEditorCanvas = async () => {
  await nextTick();
  editorRef.value?.setHtml?.(editorHtml.value);
};

const applyDefaultTemplateIfNeeded = async () => {
  if (shouldUseGeneratedA4Template(editorHtml.value)) {
    editorHtml.value = getDefaultTemplateContent(form.type);
    syntaxValid.value = null;
    syntaxError.value = "";
    await syncEditorCanvas();
  }
};

const filteredCustomerTokens = computed(() =>
  tokenSearch.value
    ? customerTokens.filter(
        (t) =>
          t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
          getTokenLabel
            .value(t.key)
            .toLowerCase()
            .includes(tokenSearch.value.toLowerCase()),
      )
    : customerTokens,
);

const filteredVehicleTokens = computed(() =>
  tokenSearch.value
    ? vehicleTokens.filter(
        (t) =>
          t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
          getTokenLabel
            .value(t.key)
            .toLowerCase()
            .includes(tokenSearch.value.toLowerCase()),
      )
    : vehicleTokens,
);

const filteredFinanceTokens = computed(() =>
  tokenSearch.value
    ? financeTokens.filter(
        (t) =>
          t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
          getTokenLabel
            .value(t.key)
            .toLowerCase()
            .includes(tokenSearch.value.toLowerCase()),
      )
    : financeTokens,
);

const filteredSupplierTokens = computed(() =>
  tokenSearch.value
    ? supplierTokens.filter(
        (t) =>
          t.key.toLowerCase().includes(tokenSearch.value.toLowerCase()) ||
          getTokenLabel
            .value(t.key)
            .toLowerCase()
            .includes(tokenSearch.value.toLowerCase()),
      )
    : supplierTokens,
);

const handleImportFile = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try {
    let mammoth: any;
    const modName = "mammoth";
    try {
      mammoth = await import(/* @vite-ignore */ modName);
    } catch (_e) {
      ElMessage.warning(
        "Vui lòng cài đặt thư viện mammoth (pnpm add mammoth) để sử dụng tính năng này",
      );
      return;
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    if (result.value) {
      editorHtml.value = normalizeTemplateHtml(result.value);
      await syncEditorCanvas();
      ElMessage.success("Nhập file thành công!");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("Lỗi khi đọc file Word");
  } finally {
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

const validateSyntax = async () => {
  if (!editorHtml.value) {
    syntaxValid.value = null;
    syntaxError.value = "";
    return;
  }
  try {
    // Convert tokens to placeholders before validation
    const contentToValidate = convertTokensToPlaceholders(editorHtml.value);
    const res = await validateContractTemplateSyntax(contentToValidate);
    syntaxValid.value = res.valid;
    syntaxError.value = "";
  } catch (err: any) {
    syntaxValid.value = false;
    syntaxError.value =
      err?.response?.data?.error || t("menus.contract.validateSyntaxError");
  }
};

// Extract token name from key (e.g., '{{CustomerName}}' -> 'CustomerName')
const getTokenName = (key: string): string => {
  return key.replace(/^{{/, "").replace(/}}$/, "");
};

// Get token group from key by searching all token arrays
const getTokenGroup = (key: string): string => {
  const allTokens = [
    ...customerTokens,
    ...vehicleTokens,
    ...financeTokens,
    ...supplierTokens,
  ];
  const token = allTokens.find((t) => t.key === key);
  return token?.group || "customer";
};

// Computed để token label reactive với locale
const getTokenLabel = computed(() => (key: string): string => {
  const tokenName = getTokenName(key);
  const group = getTokenGroup(key);
  const i18nKey = `contract.tokens.${group}.${tokenName}`;
  return t(i18nKey, tokenName);
});

const getEditorRoot = () =>
  document.querySelector(
    ".contract-editor [data-slate-editor]",
  ) as HTMLElement | null;

const insertTokenAtCursor = (tokenKey: string) => {
  const editorRoot = getEditorRoot();
  if (!editorRoot) {
    const label = getTokenLabel.value(tokenKey);
    editorHtml.value += `<span class="contract-token" data-token-key="${tokenKey}" contenteditable="false">${label}</span>`;
    return;
  }

  editorRoot.focus();

  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    if (editorRoot.contains(range.commonAncestorContainer)) {
      range.deleteContents();

      // Tạo span element cho token
      const span = document.createElement("span");
      span.className = "contract-token";
      span.setAttribute("data-token-key", tokenKey);
      span.contentEditable = "false";
      span.textContent = getTokenLabel.value(tokenKey);

      range.insertNode(span);
      range.setStartAfter(span);
      range.setEndAfter(span);
      selection.removeAllRanges();
      selection.addRange(range);
      editorHtml.value = editorRoot.innerHTML;
      editorRoot.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }
  }

  const label = getTokenLabel.value(tokenKey);
  editorHtml.value += `<span class="contract-token" data-token-key="${tokenKey}" contenteditable="false">${label}</span>`;
};

const insertToken = (token: string) => {
  insertTokenAtCursor(token);
  ElMessage.success("Đã chèn biến vào vị trí con trỏ");
  validateSyntax();
};

// Convert các token span thành placeholder {{key}} để backend xử lý
const convertTokensToPlaceholders = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tokens = doc.querySelectorAll("span.contract-token[data-token-key]");
  tokens.forEach((token) => {
    const key = token.getAttribute("data-token-key") || "";
    if (key) {
      const textNode = document.createTextNode(key);
      token.parentNode?.replaceChild(textNode, token);
    }
  });
  return doc.body.innerHTML;
};

const handlePreview = () => {
  // Convert tokens to placeholders before preview
  const htmlWithPlaceholders = convertTokensToPlaceholders(editorHtml.value);
  const normalized = normalizeTemplateHtml(htmlWithPlaceholders);
  previewHtml.value = getPreviewContent(normalized);
  previewVisible.value = true;
};

const getPreviewContent = (content: string) => {
  // Note: Preview uses placeholder tokens since no demo data is available.
  // Unresolved tokens will be highlighted by CSS class.
  const tokenPattern = /\{\{[A-Za-z0-9_]+\}\}/g;
  const html = content.replace(
    tokenPattern,
    (token) => `<span class="contract-unresolved-token">${token}</span>`,
  );

  return `
      <div style="position: relative;">
        <div style="position: absolute; top: 14px; right: 18px; z-index: 2; padding: 4px 10px; border: 1px solid #cbd5e1; border-radius: 999px; color: #64748b; background: #ffffff; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700;">
          Bản xem thử - Cần nhập dữ liệu
        </div>
        ${html}
      </div>
    `;
};

const handlePrint = () => {
  const printWindow = window.open("", "_blank", "width=800,height=600");
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
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }
};

const handleSave = async () => {
  if (!form.name) {
    ElMessage.error("Vui lòng nhập tên mẫu hợp đồng");
    return;
  }
  const normalizedEditorHtml = normalizeTemplateHtml(editorHtml.value);
  if (!normalizedEditorHtml) {
    ElMessage.error(t("menus.contract.emptyContentWarning"));
    return;
  }
  syntaxValid.value = null;
  syntaxError.value = "";
  try {
    await validateSyntax();
    if (syntaxValid.value === false) {
      ElMessage.error(t("menus.contract.validateSyntaxError"));
      return;
    }
  } catch {
    // ignore validation error, proceed with save
  }
  saving.value = true;
  try {
    const payload: any = {
      name: form.name,
      type: form.type,
      code: form.code,
      content: convertTokensToPlaceholders(normalizedEditorHtml),
      dynamicFields: JSON.stringify({
        customer: customerTokens,
        vehicle: vehicleTokens,
        finance: financeTokens,
        supplier: supplierTokens,
      }),
      isActive: form.status === 1,
    };
    if (isEditMode.value && templateData.id) {
      await updateContractTemplate(templateData.id, payload);
    } else {
      await createContractTemplate(payload);
    }
    ElMessage.success(t("menus.contract.saveSuccess"));
    router.push({ name: "ContractTemplates" });
  } catch (err: any) {
    ElMessage.error(
      err?.response?.data?.message || "Không thể lưu mẫu hợp đồng",
    );
  } finally {
    saving.value = false;
  }
};

const loadTemplate = async (id: string) => {
  try {
    const res = await getContractTemplateById(id);
    const data = res;
    form.name = data.name;
    form.type = data.type;
    form.code = data.code;
    form.version = data.version;
    form.status = data.status;
    templateData.isUsed = data.isUsed;
    templateData.id = data.id;
    editorHtml.value = normalizeTemplateHtml(data.content || "");
    await applyDefaultTemplateIfNeeded();
    await syncEditorCanvas();
  } catch {
    ElMessage.error("Không thể tải thông tin mẫu hợp đồng");
  }
};

watch(
  () => form.type,
  async () => {
    if (!isEditMode.value || shouldUseGeneratedA4Template(editorHtml.value)) {
      await applyDefaultTemplateIfNeeded();
    }
  },
);

onMounted(async () => {
  useCommon().scrollToTop();
  if (isEditMode.value) {
    const id = route.params.id as string;
    await loadTemplate(id);
  } else {
    await applyDefaultTemplateIfNeeded();
  }
});
</script>

<style scoped lang="scss">
.contract-template-editor-page {
  color: #f8fafc;

  :deep(.reporting-card.el-card) {
    background: #161618;
    border-color: rgb(255 255 255 / 9%) !important;
  }

  :deep(.reporting-card.el-card > .el-card__header) {
    border-bottom-color: rgb(255 255 255 / 9%);
  }

  :deep(.editor-card.el-card) {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 220px);
    min-height: 600px;

    & > .el-card__body {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 18px;
    }
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    min-height: 38px;
    color: #f8fafc;
    background: #101114 !important;
    border: 1px solid rgb(255 255 255 / 14%);
    box-shadow: none !important;
  }

  :deep(.el-input__inner),
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item),
  :deep(.el-select__caret) {
    color: #f8fafc !important;
  }

  :deep(.el-input__inner::placeholder) {
    color: #f8fafc !important;
    opacity: 1;
  }

  :deep(.el-button:not(.el-button--primary)) {
    color: #f8fafc;
    background: #161618;
    border-color: rgb(255 255 255 / 14%);

    &:hover,
    &:focus {
      color: #fff;
      background: rgb(255 255 255 / 8%);
      border-color: rgb(255 255 255 / 28%);
    }
  }
}

.editor-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  background: #050506;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 14px;

  :deep(.w-e-text-container) {
    min-height: 500px;
  }
}

.contract-editor {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  :deep(.editor-wrapper) {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  :deep(.w-e-text-container) {
    flex: 1 !important;
    height: 100% !important;
    min-height: 0 !important;
  }
}

.a4-preview {
  max-height: 80vh;
  padding: 20px;
  overflow-y: auto;
  background: #525659;
  border-radius: 12px;
}

.a4-page {
  width: 210mm;
  max-width: 100%;
  min-height: 297mm;
  padding: 15mm 16mm;
  margin: 0 auto;
  font-family: "Times New Roman", serif;
  font-size: 14px;
  line-height: 1.35;
  color: #111827;
  background: white;
  border-radius: 2px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
}

.a4-page :deep(*) {
  font-family: "Times New Roman", serif !important;
  color: #111827 !important;
}

.a4-page :deep(h1) {
  margin: 10px 0 4px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0;
}

.a4-page :deep(h2) {
  margin: 10px 0 4px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  text-transform: uppercase;
}

.a4-page :deep(h1 + h2) {
  margin: 0 0 10px;
  font-size: 14px;
  text-align: center;
  text-transform: none;
}

.a4-page :deep(p) {
  margin: 2px 0;
}

.a4-page :deep(h1 + p) {
  margin-bottom: 12px;
  text-align: right;
}

.a4-page :deep(ol),
.a4-page :deep(ul) {
  padding-left: 18px;
  margin: 4px 0 8px;
}

.a4-page :deep(li) {
  margin: 2px 0;
}

.a4-page :deep(table) {
  margin: 6px 0 10px;
}

.a4-page :deep(td),
.a4-page :deep(th) {
  padding: 5px 6px;
}

/* Token button base — premium dark mode */
.token-btn {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 6px 10px;
  font-family: "JetBrains Mono", "Fira Code", Consolas, monospace;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  color: var(--token-color);
  background: var(--token-bg);
  border: 1px solid var(--token-border);
  border-radius: 8px;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:hover {
    color: #fff;
    background: var(--token-hover-bg);
    border-color: var(--token-hover-border);
    box-shadow: 0 0 14px var(--token-shadow);
  }

  &:active {
    transform: scale(0.96);
  }
}

.token-btn--amber {
  --token-color: #fbbf24;
  --token-bg: rgb(245 158 11 / 14%);
  --token-border: rgb(245 158 11 / 38%);
  --token-hover-bg: #d97706;
  --token-hover-border: #fbbf24;
  --token-shadow: rgb(245 158 11 / 42%);
}

.token-btn--emerald {
  --token-color: #34d399;
  --token-bg: rgb(16 185 129 / 14%);
  --token-border: rgb(16 185 129 / 38%);
  --token-hover-bg: #059669;
  --token-hover-border: #34d399;
  --token-shadow: rgb(16 185 129 / 40%);
}

.token-btn--violet {
  --token-color: #c4b5fd;
  --token-bg: rgb(139 92 246 / 14%);
  --token-border: rgb(139 92 246 / 38%);
  --token-hover-bg: #7c3aed;
  --token-hover-border: #c4b5fd;
  --token-shadow: rgb(139 92 246 / 40%);
}

.token-btn--orange {
  --token-color: #fb923c;
  --token-bg: rgb(249 115 22 / 14%);
  --token-border: rgb(249 115 22 / 38%);
  --token-hover-bg: #ea580c;
  --token-hover-border: #fed7aa;
  --token-shadow: rgb(249 115 22 / 40%);
}

:deep(.contract-preview-dialog) {
  overflow: hidden;
  border-radius: 24px;

  .el-dialog__header {
    padding: 20px 24px;
    background: #0a0a0b;
    border-bottom: 1px solid rgb(255 255 255 / 9%);

    .el-dialog__title {
      font-size: 14px;
      font-weight: 900;
      color: #f8fafc;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }

  .el-dialog__body {
    padding: 0;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    background: #0a0a0b;
    border-top: 1px solid rgb(255 255 255 / 9%);
  }
}

// Token style trong editor
.contract-token {
  display: inline-block;
  padding: 2px 8px;
  margin: 0 2px;
  font-size: 0.9em;
  font-weight: 600;
  line-height: 1.4;
  vertical-align: middle;
  color: white;
  white-space: nowrap;
  cursor: default;
  user-select: none;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 6px;

  &:hover {
    opacity: 0.9;
  }
}

@media (width <= 1024px) {
  :deep(.max-w-\[1600px\]) {
    max-width: 100%;
  }
}
</style>

<style lang="scss">
/* Deep overrides for ArtWangEditor to match dark dashboard theme */
.contract-editor {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
  overflow: hidden;
  background: #050506 !important;
  border: 0 !important;
  border-radius: 14px;

  .editor-wrapper {
    display: flex !important;
    flex: 1 !important;
    flex-direction: column !important;
    height: 100% !important;
    overflow: hidden !important;
  }

  .w-e-toolbar {
    background: #15161a !important;
    border-bottom: 1px solid rgb(255 255 255 / 8%) !important;

    .w-e-bar-item {
      color: #f8fafc !important;

      &:hover {
        color: #fff !important;
        background: rgb(255 255 255 / 6%) !important;
      }

      &.w-e-bar-item--active {
        color: #ff6b6b !important;
        background: rgb(232 74 74 / 18%) !important;
      }
    }

    .w-e-bar-divider {
      background: rgb(255 255 255 / 10%) !important;
    }
  }

  .w-e-text-container {
    flex: 1 !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 24px 0;
    overflow: hidden !important;
    color: #f8fafc !important;
    background: #525659 !important;
    border-top: none !important;

    .w-e-scroll {
      height: 100% !important;
      overflow-y: auto !important;
      scrollbar-color: rgb(120 115 150 / 75%) transparent;
      scrollbar-width: thin;
      background: #525659 !important;
    }

    .w-e-scroll::-webkit-scrollbar {
      width: 8px;
    }

    .w-e-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .w-e-scroll::-webkit-scrollbar-thumb {
      background: rgb(120 115 150 / 75%);
      border-radius: 999px;
    }

    [data-slate-editor] {
      box-sizing: border-box;
      width: 794px;
      max-width: calc(100% - 32px) !important;
      min-height: 1123px;
      padding: 36px 48px !important;
      margin: 0 auto !important;
      font-family: "Times New Roman", serif !important;
      font-size: 14px !important;
      line-height: 1.35 !important;
      color: #111827 !important;
      background: #fff !important;
      border-radius: 1px;
      box-shadow: 0 18px 50px rgb(0 0 0 / 45%);
    }

    [data-slate-editor] * {
      font-family: "Times New Roman", serif !important;
      color: #111827 !important;
    }

    [data-slate-editor] .token-jump-flash {
      border-radius: 4px;
      animation: token-jump-flash 1.2s ease-out;
    }

    [data-slate-editor] h1 {
      margin: 10px 0 4px !important;
      font-size: 20px !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      text-align: center !important;
      text-transform: uppercase !important;
      letter-spacing: 0 !important;
    }

    [data-slate-editor] h2 {
      margin: 10px 0 4px !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      line-height: 1.25 !important;
      text-transform: uppercase !important;
    }

    [data-slate-editor] h1 + h2 {
      margin: 0 0 10px !important;
      font-size: 14px !important;
      text-align: center !important;
      text-transform: none !important;
    }

    [data-slate-editor] p {
      margin: 2px 0 !important;
    }

    [data-slate-editor] h1 + p {
      margin-bottom: 12px !important;
      text-align: right !important;
    }

    [data-slate-editor] ol,
    [data-slate-editor] ul {
      padding-left: 18px !important;
      margin: 4px 0 8px !important;
    }

    [data-slate-editor] li {
      margin: 2px 0 !important;
    }

    [data-slate-editor] table {
      width: 100% !important;
      margin: 6px 0 10px !important;
      border-collapse: collapse !important;
    }

    [data-slate-editor] table:first-child {
      margin-bottom: 12px !important;
    }

    [data-slate-editor] table:first-child td {
      width: 50% !important;
      padding: 0 10px 0 0 !important;
      font-size: 13px !important;
      vertical-align: top !important;
      border: 0 !important;
    }

    [data-slate-editor] table:first-child td:last-child {
      padding-right: 0 !important;
      text-align: center !important;
    }

    [data-slate-editor] td,
    [data-slate-editor] th {
      padding: 5px 6px !important;
      vertical-align: top !important;
      border: 1px solid #111827 !important;
    }

    [data-slate-editor] table:last-child {
      margin-top: 24px !important;
    }

    [data-slate-editor] table:last-child td {
      width: 50% !important;
      text-align: center !important;
      border: 0 !important;
    }

    & > div[data-placeholder] {
      color: #f8fafc !important;
    }
  }

  .w-e-panel {
    color: #f8fafc !important;
    background: #1a1a1d !important;
    border-color: rgb(255 255 255 / 10%) !important;

    .w-e-panel-tab-title {
      color: #f8fafc !important;

      &.active {
        color: #ff6b6b !important;
        border-bottom-color: #ff6b6b !important;
      }
    }
  }
}

@keyframes token-jump-flash {
  0%,
  100% {
    background: transparent;
    box-shadow: none;
  }

  20% {
    background: rgb(255 235 59 / 28%);
    box-shadow: 0 0 0 3px rgb(245 158 11 / 22%);
  }
}

.contract-template-select-popper {
  background: #161618 !important;
  border-color: rgb(255 255 255 / 14%) !important;

  .el-select-dropdown__item {
    color: #f8fafc;

    &.is-hovering,
    &:hover {
      color: #fff;
      background-color: rgb(232 74 74 / 14%);
    }

    &.is-selected {
      color: #ff6b6b;
    }
  }

  .el-popper__arrow::before {
    background: #161618 !important;
    border-color: rgb(255 255 255 / 14%) !important;
  }
}
</style>
