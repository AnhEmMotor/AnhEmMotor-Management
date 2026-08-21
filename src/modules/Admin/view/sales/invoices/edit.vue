<template>
  <div class="resp-page invoice-edit-page pb-5">
    <div class="flex items-center gap-3 mb-4">
      <ElButton :icon="Back" circle @click="goBack" />
      <h2 class="text-xl font-bold">Chỉnh sửa hóa đơn {{ invoice?.invoiceNumber || '' }}</h2>
    </div>

    <ElCard shadow="never" v-loading="loading">
      <ElForm v-if="invoice" :model="form" label-width="160px" label-position="right" class="max-w-5xl mx-auto">
        <ElDivider content-position="left">📋 Thông tin khách hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Họ tên" required>
            <ElInput v-model="form.customerName" />
          </ElFormItem>
          <ElFormItem label="Số điện thoại" required>
            <ElInput v-model="form.customerPhone" />
          </ElFormItem>
          <ElFormItem label="Số CCCD">
            <ElInput v-model="form.customerIdCard" />
          </ElFormItem>
          <ElFormItem label="Địa chỉ">
            <ElInput v-model="form.customerAddress" />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">🏍️ Thông tin xe</ElDivider>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div class="flex flex-col gap-4">
            <ElFormItem label="Hình ảnh xe">
              <el-image
                v-if="form.vehicleImage"
                style="width: 120px; height: 120px; border-radius: 8px"
                :src="form.vehicleImage"
                :preview-src-list="[form.vehicleImage]"
                fit="cover"
              >
                <template #error>
                  <div class="flex items-center justify-center w-full h-full bg-gray-100 text-gray-400">
                    <ArtSvgIcon icon="ri:image-line" />
                  </div>
                </template>
              </el-image>
              <div v-else class="text-gray-400 italic text-sm py-2">Chưa cập nhật</div>
            </ElFormItem>
            <ElFormItem label="Loại xe">
              <ElInput v-model="form.vehicleType" />
            </ElFormItem>
          </div>

          <div class="flex flex-col gap-4">
            <ElFormItem label="Dòng xe" required>
              <ElInput v-model="form.vehicleModel" />
            </ElFormItem>
            <ElFormItem label="Phiên bản">
              <ElInput v-model="form.vehicleVersion" />
            </ElFormItem>
            <ElFormItem label="Màu sơn">
              <ElInput v-model="form.vehicleColor" />
            </ElFormItem>
          </div>

                    <div class="flex flex-col gap-4">
            <ElFormItem label="Số khung" required>
              <ElInput v-model="form.chassisNo" />
            </ElFormItem>
            <ElFormItem label="Số máy" required>
              <ElInput v-model="form.engineNo" />
            </ElFormItem>
          </div>
        </div>

        <ElDivider content-position="left">💰 Chi tiết tài chính</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Giá xe (đã gồm VAT)">
            <ElInputNumber v-model="form.vehiclePrice" :min="0" class="w-full" style="width: 100%" />
          </ElFormItem>
          <ElFormItem label="Phí khấu trừ">
            <ElInputNumber v-model="form.registrationFee" :min="0" class="w-full" style="width: 100%" />
          </ElFormItem>
        </div>

        <ElDivider content-position="left">💳 Thanh toán</ElDivider>
        <div class="grid grid-cols-3 gap-4">
          <ElFormItem label="Phương thức" label-width="100px">
            <ElSelect v-model="form.paymentMethod" class="w-full">
              <ElOption label="Tiền mặt" value="cash" />
              <ElOption label="Chuyển khoản" value="transfer" />
              <ElOption label="Trả góp" value="installment" />
              <ElOption label="Kết hợp" value="mixed" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="Ngân hàng tài trợ" label-width="140px">
            <ElInput v-model="form.bankName" />
          </ElFormItem>
          <ElFormItem label="Trạng thái" label-width="90px">
            <ElSelect v-model="form.status" class="w-full">
              <ElOption label="📝 Chờ thanh toán" value="pending" />
              <ElOption label="✅ Đã hoàn tất" value="completed" />
              <ElOption label="🔄 Đang xử lý" value="processing" />
              <ElOption label="❌ Đã hủy" value="cancelled" />
            </ElSelect>
          </ElFormItem>
        </div>

        <ElDivider content-position="left">👤 Thông tin bán hàng</ElDivider>
        <div class="grid grid-cols-2 gap-4">
          <ElFormItem label="Nhân viên bán hàng">
            <ElInput v-model="form.salesPerson" />
          </ElFormItem>
          <ElFormItem label="Ngày bàn giao dự kiến" label-width="180px">
            <ElDatePicker
              v-model="form.deliveryDate"
              type="date"
              class="w-full"
              value-format="YYYY-MM-DD"
            />
          </ElFormItem>
        </div>

        <div class="flex justify-end gap-3 mt-8">
          <ElButton @click="goBack">Hủy bỏ</ElButton>
          <ElButton type="primary" @click="handleSave" :loading="actionLoading">
            💾 Lưu thay đổi
          </ElButton>
        </div>
      </ElForm>

      <ElEmpty v-else-if="!loading" description="Không tìm thấy hóa đơn" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Back } from '@element-plus/icons-vue';
import { invoiceApi, type AdminInvoiceDetailResponse } from '@/api/sales/invoice.api';
import { VehicleApi } from '@/api/vehicle/vehicle.api';
import { ProductApi } from '@/api/product/product.api';

defineOptions({ name: 'SalesInvoiceEdit' });

const route = useRoute();
const router = useRouter();
const invoiceId = Number(route.params.id);

const loading = ref(false);
const actionLoading = ref(false);
const invoice = ref<AdminInvoiceDetailResponse | null>(null);

const form = reactive({
  customerName: '',
  customerPhone: '',
  customerIdCard: '',
  customerAddress: '',
  vehicleModel: '',
  vehicleVersion: '',
  vehicleColor: '',
  vehicleType: '',
  vehicleImage: '',
  chassisNo: '',
  engineNo: '',
  vehiclePrice: 0,
  registrationFee: 0,
  insuranceFee: 0,
  paymentMethod: 'cash',
  bankName: '',
  status: 'pending',
  salesPerson: '',
  deliveryDate: '',
});

const loadInvoice = async () => {
  if (!invoiceId) return;

    loading.value = true;
  try {
    const res = await invoiceApi.getAdminDetail(invoiceId);
    invoice.value = res;

        form.customerName = res.customerName || '';
    form.customerPhone = res.customerPhone || '';
    form.customerIdCard = res.customerIdCard || '';
    form.customerAddress = res.customerAddress || '';
    form.vehicleModel = res.vehicleModel || '';
    form.vehicleVersion = res.vehicleVersion || '';
    form.vehicleColor = res.vehicleColor || '';
    form.vehicleType = res.vehicleType || '';
    form.vehicleImage = res.vehicleImage || '';

    form.chassisNo = res.chassisNo || '';
    form.engineNo = res.engineNo || '';
    form.vehiclePrice = res.vehiclePrice || 0;
    form.registrationFee = Number(res.registrationFee || 0) + Number(res.insuranceFee || 0);
    form.insuranceFee = 0;
    form.paymentMethod = res.paymentMethod || 'cash';
    form.bankName = res.bankName || '';
    form.status = res.status || 'pending';
    form.salesPerson = res.salesPerson || '';
    form.deliveryDate = res.deliveryDate ? res.deliveryDate.split('T')[0] : '';

    if ((form.chassisNo || form.engineNo) && (!form.vehicleImage || !form.vehicleVersion || !form.vehicleType || !form.vehicleColor)) {
      try {
        let vehicle = null;
        if (form.chassisNo) {
          const list = await VehicleApi.getList({ Filters: `vinNumber==${form.chassisNo}`, current: 1, size: 1 });
          if (list?.items?.length) vehicle = list.items[0];
        }
        if (!vehicle && form.engineNo) {
          const list = await VehicleApi.getList({ Filters: `engineNumber==${form.engineNo}`, current: 1, size: 1 });
          if (list?.items?.length) vehicle = list.items[0];
        }

        if (vehicle) {
          if (!form.vehicleImage) form.vehicleImage = vehicle.imageUrl || '';
          if (!form.vehicleVersion) form.vehicleVersion = vehicle.variantName || '';
          if (!form.vehicleType) form.vehicleType = vehicle.categoryName || '';
          if (!form.vehicleColor) form.vehicleColor = vehicle.colorName || '';
        } else if (form.vehicleModel) {
          const productList = await ProductApi.getList({ Keyword: form.vehicleModel, current: 1, size: 5 });
          const product = productList?.items?.find((p: any) => p.name === form.vehicleModel || p.name.includes(form.vehicleModel));
          if (product) {
            if (!form.vehicleImage) form.vehicleImage = product.cover_image_url || '';
            if (!form.vehicleType) form.vehicleType = product.category || '';
            if (!form.vehicleVersion && product.variants?.length) {
              form.vehicleVersion = product.variants[0].variant_name || '';
            }
          }
        }
      } catch (err) {
        console.error('Failed to auto-fetch vehicle info', err);
      }
    }
  } catch (error) {
    ElMessage.error('Không thể tải dữ liệu hóa đơn');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!form.customerName || !form.customerPhone || !form.vehicleModel || !form.chassisNo || !form.engineNo) {
    ElMessage.warning('Vui lòng điền đầy đủ các trường bắt buộc');
    return;
  }

  actionLoading.value = true;
  try {
    await invoiceApi.updateAdmin(invoiceId, form);
    ElMessage.success('Cập nhật hóa đơn thành công');
    goBack();
  } catch (error) {
    ElMessage.error('Có lỗi xảy ra khi lưu hóa đơn');
  } finally {
    actionLoading.value = false;
  }
};

const goBack = () => {
  router.push('/sales/invoices');
};

onMounted(() => {
  loadInvoice();
});
</script>

<style scoped>
.invoice-edit-page {
  padding: 20px;
}
</style>
