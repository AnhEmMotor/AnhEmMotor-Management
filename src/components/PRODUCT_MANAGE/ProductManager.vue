<template>
  <!-- Main Content -->
  <div class="flex-1 p-8 bg-white flex flex-col items-center">
    <div class="w-full max-w-6xl mx-auto">
      <div class="p-6 rounded-xl shadow-lg">
        <h1 class="text-3xl font-bold mb-4 text-center text-gray-800 main-title">Danh Sách Sản Phẩm</h1>

        <!-- Control Area: Filter, Import, Export, Add -->
        <div class="flex flex-col lg:flex-row justify-center items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto items-center">

            <!-- Segmented Control - Nút Lọc Trạng Thái -->
            <div class="flex rounded-lg border border-gray-300 bg-gray-100 p-0.5 segmented-control">
              <button
                v-for="status in stockStatuses"
                :key="status.value"
                @click="filterProducts(status.value)"
                :id="`filter-${status.value}`"
                :class="['px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200', stockFilter === status.value ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-200']"
              >
                {{ status.label }}
              </button>
            </div>
            <!-- End Segmented Control -->

            <span class="text-gray-400 mx-4 hidden sm:block">|</span>

            <div class="flex space-x-2">
              <a href="themsp.html" class="px-4 py-2 rounded-lg text-sm font-medium bg-gray-400 text-white hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2 shadow-md">
                <i class="fas fa-plus text-white text-xs"></i>
                <span>Thêm SP</span>
              </a>
              
              <label for="excel-import" class="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 cursor-pointer flex items-center space-x-2 shadow-md">
                <i class="fas fa-upload text-white text-xs"></i>
                <span>Import</span>
              </label>
              <input type="file" id="excel-import" accept=".xlsx,.xls" @change="importExcel" class="file-input">

              <button @click="exportExcel" class="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 shadow-md">
                <i class="fas fa-download text-white text-xs"></i>
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Search Input -->
        <div class="mb-4">
          <input type="text" v-model="searchTerm" @keyup="searchProducts" placeholder="Tìm kiếm sản phẩm..." class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
        </div>

        <!-- Product Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th class="py-3 px-6 text-left">Mã SP</th>
                <th class="py-3 px-6 text-left">Tên Sản Phẩm</th>
                <th class="py-3 px-6 text-left">Danh Mục</th>
                <th class="py-3 px-6 text-left">Số Lượng</th>
                <th class="py-3 px-6 text-left">Trạng Thái</th>
                <th class="py-3 px-6 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody class="text-gray-600 text-sm font-light" id="product-table-body">
              <tr v-if="paginatedProducts.length === 0">
                <td colspan="6" class="text-center py-4 text-gray-500">Không có sản phẩm nào để hiển thị.</td>
              </tr>
              <tr v-for="(product, index) in paginatedProducts" :key="product.code" class="border-b border-gray-200 hover:bg-gray-200 transition-colors duration-200">
                <td class="py-3 px-6 text-left whitespace-nowrap">{{ product.code }}</td>
                <td class="py-3 px-6 text-left">{{ product.name }}</td>
                <td class="py-3 px-6 text-left">{{ product.category }}</td>
                <td class="py-3 px-6 text-left">{{ product.quantity }}</td>
                <td class="py-3 px-6 text-left">
                  <span :class="['px-2 py-1 font-semibold leading-tight rounded-full text-xs', getStatusColorClass(product.quantity)]">{{ getStockStatusText(product.quantity) }}</span>
                </td>
                <td class="py-3 px-6 text-center space-x-2">
                  <button @click="editProduct(product.code)" class="text-blue-600 hover:underline text-sm font-medium">Sửa</button>
                  <button @click="deleteProduct(product.code)" class="text-red-600 hover:underline text-sm font-medium">Xóa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-center items-center space-x-2">
          <button @click="prevPage" :disabled="currentPage <= 1" id="prev-page" class="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition-colors duration-200">Trước</button>
          <span id="page-info" class="text-sm text-gray-700">Trang {{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage >= totalPages || totalPages === 0" id="next-page" class="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition-colors duration-200">Sau</button>
        </div>

      </div>
    </div>
    <!-- End Main Content Wrapper -->

    <!-- Edit Modal -->
    <div v-if="isEditModalOpen" id="edit-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeEditModal">
      <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Chỉnh Sửa Sản Phẩm</h2>
        <form @submit.prevent="updateProduct">
          <input type="hidden" v-model="editingProduct.originalIndex">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Mã SP không được sửa -->
            <input type="text" v-model="editingProduct.code" id="edit-product-code" placeholder="Mã Sản Phẩm" required readonly
              class="p-3 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="text" v-model="editingProduct.name" id="edit-product-name" placeholder="Tên Sản Phẩm" required
              class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <select v-model="editingProduct.category" id="edit-product-category" required
              class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Chọn Danh Mục</option>
              <option value="Xe Máy">Xe Máy</option>
              <option value="Phụ Kiện">Phụ Kiện</option>
              <option value="Phụ Tùng">Phụ Tùng</option>
            </select>
            <input type="number" v-model.number="editingProduct.price" id="edit-product-price" placeholder="Giá Bán" required min="0"
              class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="number" v-model.number="editingProduct.cost" id="edit-product-cost" placeholder="Giá Vốn" required min="0"
              class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="number" v-model.number="editingProduct.quantity" id="edit-product-quantity" placeholder="Số Lượng" required min="0"
              class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div class="mb-4">
            <textarea v-model="editingProduct.description" id="edit-product-description" placeholder="Mô Tả Sản Phẩm" rows="3"
              class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
          <div class="flex space-x-4">
            <button type="submit"
              class="flex-1 py-3 rounded-lg text-lg font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200">Cập
              Nhật</button>
            <button type="button" @click="closeEditModal"
              class="flex-1 py-3 rounded-lg text-lg font-bold bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-200">Hủy</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Custom Message Modal (Thay thế alert) -->
    <div v-if="messageModal.isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-xl shadow-2xl max-w-sm mx-4 text-center">
        <p class="text-lg mb-4 text-gray-800">{{ messageModal.text }}</p>
        <button @click="closeMessageModal" :class="['px-6 py-2 rounded-lg text-white font-semibold transition-colors duration-200', messageModal.type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600']">OK</button>
      </div>
    </div>

    <!-- Custom Confirmation Modal (Thay thế confirm) -->
    <div v-if="confirmationModal.isOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-xl shadow-2xl max-w-sm mx-4 text-center">
        <p class="text-lg mb-4 text-gray-800">{{ confirmationModal.text }}</p>
        <div class="flex justify-center space-x-4">
          <button @click="confirmAction" class="flex-1 py-2 rounded-lg text-white font-semibold transition-colors duration-200 bg-red-500 hover:bg-red-600">Xác nhận</button>
          <button @click="cancelAction" class="flex-1 py-2 rounded-lg text-white font-semibold transition-colors duration-200 bg-gray-500 hover:bg-gray-600">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Tải thư viện XLSX (cho Import/Export Excel). Đây là nơi gây ra lỗi nếu thư viện chưa được cài đặt NPM.
import * as XLSX from 'xlsx';

export default {
  name: 'ProductManager',
  data() {
    return {
      products: [],
      searchTerm: '',
      stockFilter: 'all',
      currentPage: 1,
      itemsPerPage: 10,
      LOW_STOCK_THRESHOLD: 10,

      // Dữ liệu cho Edit Modal
      isEditModalOpen: false,
      editingProduct: {
        originalIndex: -1,
        code: '',
        name: '',
        category: '',
        price: 0,
        cost: 0,
        quantity: 0,
        description: ''
      },

      // Dữ liệu cho Custom Modals
      messageModal: {
        isOpen: false,
        text: '',
        type: 'info', // 'info', 'error', 'success'
      },
      confirmationModal: {
        isOpen: false,
        text: '',
        callback: null,
      },

      // Dữ liệu cho Segmented Control
      stockStatuses: [
        { label: 'Tất Cả', value: 'all' },
        { label: 'Còn Hàng', value: 'in-stock' },
        { label: 'Sắp Hết', value: 'low-stock' },
        { label: 'Hết Hàng', value: 'out-of-stock' },
      ],
      
      // Constants cho trạng thái
      stockStatusColors: {
        'in-stock': 'bg-green-100 text-green-800',
        'low-stock': 'bg-yellow-100 text-yellow-800',
        'out-of-stock': 'bg-red-100 text-red-800'
      },
      stockStatusTextMap: {
        'in-stock': 'Còn Hàng',
        'low-stock': 'Sắp Hết',
        'out-of-stock': 'Hết Hàng'
      }
    };
  },
  computed: {
    // 1. Lọc sản phẩm theo trạng thái tồn kho
    filteredByStatus() {
      if (this.stockFilter === 'all') {
        return this.products;
      }
      return this.products.filter(p => this.getStockStatus(p.quantity) === this.stockFilter);
    },

    // 2. Tìm kiếm sản phẩm trong danh sách đã lọc theo trạng thái
    searchedProducts() {
      const term = this.searchTerm.toLowerCase().trim();
      if (!term) {
        return this.filteredByStatus;
      }
      return this.filteredByStatus.filter(product =>
        product.code.toLowerCase().includes(term) ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term)
      );
    },

    // 3. Tính tổng số trang
    totalPages() {
      const count = this.searchedProducts.length;
      return count === 0 ? 0 : Math.ceil(count / this.itemsPerPage);
    },

    // 4. Phân trang
    paginatedProducts() {
      if (this.currentPage === 0) return [];
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.searchedProducts.slice(start, end);
    }
  },
  watch: {
    // Theo dõi thay đổi trong danh sách đã lọc/tìm kiếm để điều chỉnh trang hiện tại
    searchedProducts: {
      handler(newVal) {
        const totalPages = this.totalPages;
        if (this.currentPage > totalPages && totalPages > 0) {
          this.currentPage = totalPages;
        } else if (totalPages === 0) {
          this.currentPage = 0;
        } else if (this.currentPage === 0 && totalPages > 0) {
          this.currentPage = 1;
        }
      },
      deep: true,
      immediate: true 
    }
  },
  created() {
    this.loadProducts();
  },
  methods: {
    // --- Utils & State Management ---

    loadProducts() {
      const storedProducts = localStorage.getItem('products');
      if (storedProducts) {
        this.products = JSON.parse(storedProducts);
      } else {
        // Dữ liệu khởi tạo nếu chưa có trong localStorage (dữ liệu từ file website.txt)
        this.products = [
          { code: 'SP001', name: 'Honda Wave RSX', category: 'Xe Máy', price: 25000000, cost: 22000000, quantity: 15, description: 'Xe máy Honda Wave RSX 110cc' },
          { code: 'SP002', name: 'Yamaha Jupiter', category: 'Xe Máy', price: 27000000, cost: 24000000, quantity: 8, description: 'Xe máy Yamaha Jupiter Fi 115cc' },
          { code: 'SP003', name: 'Mũ Bảo Hiểm Royal', category: 'Phụ Kiện', price: 350000, cost: 250000, quantity: 45, description: 'Mũ bảo hiểm Royal M20' },
          { code: 'SP004', name: 'Lốp Michelin City Grip', category: 'Phụ Tùng', price: 1200000, cost: 950000, quantity: 2, description: 'Lốp Michelin City Grip 80/90-14' },
          { code: 'SP005', name: 'Dầu Nhớt Castrol', category: 'Phụ Tùng', price: 85000, cost: 65000, quantity: 0, description: 'Dầu nhớt Castrol 10W-30 1L' }
        ];
        this.saveProducts();
      }
    },

    saveProducts() {
      localStorage.setItem('products', JSON.stringify(this.products));
    },

    getStockStatus(quantity) {
      if (quantity === 0) return 'out-of-stock';
      if (quantity <= this.LOW_STOCK_THRESHOLD) return 'low-stock';
      return 'in-stock';
    },

    getStatusColorClass(quantity) {
      return this.stockStatusColors[this.getStockStatus(quantity)];
    },

    getStockStatusText(quantity) {
      return this.stockStatusTextMap[this.getStockStatus(quantity)];
    },

    // --- Filter & Search ---

    filterProducts(status) {
      this.stockFilter = status;
      this.currentPage = 1; // Luôn reset về trang 1 khi lọc
    },

    searchProducts() {
      this.currentPage = 1; // Luôn reset về trang 1 khi tìm kiếm
      // Việc tìm kiếm được xử lý tự động qua computed property `searchedProducts`
    },

    // --- Pagination ---

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },

    // --- CRUD Operations ---

    editProduct(code) {
      const index = this.products.findIndex(p => p.code === code);
      const product = this.products[index];
      if (!product) return;

      // Deep copy sản phẩm để chỉnh sửa
      this.editingProduct = {
        originalIndex: index,
        code: product.code,
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        quantity: product.quantity,
        description: product.description
      };
      this.isEditModalOpen = true;
    },

    updateProduct() {
      const index = this.editingProduct.originalIndex;
      const updatedProduct = { ...this.editingProduct };
      delete updatedProduct.originalIndex; // Xóa property nội bộ

      // Kiểm tra trùng mã (chỉ kiểm tra nếu mã bị thay đổi, nhưng vì input là readonly nên không cần thiết, giữ cho an toàn)
      if (this.products.some((p, i) => p.code === updatedProduct.code && i !== index)) {
        this.showCustomMessage('Mã sản phẩm đã tồn tại!', 'error');
        return;
      }

      // Cập nhật sản phẩm trong mảng gốc
      this.products.splice(index, 1, updatedProduct);
      this.saveProducts();
      this.closeEditModal();
      this.showCustomMessage('Cập nhật sản phẩm thành công!', 'success');
    },

    deleteProduct(code) {
      this.showCustomConfirmation('Bạn có chắc chắn muốn xóa sản phẩm này?', () => {
        const index = this.products.findIndex(p => p.code === code);
        if (index !== -1) {
          this.products.splice(index, 1);
          this.saveProducts();
          this.showCustomMessage('Xóa sản phẩm thành công!', 'success');
        }
      });
    },

    closeEditModal() {
      this.isEditModalOpen = false;
    },

    // --- Excel Import/Export ---

    importExcel(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const data = XLSX.utils.sheet_to_json(worksheet);

          const importedProducts = data.map(row => ({
            code: (row['Mã SP'] || row['Code'] || '').toString().trim(),
            name: (row['Tên Sản Phẩm'] || row['Name'] || '').toString().trim(),
            category: (row['Danh Mục'] || row['Category'] || '').toString().trim(),
            price: parseFloat(row['Giá Bán'] || row['Price'] || 0),
            cost: parseFloat(row['Giá Vốn'] || row['Cost'] || 0),
            quantity: parseInt(row['Số Lượng'] || row['Quantity'] || 0),
            description: (row['Mô Tả'] || row['Description'] || '').toString().trim()
          }));

          const validProducts = importedProducts.filter(product => {
            if (!product.code || !product.name) return false;
            // Kiểm tra trùng mã với sản phẩm hiện có
            if (this.products.some(p => p.code === product.code)) {
              console.warn(`Sản phẩm với mã ${product.code} đã tồn tại và sẽ bị bỏ qua.`);
              return false;
            }
            return true;
          });

          if (validProducts.length > 0) {
            this.products.push(...validProducts);
            this.saveProducts();
            this.showCustomMessage(`Đã import thành công ${validProducts.length} sản phẩm!`, 'success');
          } else {
            this.showCustomMessage('Không có sản phẩm hợp lệ nào để import! Vui lòng kiểm tra định dạng cột.', 'error');
          }
        } catch (error) {
          console.error('Error importing Excel:', error);
          this.showCustomMessage('Có lỗi xảy ra khi import file Excel. Vui lòng kiểm tra định dạng file.', 'error');
        }
      };
      reader.readAsBinaryString(file);
      event.target.value = ''; // Reset file input
    },

    exportExcel() {
      if (this.products.length === 0) {
        this.showCustomMessage('Không có dữ liệu để xuất!', 'info');
        return;
      }

      // Export Data (Theo yêu cầu của code HTML gốc, không xuất cột Giá Bán)
      const exportData = this.products.map(product => ({
        'Mã SP': product.code,
        'Tên Sản Phẩm': product.name,
        'Danh Mục': product.category,
        'Giá Vốn': product.cost,
        'Số Lượng': product.quantity,
        'Trạng Thái': this.getStockStatusText(product.quantity),
        'Mô Tả': product.description
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Cập nhật colWidths cho 7 cột
      const colWidths = [
          { wch: 10 }, { wch: 25 }, { wch: 15 },
          { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 30 } 
      ];
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Sản Phẩm');

      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `DanhSachSanPham_${currentDate}.xlsx`;

      XLSX.writeFile(workbook, filename);
    },

    // --- Custom Modal Handlers (Thay thế alert/confirm) ---

    showCustomMessage(message, type = 'info') {
      this.messageModal.text = message;
      this.messageModal.type = type;
      this.messageModal.isOpen = true;
    },

    closeMessageModal() {
      this.messageModal.isOpen = false;
    },

    showCustomConfirmation(message, onConfirm) {
      this.confirmationModal.text = message;
      this.confirmationModal.callback = onConfirm;
      this.confirmationModal.isOpen = true;
    },

    confirmAction() {
      if (this.confirmationModal.callback) {
        this.confirmationModal.callback();
      }
      this.confirmationModal.isOpen = false;
      this.confirmationModal.callback = null;
    },

    cancelAction() {
      this.confirmationModal.isOpen = false;
      this.confirmationModal.callback = null;
    }
  }
};
</script>

<style scoped>
/* CSS thuần túy từ file HTML gốc */
body {
  font-family: 'Inter', sans-serif;
  background-color: #f9fafb;
  color: #1f2937;
}

.file-input {
  opacity: 0;
  position: absolute;
  z-index: -1;
}

/* Ghi đè CSS h1 { color: red !important; } từ file gốc */
/* Sử dụng !important ở đây để đảm bảo ghi đè style global từ App.vue nếu cần */
.main-title {
  color: #1f2937 !important; 
}

/* Thêm CSS cho Segmented Control */
.segmented-control button {
  transition: all 0.2s ease;
  white-space: nowrap;
}

.segmented-control button:first-child {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
}

.segmented-control button:last-child {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}
</style>
