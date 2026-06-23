<template>
  <ElDialog
    v-model="visible"
    :title="`Cấu hình quyền hạn cho: ${roleData?.name || ''}`"
    width="600px"
    align-center
    class="el-dialog-border animate__animated animate__zoomIn"
    @close="handleClose"
  >
    <div
      v-loading="loadingStructure || loadingCurrent"
      class="permission-tree-container"
    >
      <ElScrollbar height="60vh">
        <ElTree
          ref="treeRef"
          :data="treeData"
          show-checkbox
          node-key="id"
          :default-expand-all="isExpandAll"
          :props="defaultProps"
          @check="handleTreeCheck"
        >
          <template #default="{ data }">
            <div class="custom-tree-node">
              <span class="node-label">{{ data.label }}</span>
              <span v-if="data.description" class="node-description">
                - {{ data.description }}
              </span>
            </div>
          </template>
        </ElTree>
      </ElScrollbar>
    </div>

    <template #footer>
      <div class="dialog-footer flex justify-between items-center w-full">
        <div>
          <ElButton size="small" @click="toggleExpandAll">
            {{ isExpandAll ? "Thu gọn tất cả" : "Mở rộng tất cả" }}
          </ElButton>
          <ElButton size="small" @click="toggleSelectAll">
            {{ isSelectAll ? "Hủy chọn tất cả" : "Chọn tất cả" }}
          </ElButton>
        </div>
        <div>
          <ElButton @click="handleClose">Hủy</ElButton>
          <ElButton type="primary" @click="savePermission" :loading="saving"
            >Lưu thay đổi</ElButton
          >
        </div>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import {
  fetchGetPermissionStructure,
  fetchGetRolePermissions,
  fetchUpdateRole,
} from "@/api/auth";

interface Props {
  modelValue: boolean;
  roleData?: any;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  roleData: undefined,
});

const emit = defineEmits<Emits>();

const treeRef = ref();
const isExpandAll = ref(true);
const isSelectAll = ref(false);
const loadingStructure = ref(false);
const loadingCurrent = ref(false);
const saving = ref(false);

interface TreePermissionNode {
  id: string;
  label: string;
  description?: string;
  children?: TreePermissionNode[];
}

const treeData = ref<TreePermissionNode[]>([]);
const permissionDependencies = ref<Record<string, string[]>>({});
const permissionConflicts = ref<Record<string, string[]>>({});
const lastCheckedKeys = ref<string[]>([]);

const defaultProps = {
  children: "children",
  label: "label",
};

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const loadPermissionStructure = async () => {
  if (treeData.value.length > 0) return;
  loadingStructure.value = true;
  try {
    const res = await fetchGetPermissionStructure();
    permissionDependencies.value = res.dependencies || {};
    permissionConflicts.value = res.conflicts || {};

    const metadataMap = new Map(res.metadata.map((m) => [m.id, m]));

    const nodes: TreePermissionNode[] = Object.entries(res.groups).map(
      ([groupName, permIds]) => {
        const children: TreePermissionNode[] = permIds
          .map((id) => {
            const meta = metadataMap.get(id);
            if (!meta) return null;
            return {
              id: meta.id,
              label: meta.name || meta.id,
              description: meta.description,
            };
          })
          .filter(Boolean) as TreePermissionNode[];

        return {
          id: groupName,
          label: `Nhóm ${groupName}`,
          children,
        };
      },
    );
    treeData.value = nodes;
  } catch (error) {
    console.error("Failed to load permission structure:", error);
    ElMessage.error("Không thể lấy cấu trúc quyền từ backend");
  } finally {
    loadingStructure.value = false;
  }
};

const loadRolePermissions = async () => {
  if (!props.roleData?.id) return;
  loadingCurrent.value = true;
  try {
    const permissions = await fetchGetRolePermissions(props.roleData.id);
    nextTick(() => {
      treeRef.value?.setCheckedKeys(permissions || []);
      lastCheckedKeys.value = treeRef.value?.getCheckedKeys() || [];
      const allKeys = getAllNodeKeys(treeData.value);
      isSelectAll.value =
        (permissions || []).length === allKeys.length && allKeys.length > 0;
    });
  } catch (error) {
    console.error("Failed to load role permissions:", error);
    ElMessage.error("Không thể lấy danh sách quyền của vai trò");
  } finally {
    loadingCurrent.value = false;
  }
};

watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      await loadPermissionStructure();
      await loadRolePermissions();
    }
  },
);

const handleClose = () => {
  visible.value = false;
  treeRef.value?.setCheckedKeys([]);
  lastCheckedKeys.value = [];
};

const savePermission = async () => {
  if (!props.roleData) return;
  saving.value = true;
  try {
    const checkedKeys = (treeRef.value?.getCheckedKeys(true) || []) as string[];

    const realPermissions = checkedKeys.filter((id) => id.includes("."));

    await fetchUpdateRole(props.roleData.id, {
      roleName: props.roleData.name,
      description: props.roleData.description || "",
      permissions: realPermissions,
    });

    ElMessage.success("Cập nhật quyền hạn vai trò thành công!");
    emit("success");
    handleClose();
  } catch (error) {
    console.error("Failed to save permissions:", error);
  } finally {
    saving.value = false;
  }
};

const toggleExpandAll = () => {
  const tree = treeRef.value;
  if (!tree) return;
  const nodes = tree.store.nodesMap;
  Object.values(nodes).forEach((node: any) => {
    node.expanded = !isExpandAll.value;
  });
  isExpandAll.value = !isExpandAll.value;
};

const toggleSelectAll = () => {
  const tree = treeRef.value;
  if (!tree) return;
  if (!isSelectAll.value) {
    const allKeys = getAllNodeKeys(treeData.value);
    tree.setCheckedKeys(allKeys);
    lastCheckedKeys.value = allKeys;
  } else {
    tree.setCheckedKeys([]);
    lastCheckedKeys.value = [];
  }
  isSelectAll.value = !isSelectAll.value;
};

const getAllNodeKeys = (nodes: TreePermissionNode[]): string[] => {
  const keys: string[] = [];
  const traverse = (nodeList: TreePermissionNode[]): void => {
    nodeList.forEach((node) => {
      keys.push(node.id);
      if (node.children?.length) traverse(node.children);
    });
  };
  traverse(nodes);
  return keys;
};

const handleTreeCheck = (data: any, state: any) => {
  let checkedKeys = (state.checkedKeys || []) as string[];
  const prevChecked = lastCheckedKeys.value;

  const newlyChecked = checkedKeys.filter((k) => !prevChecked.includes(k));
  const keysToRemove = new Set<string>();

  if (newlyChecked.length > 0) {
    const keysToAdd = new Set<string>();

    const addDependencies = (key: string) => {
      const deps = permissionDependencies.value[key] || [];
      deps.forEach((dep) => {
        if (!checkedKeys.includes(dep) && !keysToAdd.has(dep)) {
          keysToAdd.add(dep);
          addDependencies(dep);
        }
      });
    };
    newlyChecked.forEach(addDependencies);

    if (keysToAdd.size > 0) {
      checkedKeys = [...checkedKeys, ...Array.from(keysToAdd)];
    }

    const activeChecked = new Set(checkedKeys);
    const allToCheck = [...newlyChecked, ...Array.from(keysToAdd)];

    allToCheck.forEach((key) => {
      const conflicts = permissionConflicts.value[key] || [];
      conflicts.forEach((conflictKey) => {
        if (activeChecked.has(conflictKey) && !keysToRemove.has(conflictKey)) {
          keysToRemove.add(conflictKey);
        }
      });
    });
  }

  const newlyUnchecked = [
    ...prevChecked.filter((k) => !checkedKeys.includes(k)),
    ...Array.from(keysToRemove),
  ];

  if (newlyUnchecked.length > 0) {
    const removeDependents = (key: string) => {
      Object.entries(permissionDependencies.value).forEach(
        ([dependentKey, deps]) => {
          if (
            deps.includes(key) &&
            (checkedKeys.includes(dependentKey) ||
              newlyChecked.includes(dependentKey)) &&
            !keysToRemove.has(dependentKey)
          ) {
            keysToRemove.add(dependentKey);
            removeDependents(dependentKey);
          }
        },
      );
    };
    newlyUnchecked.forEach(removeDependents);
  }

  if (keysToRemove.size > 0) {
    checkedKeys = checkedKeys.filter((k) => !keysToRemove.has(k));
  }

  treeRef.value?.setCheckedKeys(checkedKeys);
  lastCheckedKeys.value = treeRef.value?.getCheckedKeys() || [];

  const allKeys = getAllNodeKeys(treeData.value);
  const currentChecked = treeRef.value?.getCheckedKeys() || [];
  isSelectAll.value =
    currentChecked.length === allKeys.length && allKeys.length > 0;
};
</script>

<style scoped lang="scss">
.permission-tree-container {
  min-height: 200px;
  padding: 10px 0;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 14px;

  .node-label {
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .node-description {
    margin-left: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
