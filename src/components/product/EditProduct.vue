<template>
  <div
    v-if="isEditModalOpen"
    id="edit-modal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeEditModal"
  >
    <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl mx-4">
      <h2 class="text-2xl font-semibold mb-4 text-gray-800">Chỉnh Sửa Sản Phẩm</h2>
      <form @submit.prevent="updateProduct">
        <input type="hidden" v-model="editingProduct.originalIndex" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Product code is read-only -->
          <input
            type="text"
            v-model="editingProduct.code"
            id="edit-product-code"
            placeholder="Mã Sản Phẩm"
            required
            readonly
            class="p-3 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            v-model="editingProduct.name"
            id="edit-product-name"
            placeholder="Tên Sản Phẩm"
            required
            class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            v-model="editingProduct.category"
            id="edit-product-category"
            required
            class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn Danh Mục</option>
            <option value="Xe Máy">Xe Máy</option>
            <option value="Phụ Kiện">Phụ Kiện</option>
            <option value="Phụ Tùng">Phụ Tùng</option>
          </select>
          <input
            type="number"
            v-model.number="editingProduct.price"
            id="edit-product-price"
            placeholder="Giá Bán"
            required
            min="0"
            class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            v-model.number="editingProduct.cost"
            id="edit-product-cost"
            placeholder="Giá Vốn"
            required
            min="0"
            class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            v-model.number="editingProduct.quantity"
            id="edit-product-quantity"
            placeholder="Số Lượng"
            required
            min="0"
            class="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-4">
          <textarea
            v-model="editingProduct.description"
            id="edit-product-description"
            placeholder="Mô Tả Sản Phẩm"
            rows="3"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        <div class="flex space-x-4">
          <button
            type="submit"
            class="flex-1 py-3 rounded-lg text-lg font-bold bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
          >
            Cập Nhật
          </button>
          <button
            type="button"
            @click="closeEditModal"
            class="flex-1 py-3 rounded-lg text-lg font-bold bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-200"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
