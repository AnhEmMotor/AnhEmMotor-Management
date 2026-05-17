<template>
  <div class="art-full-height">
    <div class="box-border flex gap-4 h-full max-md:block max-md:gap-0 max-md:h-auto">
      <div class="flex-shrink-0 w-58 h-full max-md:w-full max-md:h-auto max-md:mb-5">
        <ElCard class="tree-card art-card-xs flex flex-col h-full mt-0">
          <template #header>
            <b>{{ $t('admin.t106') }}</b>
          </template>
          <ElScrollbar>
            <ElTree
              :data="treeData"
              :props="treeProps"
              node-key="id"
              default-expand-all
              highlight-current
              @node-click="handleNodeClick"
            />
          </ElScrollbar>
        </ElCard>
      </div>

      <div class="flex flex-col flex-grow min-w-0">
        <UserSearch v-model="defaultFilter" />

        <ElCard class="flex flex-col flex-1 min-h-0 art-table-card">
          <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
            <template #left>
              <ElSpace wrap>
                <ElButton @click="showButtons = !showButtons" v-ripple type="primary" plain
                  >{{ showButtons ? 'Thu gọn' : 'Mở rộng' }}tổ</ElButton
                >
                <ElButton v-show="showButtons" v-ripple v-for="value in 12" :key="value"
                  >Bảngtừthíchứng</ElButton
                >
              </ElSpace>
            </template>
          </ArtTableHeader>

          <ArtTable
            rowKey="id"
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
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList } from '@/api/system-manage'
  import UserSearch from '@/views/system/user/modules/user-search.vue'

  defineOptions({ name: 'TreeTable' })

  const showButtons = ref(false)

  const treeData = ref([
    {
      id: 1,
      label: 'kỹthuậtbộ',
      children: [
        {
          id: 11,
          label: 'trướcđầumởpháttổ',
          children: [
            { id: 111, label: 'React đoànđội' },
            { id: 112, label: 'Vue đoànđội' },
            { id: 113, label: 'Diđộngđầuđoànđội' }
          ]
        },
        {
          id: 12,
          label: 'sauđầumởpháttổ',
          children: [
            { id: 121, label: 'Java đoànđội' },
            { id: 122, label: 'Node.js đoànđội' },
            { id: 123, label: 'Python đoànđội' }
          ]
        },
        {
          id: 13,
          label: 'đothửtổ',
          children: [
            { id: 131, label: 'côngnăngđothử' },
            { id: 132, label: 'từđộnghóađothử' },
            { id: 133, label: 'tínhnăngđothử' }
          ]
        },
        {
          id: 14,
          label: 'vậnduytổ',
          children: [
            { id: 141, label: 'HeThongvậnduy' },
            { id: 142, label: 'DevOps' }
          ]
        }
      ]
    },
    {
      id: 2,
      label: 'sinhsản phẩmbộ',
      children: [
        {
          id: 21,
          label: 'sinhsản phẩmthiếtkếtổ',
          children: [
            { id: 211, label: 'UI thiếtkế' },
            { id: 212, label: 'UX thiếtkế' },
            { id: 213, label: 'nộpthiếtkế' }
          ]
        },
        {
          id: 22,
          label: 'sinhsản phẩmvậndoanhtổ',
          children: [
            { id: 221, label: 'NguoiDungvậndoanh' },
            { id: 222, label: 'NoiDungvậndoanh' },
            { id: 223, label: 'sốngđộngvậndoanh' }
          ]
        },
        { id: 23, label: 'Dữ liệuphầnphântổ' }
      ]
    },
    {
      id: 3,
      label: 'thịtrườngbộ',
      children: [
        { id: 31, label: 'sản phẩmbảngđẩyquảngtổ' },
        { id: 32, label: 'kênhđạomởtriểntổ' },
        {
          id: 33,
          label: 'tácbántổ',
          children: [
            { id: 331, label: 'xínghiệpkháchkhoản' },
            { id: 332, label: 'CaNhankháchkhoản' }
          ]
        }
      ]
    },
    {
      id: 4,
      label: 'dòngchínhbộ',
      children: [
        { id: 41, label: 'ngườilựctàinguồntổ' },
        { id: 42, label: 'tàivụtổ' },
        { id: 43, label: 'dòngchínhsaucầntổ' }
      ]
    },
    {
      id: 5,
      label: 'kháchphụcbộ',
      children: [
        { id: 51, label: 'bántrướctưhỏi' },
        { id: 52, label: 'bánsauchiếctrì' },
        { id: 53, label: 'kháchkhoảnThanhCong' }
      ]
    }
  ])

  const treeProps = {
    children: 'children',
    label: 'label'
  }

  const handleNodeClick = (data: any) => {
    console.log('vịtrongtiếtđiểm:', data)
  }

  const defaultFilter = ref<Api.SystemManage.UserSearchParams>({
    userName: undefined,
    userGender: undefined,
    userPhone: undefined,
    userEmail: undefined,
    status: undefined
  })

  const {
    data,
    columns,
    columnChecks,
    loading,
    pagination,
    refreshData,
    handleSizeChange,
    handleCurrentChange
  } = useTable({
    core: {
      apiFn: fetchGetUserList as any,
      apiParams: {
        current: 1,
        size: 20,
        userName: '',
        userPhone: '',
        userEmail: ''
      },
      columnsFactory: () => [
        {
          prop: 'id',
          label: 'ID'
        },
        {
          prop: 'nickName',
          label: 'Biệt danh'
        },
        {
          prop: 'userGender',
          label: 'GioiTinh',
          sortable: true,
          formatter: (row: any) => row.userGender || 'Chưabáo'
        },
        {
          prop: 'userPhone',
          label: 'Số điện thoại'
        },
        {
          prop: 'userEmail',
          label: 'Email'
        }
      ]
    }
  })
</script>

<style scoped>
  .tree-card :deep(.el-card__body) {
    flex: 1;
    min-height: 0;
    padding: 10px 2px 10px 10px;
  }
</style>
