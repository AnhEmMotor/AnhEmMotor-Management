<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  >
  </ArtSearchBar>
</template>

<script setup lang="ts">
type RoleSearchFormParams = {
  roleName?: string;
  description?: string;
};

interface Props {
  modelValue: RoleSearchFormParams;
}

interface Emits {
  (e: "update:modelValue", value: RoleSearchFormParams): void;
  (e: "search", params: RoleSearchFormParams): void;
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

const formItems = computed(() => [
  {
    label: "",
    key: "roleName",
    type: "input",
    placeholder: "Nhập tên vai trò cần tìm...",
    clearable: true,
  },
  {
    label: "",
    key: "description",
    type: "input",
    placeholder: "Nhập mô tả vai trò...",
    clearable: true,
  },
]);

const handleReset = () => {
  emit("reset");
};

const handleSearch = async (params: RoleSearchFormParams) => {
  await searchBarRef.value.validate();
  emit("search", params);
};
</script>
