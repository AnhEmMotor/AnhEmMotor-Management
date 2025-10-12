<template>
    <div class="min-h-screen flex flex-col">
        <!-- Top Navigation Bar -->
        <header class="bg-white border-b border-gray-200 sticky top-0 z-10 p-3 shadow-sm">
            <div class="flex items-center justify-between max-w-7xl mx-auto">
                <div class="text-lg font-bold text-gray-800 flex items-center">
                    <i data-lucide="building" class="w-5 h-5 mr-2 text-gray-600"></i>
                    Nhà cung cấp
                </div>

                <div class="flex items-center space-x-3">
                    <div class="relative hidden sm:block">
                        <i data-lucide="search"
                            class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"></i>
                        <input type="text" v-model="filters.search" placeholder="Tra theo mã, tên, số điện thoại"
                            class="w-64 pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm">
                        <i data-lucide="arrow-right-left"
                            class="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-red-500"></i>
                    </div>

                    <button
                        class="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 transition duration-150 py-1.5 px-2 rounded-lg"
                        @click="openAddEditModal()">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                        <span>Nhà cung cấp</span>
                    </button>

                    <label for="import-file-input"
                        class="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-700 transition duration-150 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <i data-lucide="file-text" class="w-4 h-4"></i>
                        <span>Import file</span>
                        <input type="file" id="import-file-input" accept=".xlsx, .xls" class="hidden" @change="handleImport">
                    </label>

                    <button
                        class="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-700 transition duration-150 p-1.5 rounded-lg hover:bg-gray-100"
                        @click="handleExport">
                        <i data-lucide="file-export" class="w-4 h-4"></i>
                        <span>Xuất file</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Main Content Area -->
        <main class="flex-1 p-3 max-w-7xl mx-auto w-full flex flex-col lg:flex-row-reverse gap-5">

            <!-- Sidebar (Filters) -->
            <aside class="w-full lg:w-1/4 bg-white p-4 rounded-xl shadow-lg h-fit border border-gray-100">
                <h2 class="text-base font-bold mb-4 text-gray-800 border-b pb-2">Bộ lọc</h2>

                <div class="mb-5">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Nhóm nhà cung cấp</p>
                    <select v-model="filters.group" class="w-full text-sm filter-input focus:ring-red-500 focus:border-red-500">
                        <option value="all">Tất cả các nhóm</option>
                        <option v-for="group in supplierGroups" :key="group.name" :value="group.name">{{ group.name }}</option>
                    </select>
                    <button class="text-xs text-red-600 hover:text-red-700 font-medium mt-1 flex items-center" @click="isAddGroupModalVisible = true">
                        <i data-lucide="plus" class="w-3 h-3 mr-1"></i>
                        Tạo mới
                    </button>
                </div>

                <hr class="my-4 border-gray-100">

                <div class="mb-5">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Tổng mua (Giá trị)</p>
                    <div class="space-y-2">
                        <div class="flex space-x-2">
                            <input type="text" :value="filters.totalPurchaseMin" @input="updateFormattedNumberFilter('totalPurchaseMin', $event)" placeholder="Từ" class="w-1/2 text-sm filter-input focus:ring-red-500 focus:border-red-500">
                            <input type="text" :value="filters.totalPurchaseMax" @input="updateFormattedNumberFilter('totalPurchaseMax', $event)" placeholder="Đến" class="w-1/2 text-sm filter-input focus:ring-red-500 focus:border-red-500">
                        </div>
                    </div>
                </div>

                <hr class="my-4 border-gray-100">

                <div class="mb-5">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Thời gian</p>
                    <div class="space-y-2">
                        <label class="flex items-center space-x-3 text-sm p-2 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name="time-filter" value="all" v-model="filters.timeFilter" class="form-radio text-red-600 h-4 w-4 border-gray-300 focus:ring-red-500">
                            <span>Toàn thời gian</span>
                        </label>
                        <label class="block">
                             <div class="flex items-center space-x-3 text-sm p-2 rounded-lg transition-colors hover:bg-gray-50 cursor-pointer">
                                 <input type="radio" name="time-filter" value="custom" v-model="filters.timeFilter" class="form-radio text-red-600 h-4 w-4 border-gray-300 focus:ring-red-500 mr-3">
                                <i data-lucide="calendar" class="w-4 h-4 text-gray-500"></i>
                                <span class="font-medium text-gray-700">Tùy chỉnh</span>
                            </div>
                        </label>
                        <div v-if="filters.timeFilter === 'custom'" class="flex space-x-2 mt-2 ml-1">
                            <input type="date" v-model="filters.customDateStart" class="w-full text-sm filter-input focus:ring-red-500 focus:border-red-500">
                        </div>
                    </div>
                </div>

                <hr class="my-4 border-gray-100">

                <div class="mb-1">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Trạng thái</p>
                    <div class="status-radio-group text-sm flex flex-wrap gap-2">
                        <input type="radio" name="status-filter" id="status-all" value="all" v-model="filters.status">
                        <label for="status-all">Tất cả</label>
                        <input type="radio" name="status-filter" id="status-active" value="active" v-model="filters.status">
                        <label for="status-active">Đang hoạt động</label>
                        <input type="radio" name="status-filter" id="status-inactive" value="inactive" v-model="filters.status">
                        <label for="status-inactive">Ngừng hoạt động</label>
                    </div>
                </div>
            </aside>

            <!-- Main Content (Table and Detail) -->
            <section class="w-full lg:w-3/4">
                <div class="bg-white p-4 rounded-xl shadow-md border border-gray-200">
                    <div class="grid grid-cols-6 gap-4 text-xs font-semibold text-gray-600 border-b pb-1 mb-2">
                        <div class="col-span-2 flex justify-start space-x-8 pl-10">
                            <span class="min-w-0">Mã nhà cung cấp</span>
                            <span class="min-w-0">Tên nhà cung cấp</span>
                        </div>
                        <div class="truncate">Điện thoại</div>
                        <div class="truncate">Email</div>
                        <div class="text-right truncate">Tổng mua</div>
                        <div class="text-right truncate">Trạng thái</div>
                    </div>
                    
                    <div v-if="filteredSuppliers.length > 0">
                        <div v-for="supplier in filteredSuppliers" :key="supplier.id" class="supplier-row-wrapper border border-gray-200 rounded-lg overflow-hidden mb-2">
                             <div class="grid grid-cols-6 gap-4 items-center py-2 px-3 text-sm cursor-pointer transition-colors hover:bg-gray-50"
                                :class="{ 'active-row': selectedSupplierId === supplier.id }"
                                @click="toggleSupplierDetail(supplier.id)">
                                <div class="col-span-2 flex items-center space-x-3">
                                    <input type="checkbox" :checked="selectedSupplierId === supplier.id" @change="toggleSupplierDetail(supplier.id)" @click.stop class="form-checkbox text-red-600 rounded w-4 h-4 focus:ring-red-500">
                                    <i :data-lucide="selectedSupplierId === supplier.id ? 'chevron-down' : 'chevron-right'" class="w-4 h-4 text-gray-500 transition-transform transform"></i>
                                    <span class="font-medium text-gray-800">{{ supplier.id }}</span>
                                    <span class="font-medium text-gray-800" :class="{ 'text-primary': selectedSupplierId === supplier.id }">{{ supplier.name }}</span>
                                </div>
                                <div class="text-gray-600">{{ supplier.phone || '---' }}</div>
                                <div class="text-gray-600">{{ supplier.email || 'Chưa có' }}</div>
                                <div class="text-right font-medium">{{ formatCurrency(supplier.totalPurchase) }}</div>
                                <div class="text-right">
                                    <span class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full" :class="getSupplierStatusClass(supplier.status)">
                                        {{ supplier.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
                                    </span>
                                </div>
                            </div>
                            
                            <div v-if="selectedSupplierId === supplier.id" class="p-3 border-t border-gray-200 bg-white">
                                <div class="flex border-b border-gray-200 mb-3 space-x-5">
                                    <button class="py-1.5 text-sm" :class="activeTab === 'info' ? 'tab-active' : 'text-gray-600 hover:border-b-2 hover:border-gray-300 transition-colors'" @click="activeTab = 'info'">Thông tin</button>
                                    <button class="py-1.5 text-sm" :class="activeTab === 'history' ? 'tab-active' : 'text-gray-600 hover:border-b-2 hover:border-gray-300 transition-colors'" @click="activeTab = 'history'">Lịch sử nhập hàng</button>
                                </div>

                                <div v-show="activeTab === 'info'">
                                     <h3 class="text-lg font-bold text-gray-800 mb-3">
                                        {{ supplier.name }} <span class="text-sm font-normal text-gray-500 ml-2">{{ supplier.id }}</span>
                                    </h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3 mb-4">
                                        <div class="text-sm"><span class="text-gray-500 block">Người tạo:</span><span class="font-medium text-gray-700">{{ supplier.creator }}</span></div>
                                        <div class="text-sm"><span class="text-gray-500 block">Ngày tạo:</span><span class="font-medium text-gray-700">{{ formatDate(supplier.creationDate) }}</span></div>
                                        <div class="text-sm"><span class="text-gray-500 block">Nhóm nhà cung cấp:</span><span class="font-medium text-gray-700">{{ supplier.group || 'Chưa có' }}</span></div>
                                    </div>
                                    <hr class="my-3 border-gray-100">
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
                                        <div class="text-sm"><span class="text-gray-500 block">Điện thoại</span><span class="font-medium text-gray-800">{{ supplier.phone || '---' }}</span></div>
                                        <div class="text-sm"><span class="text-gray-500 block">Email</span><span class="font-medium text-gray-800">{{ supplier.email || 'Chưa có' }}</span></div>
                                        <div class="text-sm col-span-1 md:col-span-2 lg:col-span-3"><span class="text-gray-500 block">Địa chỉ</span><span class="font-medium text-gray-800">{{ [supplier.address, supplier.ward, supplier.cityDistrict].filter(Boolean).join(', ') || 'Chưa có' }}</span></div>
                                    </div>
                                    <div class="mt-4 p-2 bg-gray-50 border border-gray-200 rounded-lg">
                                        <p class="text-xs text-gray-500">Ghi chú:</p><p class="text-sm italic text-gray-600">{{ supplier.notes || 'Chưa có ghi chú' }}</p>
                                    </div>
                                     <div class="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-100">
                                        <button class="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors" @click="openDeleteModal(supplier)">
                                            <i data-lucide="trash-2" class="w-4 h-4"></i><span>Xóa</span>
                                        </button>
                                        <button class="btn-primary flex items-center space-x-1 text-sm" @click="openAddEditModal(supplier)">
                                            <i data-lucide="pencil" class="w-4 h-4"></i><span>Chỉnh sửa</span>
                                        </button>
                                        <button v-if="supplier.status === 'active'" class="flex items-center space-x-1 text-sm font-medium text-gray-600 border border-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors" @click="toggleActivation(supplier.id)">
                                            <i data-lucide="pause-circle" class="w-4 h-4"></i><span>Ngừng hoạt động</span>
                                        </button>
                                        <button v-else class="flex items-center space-x-1 text-sm font-medium text-green-600 border border-green-300 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors" @click="toggleActivation(supplier.id)">
                                            <i data-lucide="play-circle" class="w-4 h-4"></i><span>Kích hoạt lại</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div v-show="activeTab === 'history'">
                                    <div v-if="supplier.transactions && supplier.transactions.filter(t => t.status === 'Đã nhập hàng').length > 0" class="p-4 border border-gray-200 rounded-lg bg-white">
                                        <h4 class="font-semibold text-gray-800 mb-3">Lịch sử giao dịch</h4>
                                        <div class="grid grid-cols-5 gap-4 text-xs font-semibold text-gray-600 border-b pb-2 mb-2">
                                            <div>Mã phiếu</div><div>Thời gian</div><div>Người tạo</div><div class="text-right">Tổng cộng</div><div class="text-right">Trạng thái</div>
                                        </div>
                                        <div>
                                            <div v-for="t in supplier.transactions.filter(tx => tx.status === 'Đã nhập hàng')" :key="t.code" class="grid grid-cols-5 gap-4 items-center py-2 border-b border-gray-100 text-sm">
                                                <div class="font-medium text-red-600 hover:text-red-700 cursor-pointer">{{ t.code }}</div>
                                                <div class="text-gray-600">{{ formatDateTime(t.time) }}</div>
                                                <div class="text-gray-600">{{ t.creator }}</div>
                                                <div class="text-right font-medium">{{ formatCurrency(t.total) }}</div>
                                                <div class="text-right"><span class="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full" :class="getTransactionStatusClass(t.status)">{{ t.status }}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                                        Chưa có giao dịch nào được ghi nhận.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                        Không tìm thấy nhà cung cấp nào phù hợp với bộ lọc.
                    </div>
                </div>
            </section>
        </main>

        <!-- MODALS -->
        <!-- Add/Edit Supplier Modal -->
        <div v-if="isAddEditModalVisible" class="modal fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl">
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 class="text-xl font-bold text-gray-800">{{ editableSupplier.id ? 'Chỉnh sửa Nhà cung cấp' : 'Tạo nhà cung cấp' }}</h3>
                    <button @click="isAddEditModalVisible = false" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <form @submit.prevent="handleSaveSupplier">
                    <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label class="block text-sm font-medium text-gray-700">Tên nhà cung cấp <span class="text-red-500">*</span></label><input type="text" v-model="editableSupplier.name" placeholder="Bắt buộc" class="mt-1 w-full filter-input focus:border-red-500" required></div>
                            <div><label class="block text-sm font-medium text-gray-700">Mã nhà cung cấp</label><input type="text" :value="editableSupplier.id || 'Tự động'" disabled class="mt-1 w-full filter-input bg-gray-100 text-gray-500 cursor-not-allowed"></div>
                            <div><label class="block text-sm font-medium text-gray-700">Điện thoại</label><input type="text" v-model="editableSupplier.phone" class="mt-1 w-full filter-input focus:border-red-500" placeholder="Nhập số điện thoại"></div>
                            <div><label class="block text-sm font-medium text-gray-700">Email</label><input type="email" v-model="editableSupplier.email" class="mt-1 w-full filter-input focus:border-red-500" placeholder="email@gmail.com"></div>
                        </div>
                        <div class="border border-gray-200 rounded-lg"><button type="button" class="w-full text-left p-4 flex justify-between items-center text-base font-semibold text-gray-800 hover:bg-gray-50 transition-colors" @click="e => e.currentTarget.nextElementSibling.classList.toggle('hidden')">Địa chỉ <i data-lucide="chevron-down" class="w-5 h-5 transition-transform transform"></i></button>
                            <div class="p-4 border-t border-gray-200 space-y-4 hidden">
                                <div><label class="block text-sm font-medium text-gray-700">Địa chỉ</label><input type="text" v-model="editableSupplier.address" class="mt-1 w-full filter-input focus:border-red-500" placeholder="Nhập địa chỉ"></div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div><label class="block text-sm font-medium text-gray-700">Khu vực</label><input type="text" v-model="editableSupplier.cityDistrict" class="mt-1 w-full filter-input focus:border-red-500" placeholder="Tìm Tỉnh/Thành phố - Quận/Huyện"></div>
                                    <div><label class="block text-sm font-medium text-gray-700">Phường/Xã</label><input type="text" v-model="editableSupplier.ward" class="mt-1 w-full filter-input focus:border-red-500" placeholder="Tìm Phường/Xã"></div>
                                </div>
                            </div>
                        </div>
                         <div class="border border-gray-200 rounded-lg"><button type="button" class="w-full text-left p-4 flex justify-between items-center text-base font-semibold text-gray-800 hover:bg-gray-50 transition-colors" @click="e => e.currentTarget.nextElementSibling.classList.toggle('hidden')">Nhóm nhà cung cấp, ghi chú <i data-lucide="chevron-down" class="w-5 h-5 transition-transform transform"></i></button>
                            <div class="p-4 border-t border-gray-200 space-y-4 hidden">
                                <div><label class="block text-sm font-medium text-gray-700">Nhóm nhà cung cấp</label><select v-model="editableSupplier.group" class="mt-1 w-full filter-input focus:border-red-500"><option value="">Chọn nhóm nhà cung cấp</option><option v-for="g in supplierGroups" :key="g.name" :value="g.name">{{ g.name }}</option></select></div>
                                <div><label class="block text-sm font-medium text-gray-700">Ghi chú</label><textarea v-model="editableSupplier.notes" rows="3" class="mt-1 w-full filter-input focus:border-red-500" placeholder="Nhập ghi chú"></textarea></div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button type="button" @click="isAddEditModalVisible = false" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Bỏ qua</button>
                        <button type="submit" class="btn-primary text-sm">Lưu</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Add Group Modal -->
        <div v-if="isAddGroupModalVisible" class="modal fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
             <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md">
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 class="text-xl font-bold text-gray-800">Thêm nhóm nhà cung cấp</h3>
                    <button @click="isAddGroupModalVisible = false" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <form @submit.prevent="handleAddGroup">
                    <div class="space-y-4">
                        <div><label for="group-name" class="block text-sm font-medium text-gray-700">Tên nhóm <span class="text-red-500">*</span></label><input type="text" v-model="newGroup.name" placeholder="Bắt buộc" class="mt-1 w-full filter-input focus:border-red-500" required></div>
                        <div><label for="group-notes" class="block text-sm font-medium text-gray-700">Ghi chú</label><textarea v-model="newGroup.notes" rows="3" class="mt-1 w-full filter-input focus:border-red-500" placeholder="Nhập ghi chú (không bắt buộc)"></textarea></div>
                    </div>
                    <div class="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button type="button" @click="isAddGroupModalVisible = false" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Bỏ qua</button>
                        <button type="submit" class="btn-primary text-sm">Lưu</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Delete Modal -->
        <div v-if="isDeleteModalVisible" class="modal fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <div class="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
                <div class="flex justify-between items-start border-b pb-3 mb-4">
                    <h3 class="text-xl font-bold text-red-600 flex items-center"><i data-lucide="alert-triangle" class="w-6 h-6 mr-2 text-red-500"></i>Xác nhận xóa</h3>
                    <button @click="isDeleteModalVisible = false" class="text-gray-400 hover:text-gray-600"><i data-lucide="x" class="w-6 h-6"></i></button>
                </div>
                <p class="text-gray-700 mb-6">Bạn có chắc chắn muốn xóa nhà cung cấp **<span class="font-semibold">{{ supplierToDelete.name }}</span>** (ID: <span class="font-mono text-xs">{{ supplierToDelete.id }}</span>)? Thao tác này không thể hoàn tác.</p>
                <div class="mt-6 flex justify-end space-x-3">
                    <button type="button" @click="isDeleteModalVisible = false" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">Hủy</button>
                    <button type="button" @click="handleDeleteSupplier" class="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Xóa vĩnh viễn</button>
                </div>
            </div>
        </div>

        <!-- Message Box -->
        <div v-if="message.visible" class="fixed bottom-4 right-4 z-50 w-72 p-4 text-white rounded-lg shadow-lg transition-opacity duration-300" :class="{ 'bg-red-600': message.type === 'success', 'bg-red-800': message.type === 'error' }">
            {{ message.text }}
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue';
import { initialSuppliers, initialSupplierGroups } from './data.js';
import { formatCurrency, formatDate, formatDateTime, parseNumber, formatNumberInput } from './utils.js';

// --- STATE ---
const suppliers = ref(JSON.parse(JSON.stringify(initialSuppliers)));
const supplierGroups = ref(JSON.parse(JSON.stringify(initialSupplierGroups)));
const selectedSupplierId = ref('NCC000001');
const activeTab = ref('info');

const filters = reactive({
    search: '',
    group: 'all',
    totalPurchaseMin: '',
    totalPurchaseMax: '',
    status: 'all',
    timeFilter: 'all',
    customDateStart: '',
});

// Modal Visibility
const isAddEditModalVisible = ref(false);
const isAddGroupModalVisible = ref(false);
const isDeleteModalVisible = ref(false);

// Data for Modals
const editableSupplier = ref(null);
const newGroup = reactive({ name: '', notes: '' });
const supplierToDelete = ref(null);

// Message Box State
const message = reactive({ text: '', type: 'success', visible: false });


// --- COMPUTED ---
const filteredSuppliers = computed(() => {
    // ... (rest of computed is the same)
    const { search, group, status, timeFilter, customDateStart } = filters;
    const searchLower = search.toLowerCase().trim();
    const purchaseMin = parseNumber(filters.totalPurchaseMin);
    const purchaseMax = filters.totalPurchaseMax ? parseNumber(filters.totalPurchaseMax) : Infinity;

    let timeMin = 0;
    if (timeFilter === 'custom' && customDateStart) {
        const date = new Date(customDateStart);
        date.setHours(0, 0, 0, 0);
        timeMin = date.getTime();
    }

    const list = suppliers.value.filter(s => {
        const searchMatch = !searchLower ||
            s.id.toLowerCase().includes(searchLower) ||
            s.name.toLowerCase().includes(searchLower) ||
            s.phone.includes(searchLower);

        const groupMatch = group === 'all' || s.group === group;
        const statusMatch = status === 'all' || s.status === status;
        const purchaseMatch = s.totalPurchase >= purchaseMin && s.totalPurchase <= purchaseMax;
        const timeMatch = s.creationDate >= timeMin;

        return searchMatch && groupMatch && statusMatch && purchaseMatch && timeMatch;
    });
    return list.sort((a, b) => b.creationDate - a.creationDate);
});

// --- METHODS ---
function showMessage(text, type = 'success', duration = 3000) {
    message.text = text;
    message.type = type;
    message.visible = true;
    setTimeout(() => { message.visible = false; }, duration);
}

function toggleSupplierDetail(id) {
    if (selectedSupplierId.value === id) {
        selectedSupplierId.value = null;
    } else {
        selectedSupplierId.value = id;
        activeTab.value = 'info';
    }
}

function updateFormattedNumberFilter(key, event) {
    formatNumberInput(event);
    filters[key] = event.target.value;
}

function getSupplierStatusClass(status) { return status === 'active' ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-200 text-gray-600 font-medium'; }
function getTransactionStatusClass(status) { return status === 'Đã nhập hàng' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'; }

function openAddEditModal(supplier = null) {
    if (supplier) {
        editableSupplier.value = { ...supplier };
    } else {
        editableSupplier.value = { name: '', phone: '', email: '', address: '', cityDistrict: '', ward: '', group: '', notes: '' };
    }
    isAddEditModalVisible.value = true;
}

function handleSaveSupplier() {
    if (!editableSupplier.value.name) {
        showMessage('Tên nhà cung cấp là bắt buộc!', 'error');
        return;
    }
    if (editableSupplier.value.id) {
        const index = suppliers.value.findIndex(s => s.id === editableSupplier.value.id);
        if (index !== -1) { suppliers.value[index] = editableSupplier.value; }
        showMessage(`Đã cập nhật nhà cung cấp: ${editableSupplier.value.name}.`);
    } else {
        const newIdNumber = suppliers.value.length > 0 ? Math.max(...suppliers.value.map(s => parseInt(s.id.substring(3)))) + 1 : 1;
        const newId = 'NCC' + newIdNumber.toString().padStart(6, '0');
        const newSupplier = { ...editableSupplier.value, id: newId, totalPurchase: 0, status: 'active', creator: 'Current User', creationDate: Date.now(), transactions: [] };
        suppliers.value.unshift(newSupplier);
        showMessage(`Đã tạo nhà cung cấp mới: ${newSupplier.name}.`);
    }
    isAddEditModalVisible.value = false;
}

function openDeleteModal(supplier) {
    supplierToDelete.value = supplier;
    isDeleteModalVisible.value = true;
}

function handleDeleteSupplier() {
    if (!supplierToDelete.value) return;
    suppliers.value = suppliers.value.filter(s => s.id !== supplierToDelete.value.id);
    showMessage(`Đã xóa nhà cung cấp: ${supplierToDelete.value.name}.`);
    if (selectedSupplierId.value === supplierToDelete.value.id) { selectedSupplierId.value = null; }
    isDeleteModalVisible.value = false;
}

function handleAddGroup() {
    if (!newGroup.name) {
        showMessage('Tên nhóm không được để trống!', 'error');
        return;
    }
    if (supplierGroups.value.some(g => g.name === newGroup.name)) {
        showMessage(`Nhóm "${newGroup.name}" đã tồn tại.`, 'error');
        return;
    }
    supplierGroups.value.push({ ...newGroup });
    supplierGroups.value.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    showMessage(`Đã tạo nhóm: ${newGroup.name}.`);
    newGroup.name = ''; newGroup.notes = '';
    isAddGroupModalVisible.value = false;
}

function toggleActivation(supplierId) {
    const supplier = suppliers.value.find(s => s.id === supplierId);
    if (supplier) {
        supplier.status = supplier.status === 'active' ? 'inactive' : 'active';
        showMessage(`Đã ${supplier.status === 'active' ? 'kích hoạt' : 'ngừng hoạt động'} nhà cung cấp ${supplier.name}.`);
    }
}

function handleExport() {
    const exportData = filteredSuppliers.value.map(s => ({
        'Mã nhà cung cấp': s.id, 'Tên nhà cung cấp': s.name, 'Số điện thoại': s.phone || '', 'Email': s.email || '', 'Nhóm NCC': s.group || 'Chưa có nhóm', 'Tổng mua (VND)': s.totalPurchase, 'Trạng thái': s.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động', 'Địa chỉ': [s.address, s.ward, s.cityDistrict].filter(Boolean).join(', '), 'Ghi chú': s.notes || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachNhaCungCap");
    const fileName = `Danh_sach_NCC_${formatDate(Date.now()).replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showMessage(`Đã xuất ${exportData.length} nhà cung cấp ra file Excel.`);
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonArr = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (jsonArr.length < 2) { showMessage('File Excel không có dữ liệu.', 'error'); return; }
            const headers = jsonArr[0].map(h => String(h).trim());
            const importedSuppliers = jsonArr.slice(1).map((row, index) => {
                const newSupplierData = {};
                headers.forEach((h, i) => {
                    if (h === 'Tên nhà cung cấp') newSupplierData.name = row[i];
                    if (h === 'Số điện thoại') newSupplierData.phone = row[i];
                    if (h === 'Email') newSupplierData.email = row[i];
                    if (h === 'Nhóm NCC') newSupplierData.group = row[i];
                    if (h === 'Địa chỉ') newSupplierData.address = row[i];
                    if (h === 'Ghi chú') newSupplierData.notes = row[i];
                });
                if (!newSupplierData.name || !String(newSupplierData.name).trim()) return null;
                const currentMaxId = suppliers.value.length > 0 ? Math.max(...suppliers.value.map(s => parseInt(s.id.substring(3)))) : 0;
                const newId = 'NCC' + (currentMaxId + index + 1).toString().padStart(6, '0');
                return { ...newSupplierData, id: newId, totalPurchase: 0, status: 'active', creator: 'Import User', creationDate: Date.now(), transactions: [] };
            }).filter(Boolean);
            suppliers.value.unshift(...importedSuppliers);
            importedSuppliers.forEach(s => {
                if (s.group && !supplierGroups.value.some(g => g.name === s.group)) {
                    supplierGroups.value.push({ name: s.group, notes: 'Tạo tự động từ Import.' });
                }
            });
            showMessage(`Đã nhập thành công ${importedSuppliers.length} nhà cung cấp.`);
        } catch (error) { console.error('Lỗi import:', error); showMessage('Lỗi xử lý file Excel.', 'error'); }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = null;
}

// --- LIFECYCLE & WATCHERS ---
onMounted(() => { if (window.lucide) window.lucide.createIcons(); });
watch([isAddEditModalVisible, isAddGroupModalVisible, isDeleteModalVisible, selectedSupplierId], () => {
    nextTick(() => { if (window.lucide) window.lucide.createIcons(); });
}, { deep: true });
</script>

