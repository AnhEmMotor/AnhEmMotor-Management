<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    :isExpand="true"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
type UserSearchFormParams = {
  userName?: string;
  fullName?: string;
  userPhone?: string;
  userEmail?: string;
  status?: string;
  userGender?: string;
};

interface Props {
  modelValue: UserSearchFormParams;
}

interface Emits {
  (e: "update:modelValue", value: UserSearchFormParams): void;
  (e: "search", params: UserSearchFormParams): void;
  (e: "reset"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const searchBarRef = ref();
const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const rules = {};

const statusOptions = ref([
  { label: "Hoạt động", value: "Active" },
  { label: "Bị khóa", value: "Banned" },
]);

const formItems = computed(() => [
  {
    label: "",
    key: "userName",
    type: "input",
    placeholder: "Nhập tên đăng nhập...",
    clearable: true,
  },
  {
    label: "",
    key: "fullName",
    type: "input",
    placeholder: "Nhập tên đầy đủ...",
    clearable: true,
  },
  {
    label: "",
    key: "userPhone",
    type: "input",
    props: {
      placeholder: "Nhập số điện thoại...",
      maxlength: "11",
      clearable: true,
    },
  },
  {
    label: "",
    key: "userEmail",
    type: "input",
    props: { placeholder: "Nhập địa chỉ email...", clearable: true },
  },
  {
    label: "",
    key: "status",
    type: "select",
    props: {
      placeholder: "Chọn trạng thái...",
      options: statusOptions.value,
      clearable: true,
    },
  },
  {
    label: "",
    key: "userGender",
    type: "select",
    props: {
      placeholder: "Chọn giới tính...",
      options: [
        { label: "Nam", value: "Male" },
        { label: "Nữ", value: "Female" },
        { label: "Khác", value: "Other" },
      ],
      clearable: true,
    },
  },
]);

function handleReset() {
  emit("reset");
}

async function handleSearch(params: UserSearchFormParams) {
  await searchBarRef.value.validate();
  emit("search", params);
}
</script>
