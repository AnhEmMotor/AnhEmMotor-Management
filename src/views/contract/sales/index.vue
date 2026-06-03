<template>
  <div class="contract-sales-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header flex justify-between items-center">
          <span>{{ $t('menus.contract.sales') }}</span>
          <el-button type="primary" @click="goToPreview">
            <el-icon class="mr-1"><View /></el-icon> Xem Demo Hợp Đồng Mẫu
          </el-button>
        </div>
      </template>
      <div>
        <p class="mb-4"
          >Hợp đồng Mua bán Xe (Sales Contract) - Quản lý toàn bộ vòng đời của các hợp đồng mua bán
          xe máy thương mại với khách hàng lẻ.</p
        >

        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="contractNumber" label="Số Hợp Đồng" width="180" />
          <el-table-column prop="customerName" label="Khách Hàng" width="180" />
          <el-table-column prop="vehicle" label="Xe Giao Dịch" />
          <el-table-column prop="status" label="Trạng Thái" width="120">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Thao Tác" width="150" align="center">
            <template #default="scope">
              <el-button link type="primary" @click="goToPreview(scope.row.id)">Chi tiết</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { View } from '@element-plus/icons-vue'

  const { t: $t } = useI18n()
  const router = useRouter()

  const tableData = ref([
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      contractNumber: 'HDMB-20260530-001',
      customerName: 'Trần Thị B',
      vehicle: 'Honda SH 160i ABS 2026',
      status: 'Draft',
    },
  ])

  const getStatusType = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'info'
      case 'Signed':
        return 'success'
      case 'Fulfilled':
        return 'primary'
      default:
        return 'info'
    }
  }

  const goToPreview = (id?: string) => {
    router.push({
      name: 'SalesContractPreview',
      params: { id: id || '123e4567-e89b-12d3-a456-426614174000' },
    })
  }
</script>

<style scoped lang="scss">
  .contract-sales-container {
    padding: 16px;
  }
</style>
