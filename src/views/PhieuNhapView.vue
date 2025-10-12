<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <PageHeader @open-modal="showAddItemModal = true" />

    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Item Table -->
      <ItemTable />

      <!-- Sidebar -->
      <Sidebar
        @save-draft="handleSaveDraft"
        @complete="handleComplete"
      />
    </div>

    <!-- Add Item Modal -->
    <AddItemModal
      v-model="showAddItemModal"
      @save="handleAddItem"
    />

    <!-- Alert Modal -->
    <AlertModal
      v-model="showAlert"
      :message="alertMessage"
      :type="alertType"
      @ok="handleAlertOk"
      @cancel="handleAlertCancel"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useItemStore } from '@/stores/itemStore';
import PageHeader from '@/components/layout/PageHeader.vue';
import Sidebar from '@/components/layout/SideBar.vue';
import ItemTable from '@/components/table/ItemTable.vue';
import AddItemModal from '@/components/modal/AddItemModal.vue';
import AlertModal from '@/components/modal/AlertModal.vue';

const itemStore = useItemStore();

const showAddItemModal = ref(false);
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('alert');
const pendingAction = ref(null);

function handleAddItem(itemData) {
  itemStore.addItem(itemData);
  showAddItemModal.value = false;
}

function handleSaveDraft() {
  alertMessage.value = 'Đã lưu phiếu tạm thành công!';
  alertType.value = 'alert';
  showAlert.value = true;
}

function handleComplete() {
  alertMessage.value = 'Bạn có chắc chắn muốn hoàn thành phiếu nhập này không?';
  alertType.value = 'confirm';
  pendingAction.value = 'complete';
  showAlert.value = true;
}

function handleAlertOk() {
  if (pendingAction.value === 'complete') {
    // Clear all items and reset
    itemStore.clearAllItems();
    
    // Show success message
    setTimeout(() => {
      alertMessage.value = 'Đã hoàn thành và lưu phiếu nhập.';
      alertType.value = 'alert';
      showAlert.value = true;
    }, 100);
    
    pendingAction.value = null;
  }
}

function handleAlertCancel() {
  pendingAction.value = null;
}
</script>