<!-- NguoiDungQuản lýtrangmặt -->
<!-- art-full-height từđộngkếratrangmặtthừathừaChiều cao -->
<!-- art-table-card mộtchiếckýhợpHeThongKiểu dángcủa class，cùnggiờtừđộngchốngđầythừathừaChiều cao -->
<!-- Thêm useTable Ví dụ sử dụngVui lòngDibướcđến côngnăngVí dụ dướimặtcủaNâng caoBảngVí dụhoặcXemChính thứcTaiLieu -->
<!-- useTable TaiLieu：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- TimKiemlan -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card">
      <!-- Bảngđầubộ -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>{{ $t('admin.t143') }}</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- Bảng -->
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

      <!-- NguoiDungPopup -->
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

  // Popupđóng
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // vịtrongdòng
  const selectedRows = ref<UserListItem[]>([])

  // TimKiemForm
  const searchForm = ref({
    userName: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: '1'
  })

  // NguoiDungTrạng tháiCauHinh
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: 'tạiđường' },
    '2': { type: 'info' as const, text: 'Ngoạiđường' },
    '3': { type: 'warning' as const, text: 'Bất thường' },
    '4': { type: 'danger' as const, text: 'tâmtác' }
  } as const

  /**
   * LấyNguoiDungTrạng tháiCauHinh
   */
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
    // Cốt lõiCauHinh
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      // Tùy chỉnhPhân trangchữđoạnảnhxạ，ChưaCaiDatgiờtươngkhiếndùngtoànbộCauHinh tableConfig.ts trongcủa paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' }, // mócvịcột
        { type: 'index', width: 60, label: 'thứsố' }, // thứsố
        {
          prop: 'userInfo',
          label: 'Tên người dùng',
          width: 280,
          // visible: false, // MacDinhlàphủHiển thịcột
          formatter: (row) => {
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: row.avatar,
                previewSrcList: [row.avatar],
                // Hình ảnhXem trướclàphủchènvàođến body nguyêntốtrên，dùngởgiảiBảngtrongbộHình ảnhXem trướcKiểu dángBất thường
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
    // Dữ liệuXuLy
    transform: {
      // Dữ liệuchuyểnđổithiết bị - thếđổiAvatar
      dataTransformer: (records) => {
        // loạikiểugiữvệTìm
        if (!Array.isArray(records)) {
          console.warn('Dữ liệuchuyểnđổithiết bị: kỳvọngMảngloạikiểu，thựctếBộđến:', typeof records)
          return []
        }

        // khiếndùngquyểnđịaAvatarthếđổiGiao diện (Interface)Quay lạicủaAvatar
        return records.map((item, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })

  /**
   * TimKiemXuLy
   * @param params Tham số
   */
  const handleSearch = (params: Api.SystemManage.UserSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  /**
   * Hiển thịNguoiDungPopup
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('mởmởPopup:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * XóaNguoiDung
   */
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

  /**
   * XuLyPopupGửiSuKien
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
    } catch (error) {
      console.error('GửiThatBai:', error)
    }
  }

  /**
   * XuLyBảngdòngChọnbiếnhóa
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('vịtrongdòngDữ liệu:', selectedRows.value)
  }
</script>
