<template>
  <div class="user-page art-full-height">
    <ElCard class="art-table-card" style="margin-top: 0">
      <ArtTable
        rowKey="id"
        :show-table-header="false"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { useTable } from "@/hooks/core/useTable";
import { fetchGetUserList } from "@/api/system-manage.api";

defineOptions({ name: "UserMixedUsageExample" });

const {
  data,
  columns,
  loading,
  pagination,
  handleSizeChange,
  handleCurrentChange,
} = useTable({
  core: {
    apiFn: fetchGetUserList as any,
    apiParams: {
      current: 1,
      size: 20,
      userName: "",
      userPhone: "",
      userEmail: "",
    },
    columnsFactory: () => [
      {
        prop: "id",
        label: "ID",
      },
      {
        prop: "nickName",
        label: "Biệt danh",
      },
      {
        prop: "userGender",
        label: "GioiTinh",
        sortable: true,
        formatter: (row: any) => row.userGender || "Chưabáo",
      },
      {
        prop: "userPhone",
        label: "Số điện thoại",
      },
      {
        prop: "userEmail",
        label: "Email",
      },
    ],
  },
});
</script>
