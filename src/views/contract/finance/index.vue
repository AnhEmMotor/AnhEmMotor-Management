<template>
  <div class="contract-finance-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>{{ $t('menus.contract.finance') }}</span>
        </div>
      </template>

      <div>
        <p>
          Hợp đồng Tài chính Trả góp (Finance Contract) - Quản lý các hợp đồng vay tiêu dùng trả góp
          giữa Khách hàng và các Ngân hàng/Công ty tài chính đối tác.
        </p>

        <div class="mt-4">
          <el-button type="primary" @click="goToDemo"> Xem demo Finance Contract </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'

  const { t: $t } = useI18n()
  const router = useRouter()

  const goToDemo = () => {
    // Trỏ vào trang quản lý detail thông qua route hidden của hệ thống hiện tại.
    // Nếu backend/UI route detail sẽ được mở rộng về sau, chỉ cần chỉnh mapping ở đây.
    router.push({ name: 'FinanceContract', params: {} as any })
  }
</script>

<style scoped lang="scss">
  .contract-finance-container {
    padding: 16px;
  }
</style>
