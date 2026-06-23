<template>
  <div class="user-page art-full-height animate__animated animate__fadeIn">
    <UserSearch
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></UserSearch>

    <ElCard class="art-table-card">
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="showDialog('add')" v-ripple>
              Thêm người dùng mới
            </ElButton>
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

      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="refreshData"
      />

      <UserPasswordDialog
        v-model="passwordDialogVisible"
        :user-data="currentUserData"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ButtonMoreItem } from "@/components/core/forms/art-button-more/index.vue";
import { useTable } from "@/common/composables/useTable";
import {
  fetchGetUserList,
  fetchDeleteUser,
  fetchChangeUserStatus,
  fetchGetRoleList,
} from "@/api/system-manage.api";
import { useQuery } from "@tanstack/vue-query";
import ArtButtonMore from "@/components/core/forms/art-button-more/index.vue";
import UserSearch from "./modules/user-search.vue";
import UserDialog from "./modules/user-dialog.vue";
import UserPasswordDialog from "./modules/user-password-dialog.vue";
import { ElTag, ElMessageBox, ElImage } from "element-plus";
defineOptions({ name: "User" });

const dialogType = ref<"add" | "edit">("add");
const dialogVisible = ref(false);
const passwordDialogVisible = ref(false);
const currentUserData = ref<any>({});

const { data: roleListRes } = useQuery({
  queryKey: ["roles-list-all"],
  queryFn: () => fetchGetRoleList({ Page: 1, PageSize: 100 }),
});

const roleMap = computed(() => {
  const map = new Map<string, string>();
  const records =
    (roleListRes.value as any)?.items || roleListRes.value?.records || [];
  records.forEach((r: any) => {
    if (r.id && r.name) {
      map.set(r.id.toLowerCase(), r.name);
    }
  });
  return map;
});

watch(
  () => roleMap.value,
  (newMap) => {
    if (newMap && newMap.size > 0) {
      resetColumns?.();
    }
  },
  { deep: true, immediate: true },
);

const searchForm = ref({
  userName: undefined,
  fullName: undefined,
  userPhone: undefined,
  userEmail: undefined,
  status: undefined,
  userGender: undefined,
});

const USER_STATUS_CONFIG = {
  Active: { type: "success" as const, text: "Hoạt động" },
  Banned: { type: "danger" as const, text: "Bị khóa" },
} as const;

const getUserStatusConfig = (status: string) => {
  return (
    USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
      type: "info" as const,
      text: status || "Không rõ",
    }
  );
};

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
  resetColumns,
  refreshData,
} = useTable({
  core: {
    apiFn: fetchGetUserList,
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
        prop: "userInfo",
        label: "Người dùng",
        minWidth: 280,
        formatter: (row) => {
          const avatarUrl =
            row.avatarUrl ||
            "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
          return h("div", { class: "flex items-center gap-3 py-1" }, [
            h(ElImage, {
              class: "w-10 h-10 rounded-full border border-gray-200 shadow-sm",
              src: avatarUrl,
              previewSrcList: [avatarUrl],
              previewTeleported: true,
              fit: "cover",
            }),
            h("div", { class: "flex flex-col gap-0.5" }, [
              h(
                "span",
                { class: "font-semibold text-gray-800 text-sm" },
                row.fullName || "Chưa đặt tên",
              ),
              h(
                "span",
                { class: "text-xs text-gray-500" },
                row.email || row.userName,
              ),
            ]),
          ]);
        },
      },
      {
        prop: "userName",
        label: "Tên đăng nhập",
        minWidth: 150,
      },
      {
        prop: "gender",
        label: "Giới tính",
        width: 100,
        formatter: (row) => {
          const genderMap = {
            Male: "Nam",
            Female: "Nữ",
            Other: "Khác",
          };
          return (
            genderMap[row.gender as keyof typeof genderMap] ||
            row.gender ||
            "Chưa rõ"
          );
        },
      },
      {
        prop: "phoneNumber",
        label: "Số điện thoại",
        minWidth: 120,
      },
      {
        prop: "roles",
        label: "Vai trò",
        minWidth: 150,
        formatter: (row) => {
          const roles = row.roles || [];
          if (roles.length === 0) {
            return h(
              "span",
              { class: "text-gray-400 text-xs italic" },
              "Không có",
            );
          }
          return h(
            "div",
            { class: "flex flex-wrap gap-1" },
            roles.map((roleId: string) => {
              const roleName =
                roleMap.value.get(roleId.toLowerCase()) || roleId;
              return h(
                ElTag,
                {
                  size: "small",
                  effect: "light",
                  type: "info",
                  class: "m-0.5",
                },
                () => roleName,
              );
            }),
          );
        },
      },
      {
        prop: "status",
        label: "Trạng thái",
        width: 120,
        formatter: (row) => {
          const statusConfig = getUserStatusConfig(row.status);
          return h(
            ElTag,
            { type: statusConfig.type, effect: "dark" },
            () => statusConfig.text,
          );
        },
      },
      {
        prop: "operation",
        label: "Thao tác",
        width: 80,
        fixed: "right",
        formatter: (row) => {
          const isBanned = row.status === "Banned";
          return h("div", [
            h(ArtButtonMore, {
              list: [
                {
                  key: "edit",
                  label: "Chỉnh sửa",
                  icon: "ri:edit-2-line",
                },
                {
                  key: "change-password",
                  label: "Đổi mật khẩu",
                  icon: "ri:key-line",
                  color: "#409eff",
                },
                {
                  key: "toggle-status",
                  label: isBanned ? "Kích hoạt tài khoản" : "Khóa tài khoản",
                  icon: isBanned ? "ri:lock-unlock-line" : "ri:lock-line",
                  color: isBanned ? "#67c23a" : "#e6a23c",
                },
                {
                  key: "delete",
                  label: "Xóa tài khoản",
                  icon: "ri:delete-bin-4-line",
                  color: "#f56c6c",
                },
              ],
              onClick: (item: ButtonMoreItem) => buttonMoreClick(item, row),
            }),
          ]);
        },
      },
    ],
  },
});

const handleSearch = (params: any) => {
  const filters: string[] = [];
  if (params.userName) {
    filters.push(`UserName@=${params.userName}`);
  }
  if (params.fullName) {
    filters.push(`FullName@=${params.fullName}`);
  }
  if (params.userPhone) {
    filters.push(`PhoneNumber@=${params.userPhone}`);
  }
  if (params.userEmail) {
    filters.push(`Email@=${params.userEmail}`);
  }
  if (params.status) {
    filters.push(`Status==${params.status}`);
  }
  if (params.userGender) {
    filters.push(`Gender==${params.userGender}`);
  }
  replaceSearchParams({
    Filters: filters.join(",") || undefined,
  });
  getData();
};

const buttonMoreClick = (item: ButtonMoreItem, row: any) => {
  switch (item.key) {
    case "edit":
      showDialog("edit", row);
      break;
    case "change-password":
      showPasswordDialog(row);
      break;
    case "toggle-status":
      toggleUserStatus(row);
      break;
    case "delete":
      deleteUser(row);
      break;
  }
};

const showPasswordDialog = (row: any): void => {
  currentUserData.value = row;
  nextTick(() => {
    passwordDialogVisible.value = true;
  });
};

const showDialog = (type: "add" | "edit", row?: any): void => {
  dialogType.value = type;
  currentUserData.value = row || {};
  nextTick(() => {
    dialogVisible.value = true;
  });
};

const toggleUserStatus = (row: any) => {
  const isBanned = row.status === "Banned";
  const newStatus = isBanned ? "Active" : "Banned";
  const actionText = isBanned ? "kích hoạt lại" : "khóa";

  ElMessageBox.confirm(
    `Bạn chắc chắn muốn ${actionText} tài khoản của người dùng "${row.fullName || row.userName}"?`,
    "Xác nhận thay đổi trạng thái",
    {
      confirmButtonText: "Xác định",
      cancelButtonText: "Hủy",
      type: isBanned ? "success" : "warning",
    },
  )
    .then(async () => {
      await fetchChangeUserStatus(row.id, newStatus);
      ElMessage.success(`Đã ${actionText} tài khoản thành công!`);
      refreshData();
    })
    .catch(() => {});
};

const deleteUser = (row: any): void => {
  ElMessageBox.confirm(
    `Bạn chắc chắn muốn xóa người dùng "${row.fullName || row.userName}"? Hành động này không thể khôi phục!`,
    "Xác nhận xóa tài khoản",
    {
      confirmButtonText: "Xác định",
      cancelButtonText: "Hủy",
      type: "error",
    },
  )
    .then(async () => {
      await fetchDeleteUser(row.id);
      ElMessage.success("Xóa tài khoản người dùng thành công!");
      refreshData();
    })
    .catch(() => {});
};
</script>

<style scoped lang="scss">
.user-page {
  :deep(.el-image) {
    img {
      transition: transform 0.3s ease;

      &:hover {
        transform: scale(1.08);
      }
    }
  }
}
</style>
