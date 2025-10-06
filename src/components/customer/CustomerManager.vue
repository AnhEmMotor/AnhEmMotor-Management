<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <div class="w-64 bg-white text-gray-800 p-6 shadow-xl flex flex-col items-center">
      <h1 class="text-3xl font-bold mb-8 text-red-600">AnhEm Motor</h1>

      <nav class="w-full">
        <ul class="space-y-3">
          <!-- Trang chủ -->
          <li>
            <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <i class="fa-solid fa-house text-red-600"></i>
              <span>Trang chủ</span>
            </a>
          </li>

          <!-- Báo cáo -->
          <li>
            <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <i class="fa-solid fa-chart-bar text-red-600"></i>
              <span>Báo cáo</span>
            </a>
          </li>

          <!-- Phân tích doanh thu -->
          <li>
            <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <i class="fa-solid fa-chart-line text-red-600"></i>
              <span>Phân Tích Doanh Thu</span>
            </a>
          </li>

          <!-- Báo cáo sản phẩm -->
          <li>
            <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <i class="fa-solid fa-box-archive text-red-600"></i>
              <span>Báo Cáo Sản Phẩm</span>
            </a>
          </li>

          <!-- Quản lý khách hàng (active) -->
          <li>
            <a href="#" class="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 text-gray-900 font-semibold hover:bg-gray-200 transition-colors duration-200">
              <i class="fa-solid fa-user-group text-red-600"></i>
              <span>Quản Lý Khách Hàng</span>
            </a>
          </li>

          <!-- Quản lý đơn hàng -->
          <li>
            <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <i class="fa-solid fa-cart-shopping text-red-600"></i>
              <span>Quản Lý Đơn Hàng</span>
            </a>
          </li>

          <!-- Quản lý nhập hàng -->
          <li>
            <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <i class="fa-solid fa-download text-red-600"></i>
              <span>Quản Lý Nhập Hàng</span>
            </a>
          </li>

          <!-- Quản lý sản phẩm -->
          <li>
            <a href="#" class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <i class="fa-solid fa-code text-red-600"></i>
              <span>Quản Lý Sản Phẩm</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Nội dung chính (phần còn lại giữ nguyên) -->
    <div class="flex-1 p-8">
      <div class="bg-gray-100 p-6 rounded-xl shadow-lg">
        <h1 class="text-3xl font-bold mb-4 text-center text-gray-800">Quản Lý Khách Hàng</h1>

        <!-- Nội dung cũ giữ nguyên -->
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div class="flex flex-col space-y-2 lg:space-y-0">
            <h2 class="text-2xl font-semibold text-gray-800">Danh Sách Khách Hàng</h2>
            <p class="text-sm text-gray-500">Người dùng hiện tại: <span id="user-id">Đang tải...</span></p>
          </div>

          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full lg:w-auto">
            <button @click="openAddModal"
              class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2">
              <i class="fa-solid fa-user-plus"></i>
              <span>Thêm Khách Hàng</span>
            </button>

            <div class="flex space-x-2">
              <button @click="filterCustomers('all')" id="filter-all"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200">
                Tất Cả
              </button>
              <button @click="filterCustomers('active')" id="filter-active"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-green-400 text-green-800 hover:bg-green-500 transition-colors duration-200">
                Hoạt Động
              </button>
              <button @click="filterCustomers('new')" id="filter-new"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-400 text-yellow-800 hover:bg-yellow-500 transition-colors duration-200">
                Mới
              </button>
              <button @click="filterCustomers('inactive')" id="filter-inactive"
                class="px-4 py-2 rounded-lg text-sm font-medium bg-red-400 text-red-800 hover:bg-red-500 transition-colors duration-200">
                Không Hoạt Động
              </button>
            </div>
          </div>
        </div>

        <!-- Ô tìm kiếm -->
        <div class="mb-4">
          <input type="text" id="search-input" placeholder="Tìm kiếm khách hàng..." @keyup="searchCustomers"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <!-- Bảng khách hàng -->
        <div class="overflow-x-auto">
          <table class="min-w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-3 px-6 text-left">Mã KH</th>
                <th class="py-3 px-6 text-left">Tên Khách Hàng</th>
                <th class="py-3 px-6 text-left">Email</th>
                <th class="py-3 px-6 text-left">Số Điện Thoại</th>
                <th class="py-3 px-6 text-left">Địa Chỉ</th>
                <th class="py-3 px-6 text-left">Trạng Thái</th>
                <th class="py-3 px-6 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody id="customer-table-body" class="text-gray-600 text-sm font-light">
              <tr v-if="!displayCustomers || displayCustomers.length === 0">
                <td colspan="7" class="text-center py-4 text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const displayCustomers = ref([]) // ✅ tránh lỗi undefined.length

onMounted(() => {
  // giữ nguyên toàn bộ logic Firebase như phiên bản trước
  const loadFirebaseAndRun = async () => {
    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js')
      const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js')
      const { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js')

      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {}
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null

      const app = initializeApp(firebaseConfig)
      const db = getFirestore(app)
      const auth = getAuth(app)
      let currentUserId = null
      window.customers = []
      let unsubscribe = null

      window.showModal = (id) => {
        const modal = document.getElementById(id)
        if (modal) modal.classList.remove('hidden')
        modal?.classList.add('flex', 'modal-visible')
      }

      window.closeModal = (id) => {
        const modal = document.getElementById(id)
        if (modal) modal.classList.remove('flex', 'modal-visible')
        modal?.classList.add('hidden')
      }

      const statusColors = {
        'active': 'bg-green-100 text-green-800',
        'new': 'bg-yellow-100 text-yellow-800',
        'inactive': 'bg-red-100 text-red-800'
      }

      const statusText = {
        'active': 'Hoạt Động',
        'new': 'Mới',
        'inactive': 'Không Hoạt Động'
      }

      window.renderCustomers = (customerList) => {
        const tableBody = document.getElementById('customer-table-body')
        if (!tableBody) return
        tableBody.innerHTML = ''

        if (!customerList || customerList.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-gray-500">Không có dữ liệu khách hàng.</td></tr>`
          return
        }

        customerList.forEach((customer) => {
          const row = document.createElement('tr')
          row.className = 'border-b border-gray-200 hover:bg-gray-200 transition-colors duration-200'
          const statusColor = statusColors[customer.status] || 'bg-gray-200 text-gray-600'
          const statusLabel = statusText[customer.status] || 'Không xác định'

          row.innerHTML = `
              <td class="py-3 px-6 text-left whitespace-nowrap">${customer.code}</td>
              <td class="py-3 px-6 text-left">${customer.name}</td>
              <td class="py-3 px-6 text-left">${customer.email}</td>
              <td class="py-3 px-6 text-left">${customer.phone}</td>
              <td class="py-3 px-6 text-left">${customer.address}</td>
              <td class="py-3 px-6 text-left">
                  <span class="px-2 py-1 font-semibold leading-tight ${statusColor} rounded-full text-xs">${statusLabel}</span>
              </td>
              <td class="py-3 px-6 text-center space-x-2">
                  <button onclick="editCustomer('${customer.id}')" class="text-blue-600 hover:underline text-sm font-medium">Sửa</button>
                  <button onclick="deleteCustomer('${customer.id}')" class="text-red-600 hover:underline text-sm font-medium">Xóa</button>
              </td>
          `
          tableBody.appendChild(row)
        })
      }

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          currentUserId = user.uid
          const userIdEl = document.getElementById('user-id')
          if (userIdEl) userIdEl.textContent = currentUserId
          const customersRef = collection(db, `/artifacts/${appId}/public/data/customers`)

          if (unsubscribe) unsubscribe()
          unsubscribe = onSnapshot(customersRef, (querySnapshot) => {
            window.customers = []
            querySnapshot.forEach((d) => {
              window.customers.push({ id: d.id, ...d.data() })
            })
            displayCustomers.value = window.customers // ✅ cập nhật reactive
            window.filterCustomers('all')
          })
        } else {
          await signInAnonymously(auth)
        }
      })
    } catch (err) {
      console.error('Không thể nạp Firebase:', err)
    }
  }

  loadFirebaseAndRun()
})
</script>

<style>
.file-input {
  opacity: 0;
  position: absolute;
  z-index: -1;
}
.modal {
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
.modal-content {
  transform: translateY(-20px);
  transition: transform 0.3s ease;
}
.modal-visible .modal-content {
  transform: translateY(0);
}
h1 {
  color: #dc2626;
}
</style>
