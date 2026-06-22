<template>
  <div class="py-2">
    <div class="mb-6">
      <h2 class="m-0 mb-2 text-xl font-medium">{{ $t("admin.t89") }}</h2>
      <p class="m-0 leading-[1.6] text-g-700">{{ $t("admin.t90") }}</p>
    </div>

    <div class="mb-6">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="font-semibold">
            <span>{{ $t("admin.t91") }}</span>
          </div>
        </template>
        <div>
          <div>
            <div class="flex items-start mb-3 last:mb-0">
              <span class="min-w-30 font-semibold">Tên người dùng：</span>
              <span>{{ currentUser.userName || "ChưaĐăng nhập" }}</span>
            </div>
            <div class="flex items-start mb-3 last:mb-0">
              <span class="min-w-30 font-semibold">VaiTro：</span>
              <ElTag :type="getRoleTagType(currentUser.roles?.[0])">
                {{ getRoleDisplayName(currentUser.roles?.[0]) }}
              </ElTag>
            </div>
            <div class="flex items-start mb-3 last:mb-0">
              <span class="min-w-30 font-semibold">QuyenHanmã：</span>
              <div class="flex flex-wrap gap-2">
                <ElTag
                  v-for="button in currentUser.buttons"
                  :key="button"
                  size="small"
                  type="info"
                >
                  {{ button }}
                </ElTag>
                <span
                  v-if="!currentUser.buttons?.length"
                  class="italic text-g-500"
                  >vôQuyenHanmã</span
                >
              </div>
            </div>
          </div>
        </div>
      </ElCard>
    </div>

    <div class="mb-6">
      <ElCard class="art-card-xs">
        <template #header>
          <div class="font-semibold">
            <span>TaiKhoanChuyển đổi</span>
          </div>
        </template>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
          <div
            v-for="account in accounts"
            :key="account.key"
            class="p-5 border border-g-400 rounded-lg tad-300"
            :class="{
              'bg-theme/12 !border-theme':
                currentUser.userName === account.userName,
            }"
          >
            <div class="mb-4">
              <div>
                <h4 class="m-0 mb-2 text-base font-semibold">
                  {{ account.label }}
                </h4>
                <p class="m-0 mb-2 leading-[1.5] text-g-700">
                  {{ account.description }}
                </p>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-g-600"
                    >Tên người dùng: {{ account.userName }}</span
                  >
                  <span class="text-xs text-g-600"
                    >VaiTro: {{ account.roles.join(", ") }}</span
                  >
                </div>
              </div>
            </div>
            <div class="text-right">
              <ElButton
                v-if="currentUser.userName !== account.userName"
                type="primary"
                @click="switchRole(account)"
                :loading="switching"
              >
                Chuyển đổiđếnnàyVaiTro
              </ElButton>
              <ElTag v-else type="success">khitrướcNguoiDung</ElTag>
            </div>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useUserStore } from "@/application/store/user";
import { useI18n } from "vue-i18n";
import { fetchLogin, fetchGetUserInfo } from "@/infrastructure/api/auth";

defineOptions({ name: "PermissionSwitchRole" });

const { t } = useI18n();
const userStore = useUserStore();

const switching = ref(false);

const currentUser = computed(() => userStore.info);

const accounts = computed(() => [
  {
    key: "super",
    label: t("login.roles.super"),
    userName: "Super",
    password: "123456",
    roles: ["R_SUPER"],
    color: "#E6A23C",
    description:
      "ômcóHeThongnhấtcaoQuyenHan，Có thểlấyTruy cậpnêncócôngnăngmôkhối",
  },
  {
    key: "admin",
    label: t("login.roles.admin"),
    userName: "Admin",
    password: "123456",
    roles: ["R_ADMIN"],
    color: "#409EFF",
    description:
      "ômcóQuản lýQuyenHan，Có thểlấyQuản lýNguoiDungvàbộphầnHeThongCaiDat",
  },
  {
    key: "user",
    label: t("login.roles.user"),
    userName: "User",
    password: "123456",
    roles: ["R_USER"],
    color: "#67C23A",
    description:
      "phổthôngNguoiDungQuyenHan，chỉnăngTruy cậpCơ bảncôngnăngmôkhối",
  },
]);

const getRoleTagType = (
  role?: string,
): "info" | "warning" | "primary" | "success" | "danger" => {
  if (!role) return "info";
  const roleMap: Record<
    string,
    "info" | "warning" | "primary" | "success" | "danger"
  > = {
    R_SUPER: "warning",
    R_ADMIN: "primary",
    R_USER: "success",
  };
  return roleMap[role] || "info";
};

const getRoleDisplayName = (role?: string): string => {
  if (!role) return "ChưabáoVaiTro";
  const roleMap: Record<string, string> = {
    R_SUPER: "siêucấpQuản lýviên",
    R_ADMIN: "Quản lýviên",
    R_USER: "phổthôngNguoiDung",
  };
  return roleMap[role] || "ChưabáoVaiTro";
};

interface AccountInfo {
  userName: string;
  password: string;
  role?: string;
  roles?: string[];
  [key: string]: any;
}

const switchRole = async (account: AccountInfo) => {
  try {
    switching.value = true;

    const { token, refreshToken } = (await fetchLogin({
      userName: account.userName,
      password: account.password,
    } as any)) as any;

    if (!token) {
      throw new Error("Login failed - no token received");
    }

    userStore.setToken(token, refreshToken);
    const userInfo = await fetchGetUserInfo();
    userStore.setUserInfo(userInfo);

    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(
        "Chuyển đổiNguoiDungthânThatBai，Vui lòngchútsautrùngthử",
      );
      console.error("[SwitchRole] Error:", error);
    }
  } finally {
    switching.value = false;
  }
};
</script>
