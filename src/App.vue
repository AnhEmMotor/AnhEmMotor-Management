<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <Sidebar @navigate="handleNavigation" />

    <!-- Main Content -->
    <div class="flex-1 p-8 bg-white ml-72">
      <Dashboard v-if="activeView === 'dashboard'" :orders="orders" @cancel-order="cancelCustomerOrder" @view-details="openOrderDetailModal" />
      <OrderManager v-if="activeView === 'motorcycle'" :orders="orders.filter(o => o.type === 'motorcycle')" title="Quản Lý Đơn Hàng Xe Máy" type="motorcycle" @view-details="openOrderDetailModal" />
      <OrderManager v-if="activeView === 'parts'" :orders="orders.filter(o => o.type === 'parts')" title="Quản Lý Đơn Hàng Phụ Tùng" type="parts" @view-details="openOrderDetailModal" />
      <OrderManager v-if="activeView === 'accessories'" :orders="orders.filter(o => o.type === 'accessories')" title="Quản Lý Đơn Hàng Phụ Kiện" type="accessories" @view-details="openOrderDetailModal" />
      <ProductManager v-if="activeView === 'product-management'" :products="products" @add-product="openProductModal(null)" @edit-product="openProductModal" @delete-product="deleteProduct" />
    </div>

    <!-- Modals -->
    <OrderDetailModal 
      :visible="isOrderDetailModalVisible" 
      :order="selectedOrder"
      @close="closeOrderDetailModal"
      @update-status="updateOrderStatus"
    />
    <ProductModal 
      :visible="isProductModalVisible"
      :product="productToEdit"
      @close="closeProductModal"
      @save="saveProduct"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Dashboard from './components/Dashboard.vue';
import OrderManager from './components/OrderManager.vue';
import ProductManager from './components/ProductManager.vue';
import OrderDetailModal from './components/OrderDetailModal.vue';
import ProductModal from './components/ProductModal.vue';

// Reactive state
const activeView = ref('dashboard');
const orders = ref([]);
const products = ref([]);
const isOrderDetailModalVisible = ref(false);
const selectedOrder = ref(null);
const isProductModalVisible = ref(false);
const productToEdit = ref(null);


// Initial data
const initialOrders = [
    { id: 'ORD-001', customerName: 'Nguyễn Văn A', date: '2023-10-26', type: 'motorcycle', status: 'completed', paymentStatus: 'paid', total: 55000000, deliveryImage: 'motorcycle_delivered.jpg', products: [{ name: 'Xe Vision 2023', qty: 1, price: 55000000 }] },
    { id: 'ORD-002', customerName: 'Trần Thị B', date: '2023-10-25', type: 'motorcycle', status: 'unconfirmed', paymentStatus: 'unpaid', total: 42000000, deliveryImage: null, products: [{ name: 'Xe Exciter 155', qty: 1, price: 42000000 }] },
    { id: 'ORD-003', customerName: 'Lê Văn C', date: '2023-10-24', type: 'parts', status: 'unconfirmed', paymentStatus: 'paid', total: 3500000, deliveryImage: null, products: [{ name: 'Lốp Michelin City', qty: 2, price: 1750000 }] },
    { id: 'ORD-004', customerName: 'Phạm Thị D', date: '2023-10-23', type: 'accessories', status: 'unconfirmed', paymentStatus: 'unpaid', total: 490000, deliveryImage: null, products: [{ name: 'Mũ bảo hiểm fullface', qty: 1, price: 490000 }] },
    { id: 'ORD-005', customerName: 'Hoàng Thị E', date: '2023-10-22', type: 'accessories', status: 'unconfirmed', paymentStatus: 'unpaid', total: 120000, deliveryImage: null, products: [{ name: 'Khóa chống trộm', qty: 1, price: 120000 }] },
    { id: 'ORD-006', customerName: 'Vũ Văn F', date: '2023-10-21', type: 'parts', status: 'completed', paymentStatus: 'paid', total: 280000, deliveryImage: 'parts_delivered.jpg', products: [{ name: 'Dầu nhớt Castrol', qty: 4, price: 70000 }] }
];

const initialProducts = [
    { id: 'SP-001', name: 'Xe Vision 2023', type: 'motorcycle', price: 55000000, stock: 10 },
    { id: 'SP-002', name: 'Lốp Michelin City', type: 'parts', price: 1750000, stock: 50 },
    { id: 'SP-003', name: 'Mũ bảo hiểm fullface', type: 'accessories', price: 490000, stock: 100 },
    { id: 'SP-004', name: 'Dầu nhớt Castrol', type: 'parts', price: 70000, stock: 200 }
];


// Methods
function saveData() {
  localStorage.setItem('orders', JSON.stringify(orders.value));
  localStorage.setItem('products', JSON.stringify(products.value));
}

function loadData() {
  orders.value = JSON.parse(localStorage.getItem('orders')) || initialOrders;
  products.value = JSON.parse(localStorage.getItem('products')) || initialProducts;
}

function handleNavigation(view) {
  activeView.value = view;
}

// Order Methods
function openOrderDetailModal(order) {
  selectedOrder.value = order;
  isOrderDetailModalVisible.value = true;
}

function closeOrderDetailModal() {
  isOrderDetailModalVisible.value = false;
  selectedOrder.value = null;
}

function updateOrderStatus({ orderId, newStatus }) {
  const order = orders.value.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveData();
    alert(`Trạng thái đơn hàng ${order.id} đã được cập nhật.`);
  }
}

function cancelCustomerOrder(orderToCancel) {
    if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${orderToCancel.id} của mình?`)) {
        orders.value = orders.value.filter(o => o.id !== orderToCancel.id);
        saveData();
        alert(`Đơn hàng ${orderToCancel.id} đã bị hủy thành công.`);
    }
}


// Product Methods
function openProductModal(product) {
  productToEdit.value = product ? { ...product } : null; // Create a copy for editing
  isProductModalVisible.value = true;
}

function closeProductModal() {
  isProductModalVisible.value = false;
  productToEdit.value = null;
}

function saveProduct(productData) {
  if (productToEdit.value) {
    // Editing existing product
    const index = products.value.findIndex(p => p.id === productData.id);
    if (index !== -1) {
      products.value[index] = productData;
      alert('Sản phẩm đã được cập nhật thành công!');
    }
  } else {
    // Adding new product
    if (products.value.some(p => p.id === productData.id)) {
      alert('Mã sản phẩm đã tồn tại. Vui lòng sử dụng mã khác.');
      return;
    }
    products.value.push(productData);
    alert('Sản phẩm đã được thêm thành công!');
  }
  saveData();
  closeProductModal();
}

function deleteProduct(productToDelete) {
   if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm ${productToDelete.name} (ID: ${productToDelete.id})?`)) {
        products.value = products.value.filter(p => p.id !== productToDelete.id);
        saveData();
        alert('Sản phẩm đã được xóa thành công!');
    }
}


// Lifecycle Hook
onMounted(() => {
  loadData();
});
</script>
