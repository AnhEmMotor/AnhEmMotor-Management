<template>
  <div class="art-card p-5 h-128 overflow-hidden mb-5 max-sm:mb-4">
    <div class="art-card-header">
      <div class="title">
        <h4>Dashboard Thuế (E-Invoice & VAT)</h4>
        <p>Tổng quan phát hành hóa đơn điện tử</p>
      </div>
      <ElButton type="primary" size="small" plain>Xuất báo cáo (XML)</ElButton>
    </div>

    <ElRow :gutter="20" class="mt-4 mb-6">
      <ElCol :span="12">
        <div class="bg-theme/10 p-4 rounded-lg h-full">
          <p class="text-xs text-g-600 font-medium uppercase">
            Doanh thu chịu thuế
          </p>
          <p class="text-2xl font-medium text-theme mt-2">
            1.250.000.000 <span class="text-sm">đ</span>
          </p>
        </div>
      </ElCol>
      <ElCol :span="12">
        <div class="bg-danger/10 p-4 rounded-lg h-full">
          <p class="text-xs text-g-600 font-medium uppercase">
            VAT Đầu ra phải nộp
          </p>
          <p class="text-2xl font-medium text-danger mt-2">
            125.000.000 <span class="text-sm">đ</span>
          </p>
        </div>
      </ElCol>
    </ElRow>

    <div class="h-[calc(100%-140px)] overflow-hidden">
      <h5 class="text-sm font-medium text-g-800 mb-4">
        Trạng thái Hóa đơn Điện tử
      </h5>

      <div class="space-y-4">
        <div class="flex-cb">
          <div class="flex-c">
            <span class="w-2.5 h-2.5 rounded-full bg-success"></span>
            <span class="text-sm text-g-700 ml-2">Đã phát hành (Issued)</span>
          </div>
          <span class="text-sm font-medium text-g-900">145</span>
        </div>
        <ElProgress
          :percentage="85"
          color="var(--art-success)"
          :show-text="false"
        />

        <div class="flex-cb mt-2">
          <div class="flex-c">
            <span class="w-2.5 h-2.5 rounded-full bg-warning"></span>
            <span class="text-sm text-g-700 ml-2"
              >Đã điều chỉnh (Adjusted)</span
            >
          </div>
          <span class="text-sm font-medium text-g-900">12</span>
        </div>
        <ElProgress
          :percentage="7"
          color="var(--art-warning)"
          :show-text="false"
        />

        <div class="flex-cb mt-2">
          <div class="flex-c">
            <span class="w-2.5 h-2.5 rounded-full bg-info"></span>
            <span class="text-sm text-g-700 ml-2">Đã hủy (Cancelled)</span>
          </div>
          <span class="text-sm font-medium text-g-900">8</span>
        </div>
        <ElProgress
          :percentage="5"
          color="var(--art-info)"
          :show-text="false"
        />

        <div class="flex-cb mt-2">
          <div class="flex-c">
            <span class="w-2.5 h-2.5 rounded-full bg-danger"></span>
            <span class="text-sm text-g-700 ml-2">Lỗi gửi CQT (Error)</span>
          </div>
          <span class="text-sm font-medium text-danger">5</span>
        </div>
        <ElProgress
          :percentage="3"
          color="var(--art-danger)"
          :show-text="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElRow, ElCol, ElProgress, ElButton } from "element-plus";
</script>
