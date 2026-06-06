<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? 'Thêm vai trò mới' : 'Chỉnh sửa vai trò'"
    :width="dialogType === 'add' ? '520px' : '400px'"
    align-center
    @close="handleClose"
  >
    <div v-loading="dialogType === 'add' ? loadingStructure : false">
      <ElForm ref="formRef" :model="form" :rules="rules" label-position="left" label-width="100px">
        <ElFormItem label="Tên vai trò" prop="name">
          <ElInput v-model="form.name" placeholder="Ví dụ: Admin, Staff,..." />
        </ElFormItem>
        <ElFormItem label="Mô tả" prop="description">
          <ElInput
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="Mô tả tóm tắt trách nhiệm của vai trò..."
          />
        </ElFormItem>

        <!-- Permissions Section: Only visible in Add Mode -->
        <div v-if="dialogType === 'add'" class="mt-6 pt-4 border-t border-gray-100">
          <div class="flex justify-between items-center mb-3">
            <div class="section-title mb-0">Quyền hạn gán cho vai trò</div>
            <div>
              <ElButton size="small" link @click="toggleExpandAll">
                {{ isExpandAll ? 'Thu gọn' : 'Mở rộng' }}
              </ElButton>
              <ElButton size="small" link @click="toggleSelectAll">
                {{ isSelectAll ? 'Hủy chọn' : 'Chọn tất cả' }}
              </ElButton>
            </div>
          </div>
          <div class="permission-tree-wrapper">
            <ElScrollbar height="260px">
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
        </div>
      </ElForm>
    </div>
    <template #footer>
      <ElButton @click="handleClose">Hủy</ElButton>
      <ElButton type="primary" @click="handleSubmit" :loading="submitting">Lưu</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    fetchCreateRole,
    fetchUpdateRole,
    fetchGetRolePermissions,
    fetchGetPermissionStructure,
  } from '@/api/system-manage'

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: any
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined,
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const treeRef = ref()
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const loadingStructure = ref(false)

  interface TreePermissionNode {
    id: string
    label: string
    description?: string
    children?: TreePermissionNode[]
  }

  const treeData = ref<TreePermissionNode[]>([])
  const permissionDependencies = ref<Record<string, string[]>>({})
  const permissionConflicts = ref<Record<string, string[]>>({})
  const lastCheckedKeys = ref<string[]>([])

  const defaultProps = {
    children: 'children',
    label: 'label',
  }

  const visible = computed({
    get: () => props.modelValue,
    set: (value: boolean) => emit('update:modelValue', value),
  })

  const rules = reactive<FormRules>({
    name: [
      { required: true, message: 'Vui lòng nhập tên vai trò', trigger: 'blur' },
      { min: 2, max: 50, message: 'Độ dài từ 2 đến 50 ký tự', trigger: 'blur' },
    ],
  })

  const form = reactive({
    id: '',
    name: '',
    description: '',
  })

  // Load permission structure from Backend
  const loadPermissionStructure = async () => {
    if (treeData.value.length > 0) return
    loadingStructure.value = true
    try {
      const res = await fetchGetPermissionStructure()
      permissionDependencies.value = res.dependencies || {}
      permissionConflicts.value = res.conflicts || {}

      const metadataMap = new Map(res.metadata.map((m) => [m.id, m]))

      const nodes: TreePermissionNode[] = Object.entries(res.groups).map(([groupName, permIds]) => {
        const children: TreePermissionNode[] = permIds
          .map((id) => {
            const meta = metadataMap.get(id)
            if (!meta) return null
            return {
              id: meta.id,
              label: meta.name || meta.id,
              description: meta.description,
            }
          })
          .filter(Boolean) as TreePermissionNode[]

        return {
          id: groupName,
          label: `Nhóm ${groupName}`,
          children,
        }
      })
      treeData.value = nodes
    } catch (error) {
      console.error('Failed to load permission structure:', error)
      ElMessage.error('Không thể lấy cấu trúc quyền từ backend')
    } finally {
      loadingStructure.value = false
    }
  }

  watch(
    () => props.modelValue,
    async (newVal: boolean) => {
      if (newVal) {
        initForm()
        if (props.dialogType === 'add') {
          await loadPermissionStructure()
          nextTick(() => {
            treeRef.value?.setCheckedKeys([])
            lastCheckedKeys.value = []
            isSelectAll.value = false
          })
        }
      }
    },
  )

  const initForm = () => {
    if (props.dialogType === 'edit' && props.roleData) {
      form.id = props.roleData.id || ''
      form.name = props.roleData.name || ''
      form.description = props.roleData.description || ''
    } else {
      form.id = ''
      form.name = ''
      form.description = ''
    }
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
    lastCheckedKeys.value = []
  }

  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return
    const nodes = tree.store.nodesMap
    Object.values(nodes).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })
    isExpandAll.value = !isExpandAll.value
  }

  const toggleSelectAll = () => {
    const tree = treeRef.value
    if (!tree) return
    if (!isSelectAll.value) {
      const allKeys = getAllNodeKeys(treeData.value)
      tree.setCheckedKeys(allKeys)
      lastCheckedKeys.value = allKeys
    } else {
      tree.setCheckedKeys([])
      lastCheckedKeys.value = []
    }
    isSelectAll.value = !isSelectAll.value
  }

  const getAllNodeKeys = (nodes: TreePermissionNode[]): string[] => {
    const keys: string[] = []
    const traverse = (nodeList: TreePermissionNode[]): void => {
      nodeList.forEach((node) => {
        keys.push(node.id)
        if (node.children?.length) traverse(node.children)
      })
    }
    traverse(nodes)
    return keys
  }

  const handleTreeCheck = (data: any, state: any) => {
    let checkedKeys = (state.checkedKeys || []) as string[]
    const prevChecked = lastCheckedKeys.value

    // 1. Identify newly checked keys
    const newlyChecked = checkedKeys.filter((k) => !prevChecked.includes(k))
    const keysToRemove = new Set<string>()

    if (newlyChecked.length > 0) {
      const keysToAdd = new Set<string>()

      // Helper to recursively add dependencies
      const addDependencies = (key: string) => {
        const deps = permissionDependencies.value[key] || []
        deps.forEach((dep: string) => {
          if (!checkedKeys.includes(dep) && !keysToAdd.has(dep)) {
            keysToAdd.add(dep)
            addDependencies(dep) // Recursively add dependencies
          }
        })
      }
      newlyChecked.forEach(addDependencies)

      // If we added dependencies, include them in our current working checkedKeys
      if (keysToAdd.size > 0) {
        checkedKeys = [...checkedKeys, ...Array.from(keysToAdd)]
      }

      // --- CONFLICT RESOLUTION ---
      // For any newly checked or newly added dependency keys, check if they conflict with other keys
      const activeChecked = new Set(checkedKeys)
      const allToCheck = [...newlyChecked, ...Array.from(keysToAdd)]

      allToCheck.forEach((key) => {
        const conflicts = permissionConflicts.value[key] || []
        conflicts.forEach((conflictKey: string) => {
          if (activeChecked.has(conflictKey) && !keysToRemove.has(conflictKey)) {
            keysToRemove.add(conflictKey)
          }
        })
      })
    }

    // 2. Identify newly unchecked keys (plus any keys marked for removal due to conflicts!)
    const newlyUnchecked = [
      ...prevChecked.filter((k: string) => !checkedKeys.includes(k)),
      ...Array.from(keysToRemove),
    ]

    if (newlyUnchecked.length > 0) {
      const removeDependents = (key: string) => {
        // Find all keys that depend on 'key'
        ;(Object.entries(permissionDependencies.value) as [string, string[]][]).forEach(
          ([dependentKey, deps]) => {
            if (
              deps.includes(key) &&
              (checkedKeys.includes(dependentKey) || newlyChecked.includes(dependentKey)) &&
              !keysToRemove.has(dependentKey)
            ) {
              keysToRemove.add(dependentKey)
              removeDependents(dependentKey) // Recursively remove dependents
            }
          },
        )
      }
      newlyUnchecked.forEach(removeDependents)
    }

    if (keysToRemove.size > 0) {
      checkedKeys = checkedKeys.filter((k) => !keysToRemove.has(k))
    }

    // Update tree checked state and local state
    treeRef.value?.setCheckedKeys(checkedKeys)
    lastCheckedKeys.value = treeRef.value?.getCheckedKeys() || []

    // Recalculate select all state
    const allKeys = getAllNodeKeys(treeData.value)
    const currentChecked = treeRef.value?.getCheckedKeys() || []
    isSelectAll.value = currentChecked.length === allKeys.length && allKeys.length > 0
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      submitting.value = true

      if (props.dialogType === 'add') {
        // Get all checked leaf nodes (which are the actual permission IDs)
        const checkedKeys = (treeRef.value?.getCheckedKeys(true) || []) as string[]
        const realPermissions = checkedKeys.filter((id) => id.includes('.'))

        await fetchCreateRole({
          roleName: form.name,
          description: form.description,
          permissions: realPermissions,
        })
        ElMessage.success('Thêm mới vai trò thành công!')
      } else {
        // Fetch current permissions first to ensure we do not overwrite them with empty list
        let currentPermissions: string[] = []
        try {
          currentPermissions = await fetchGetRolePermissions(form.id)
        } catch (err) {
          console.warn('Failed to retrieve current permissions of role:', err)
        }

        await fetchUpdateRole(form.id, {
          roleName: form.name,
          description: form.description,
          permissions: currentPermissions || [],
        })
        ElMessage.success('Cập nhật thông tin vai trò thành công!')
      }

      emit('success')
      handleClose()
    } catch (error: any) {
      console.error('Form submit failed:', error)
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .permission-tree-wrapper {
    padding: 10px;
    background-color: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    font-size: 13px;

    .node-label {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .node-description {
      margin-left: 6px;
      font-size: 11px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
