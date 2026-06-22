<template>
  <div class="art-full-height animate__animated animate__fadeIn">
    <RoleSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></RoleSearch>

    <ElCard
      class="art-table-card"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple
              >Thêm vai trò mới</ElButton
            >
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>
    </ElCard>

    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshData"
    />

    <RolePermissionDialog
      v-model="permissionDialog"
      :role-data="currentRoleData"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ButtonMoreItem } from "@/components/core/forms/art-button-more/index.vue";
import { useTable } from "@/hooks/core/useTable";
import {
  fetchGetRoleList,
  fetchDeleteRole,
} from "@/infrastructure/api/system-manage";
import ArtButtonMore from "@/components/core/forms/art-button-more/index.vue";
import RoleSearch from "./modules/role-search.vue";
import RoleEditDialog from "./modules/role-edit-dialog.vue";
import RolePermissionDialog from "./modules/role-permission-dialog.vue";
import { ElMessageBox } from "element-plus";
defineOptions({ name: "Role" });

type RoleSearchFormParams = {
  roleName?: string;
  description?: string;
};

const searchForm = ref<RoleSearchFormParams>({
  roleName: undefined,
  description: undefined,
});

const showSearchBar = ref(false);
const dialogVisible = ref(false);
const permissionDialog = ref(false);
const currentRoleData = ref<any>(undefined);

const {
  columns,
  columnChecks,
  data,
  loading,
  pagination,
  getData,
  replaceSearchParams,
  resetSearchParams,
  handleSizeChange,
  handleCurrentChange,
  refreshData,
} = useTable({
  core: {
    apiFn: fetchGetRoleList,
    paginationKey: {
      current: "Page",
      size: "PageSize",
    },
    apiParams: {
      Page: 1,
      PageSize: 20,
    },
    columnsFactory: () => [
      {
        prop: "name",
        label: "Tên vai trò",
        minWidth: 150,
      },
      {
        prop: "description",
        label: "Mô tả",
        minWidth: 250,
        showOverflowTooltip: true,
      },
      {
        prop: "operation",
        label: "Hành động",
        width: 80,
        fixed: "right",
        formatter: (row) =>
          h("div", [
            h(ArtButtonMore, {
              list: [
                {
                  key: "permission",
                  label: "Phân quyền hạn",
                  icon: "ri:shield-keyhole-line",
                },
                {
                  key: "edit",
                  label: "Chỉnh sửa vai trò",
                  icon: "ri:edit-2-line",
                },
                {
                  key: "delete",
                  label: "Xóa vai trò",
                  icon: "ri:delete-bin-4-line",
                  color: "#f56c6c",
                },
              ],
              onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row),
            }),
          ]),
      },
    ],
  },
});

const dialogType = ref<"add" | "edit">("add");

const showDialog = (type: "add" | "edit", row?: any) => {
  dialogVisible.value = true;
  dialogType.value = type;
  currentRoleData.value = row;
};

const handleSearch = (params: RoleSearchFormParams) => {
  const filters: string[] = [];
  if (params.roleName) {
    filters.push(`Name@=${params.roleName}`);
  }
  if (params.description) {
    filters.push(`Description@=${params.description}`);
  }
  replaceSearchParams({
    Filters: filters.join(",") || undefined,
  });
  getData();
};

const buttonMoreClick = (item: ButtonMoreItem, row: any) => {
  switch (item.key) {
    case "permission":
      showPermissionDialog(row);
      break;
    case "edit":
      showDialog("edit", row);
      break;
    case "delete":
      deleteRole(row);
      break;
  }
};

const showPermissionDialog = (row?: any) => {
  permissionDialog.value = true;
  currentRoleData.value = row;
};

const deleteRole = (row: any) => {
  ElMessageBox.confirm(
    `Bạn chắc chắn muốn xóa vai trò "${row.name}"? Hành động này không thể khôi phục!`,
    "Xác nhận xóa vai trò",
    {
      confirmButtonText: "Xác định",
      cancelButtonText: "Hủy",
      type: "warning",
    },
  )
    .then(async () => {
      await fetchDeleteRole(row.id);
      ElMessage.success("Xóa vai trò thành công");
      refreshData();
    })
    .catch(() => {
      ElMessage.info("Đã hủy thao tác xóa");
    });
};
</script>
