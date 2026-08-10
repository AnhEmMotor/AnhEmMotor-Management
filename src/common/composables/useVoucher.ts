import { ref, computed, type ComputedRef } from 'vue';
import { ElMessage } from 'element-plus';
import { VoucherApi } from '@/api/voucher.api';
import type { VoucherItem, AppliedVoucherInfo } from '@/domain/voucher/voucher.types';

export function useVoucher(
  orderTotal: ComputedRef<number> | (() => number),
  orderId: ComputedRef<number | undefined> | (() => number | undefined),
  isMock: boolean = false
) {
  const getTotal = (): number =>
    typeof orderTotal === 'function'
      ? (orderTotal as () => number)()
      : (orderTotal as ComputedRef<number>).value;
  const getId = () =>
    typeof orderId === 'function' ? orderId() : (orderId as ComputedRef<number | undefined>).value;

  const voucherCode = ref('');
  const appliedVoucher = ref<AppliedVoucherInfo | null>(null);
  const applying = ref(false);
  const removing = ref(false);
  const errorMsg = ref('');

  const discountAmount = computed(() => appliedVoucher.value?.discountAmount ?? 0);
  const finalTotal = computed(() => Math.max(0, getTotal() - discountAmount.value));

  const validateMinSpend = (voucher: VoucherItem): boolean => {
    if (voucher.minOrderValue > 0 && getTotal() < voucher.minOrderValue) {
      return false;
    }
    return true;
  };

  const calculateDiscount = (voucher: VoucherItem): number => {
    if (voucher.discountType === 'PERCENT') {
      let discount = (getTotal() * voucher.discountValue) / 100;
      if (voucher.maxDiscountAmount && discount > voucher.maxDiscountAmount) {
        discount = voucher.maxDiscountAmount;
      }
      return Math.round(discount);
    }
    return Math.round(voucher.discountValue);
  };

  const handleApply = async () => {
    errorMsg.value = '';
    const code = voucherCode.value.trim().toUpperCase();
    if (!code) {
      errorMsg.value = 'Vui lòng nhập mã voucher';
      return;
    }

    applying.value = true;
    try {
      const voucher = await VoucherApi.getByCode(code);
      if (!voucher) {
        errorMsg.value = 'Mã voucher không tồn tại';
        appliedVoucher.value = null;
        return;
      }

      if (!validateMinSpend(voucher)) {
        errorMsg.value = `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ để áp dụng voucher này`;
        appliedVoucher.value = null;
        return;
      }

      const discount = calculateDiscount(voucher);
      const oid = getId();
      if (!oid) {
        errorMsg.value = 'Vui lòng lưu đơn hàng trước khi áp dụng voucher';
        appliedVoucher.value = null;
        return;
      }

      const validated = await VoucherApi.validate(voucher.id, oid);
      if (!validated.isValid) {
        errorMsg.value = validated.message || 'Voucher không hợp lệ';
        appliedVoucher.value = null;
        return;
      }

      const applied = await VoucherApi.apply(voucher.id, oid);

      appliedVoucher.value = {
        orderVoucherId: applied.orderVoucherId,
        voucherId: voucher.id,
        code: voucher.code,
        name: voucher.name,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        discountAmount: discount,
        minOrderValue: voucher.minOrderValue,
      };

      ElMessage.success(`Đã áp dụng voucher ${voucher.code} - Giảm ${discount.toLocaleString()}đ`);
    } catch (err: any) {
      errorMsg.value = err?.message || 'Không thể áp dụng voucher';
      appliedVoucher.value = null;
    } finally {
      applying.value = false;
    }
  };

  const handleRemove = async () => {
    if (!appliedVoucher.value) return;
    removing.value = true;
    try {
      if (!isMock) {
        const res = await VoucherApi.remove(appliedVoucher.value.orderVoucherId);
        ElMessage.success(
          `Đã bỏ voucher ${appliedVoucher.value.code} - Hoàn ${res.refundedAmount.toLocaleString()}đ`
        );
      } else {
        ElMessage.success(`Đã bỏ voucher ${appliedVoucher.value.code}`);
      }
      appliedVoucher.value = null;
    } catch (err: any) {
      ElMessage.error(err?.message || 'Không thể bỏ voucher');
    } finally {
      removing.value = false;
    }
  };

  const reset = () => {
    voucherCode.value = '';
    appliedVoucher.value = null;
    errorMsg.value = '';
  };

  return {
    voucherCode,
    appliedVoucher,
    applying,
    removing,
    errorMsg,
    discountAmount,
    finalTotal,
    handleApply,
    handleRemove,
    reset,
  };
}
