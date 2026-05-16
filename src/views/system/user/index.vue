<template>
  <div class="user-page art-full-height">
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>{{ $t('admin.t143') }}</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox, ElImage } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  const selectedRows = ref<UserListItem[]>([])

  const searchForm = ref({
    userName: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: '1'
  })

  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: 'tạiđường' },
    '2': { type: 'info' as const, text: 'Ngoạiđường' },
    '3': { type: 'warning' as const, text: 'Bất thường' },
    '4': { type: 'danger' as const, text: 'tâmtác' }
  } as const

  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: 'Chưabáo'
      }
    )
  }

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
    refreshData
  } = useTable({
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },

      columnsFactory: () => [
        { type: 'selection' }, // mócvịcột
        { type: 'index', width: 60, label: 'thứsố' }, // thứsố
        {
          prop: 'userInfo',
          label: 'Tên người dùng',
          width: 280,

          formatter: (row) => {
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: row.avatar,
                previewSrcList: [row.avatar],

                previewTeleported: true
              }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.userName),
                h('p', { class: 'email' }, row.userEmail)
              ])
            ])
          }
        },
        {
          prop: 'userGender',
          label: 'GioiTinh',
          sortable: true,
          formatter: (row) => row.userGender
        },
        { prop: 'userPhone', label: 'Số điện thoại' },
        {
          prop: 'status',
          label: 'Trạng thái',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: 'xâyNgày',
          sortable: true
        },
        {
          prop: 'operation',
          label: 'HanhDong',
          width: 120,
          fixed: 'right', // cốđịnhcột
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    },

    transform: {
      dataTransformer: (records) => {
        if (!Array.isArray(records)) {
          console.warn('Dữ liệuchuyểnđổithiết bị: kỳvọngMảngloạikiểu，thựctếBộđến:', typeof records)
          return []
        }

        return records.map((item, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })

  const handleSearch = (params: Api.SystemManage.UserSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('mởmởPopup:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  const deleteUser = (row: UserListItem): void => {
    console.log('XóaNguoiDung:', row)
    ElMessageBox.confirm(`Xác địnhcầntâmtácnênNguoiDungkhông？`, 'tâmtácNguoiDung', {
      confirmButtonText: 'Xác định',
      cancelButtonText: 'Hủy',
      type: 'error'
    }).then(() => {
      ElMessage.success('Đăng xuất thành công')
    })
  }

  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
    } catch (error) {
      console.error('GửiThatBai:', error)
    }
  }

  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('vịtrongdòngDữ liệu:', selectedRows.value)
  }
</script>
