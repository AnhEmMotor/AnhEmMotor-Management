<template>
  <div>
    <div
      class="lg:hidden fixed top-0 left-0 w-full bg-white shadow-md z-30 h-16 flex items-center justify-between px-4"
    >
      <div class="flex items-center h-full py-2">
        <img src="/anhemmotor.webp" alt="AnhEm Motor Admin" class="h-full w-auto object-contain" />
      </div>
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-2">
          <template v-if="authStore.user?.avatarUrl">
            <img
              :src="
                authStore.user.avatarUrl.startsWith('http')
                  ? authStore.user.avatarUrl
                  : `${apiUrl}${authStore.user.avatarUrl.startsWith('/') ? '' : '/'}${authStore.user.avatarUrl}`
              "
              alt="Avatar"
              class="w-8 h-8 rounded-full object-cover shrink-0"
            />
          </template>
          <template v-else>
            <div
              class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm shrink-0"
            >
              {{ authStore.user?.fullName?.charAt(0)?.toUpperCase() || 'A' }}
            </div>
          </template>
          <span class="text-sm font-medium text-gray-700 truncate max-w-[120px]">
            {{ authStore.user?.fullName }}
          </span>
        </div>

        <button
          @click="handleLogout"
          class="text-gray-500 hover:text-red-600 transition-colors p-1"
          title="Đăng xuất"
        >
          <IconLogout class="h-6 w-6" />
        </button>

        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="text-gray-600 focus:outline-none ml-2"
        >
          <IconMenu class="w-8 h-8" />
        </button>
      </div>
    </div>

    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 bg-black/50 z-30 lg:hidden"
      @click="isMobileMenuOpen = false"
    ></div>

    <div
      :class="[
        'fixed left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col z-40 transition-transform duration-300 ease-in-out',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <div class="p-6 flex flex-col items-center flex-shrink-0 relative">
        <button
          @click="isMobileMenuOpen = false"
          class="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-gray-700"
        >
          <IconCloseLine class="w-6 h-6" />
        </button>

        <div class="mb-8 mt-2 lg:mt-8 px-4">
          <img src="/anhemmotor.webp" alt="AnhEm Motor Admin" class="h-16 w-auto object-contain" />
        </div>
      </div>

      <nav class="w-full flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <ul class="space-y-1">
          <li>
            <RouterLink
              to="/"
              class="flex items-center space-x-3 p-3 rounded-lg w-full font-medium"
              active-class=""
              exact
              :class="
                route.path === '/'
                  ? 'bg-red-50 text-red-700 border-l-[3px] border-[#e31837]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#e31837] border-l-[3px] border-transparent'
              "
              @click="closeMobileMenu"
            >
              <IconHome
                class="flex-shrink-0"
                :class="route.path === '/' ? 'text-red-600' : 'text-gray-500'"
              />
              <span>Trang chủ</span>
            </RouterLink>
          </li>

          <li
            v-if="
              hasAnyPermission([
                Permissions.BrandsView,
                Permissions.ProductCategoriesView,
                Permissions.ProductsView,
              ])
            "
          >
            <button
              @click="toggleGroup('productGroup')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-[#e31837] border-l-[3px] border-transparent"
              :class="{ 'text-red-700 bg-red-50/30': isGroupActive('productGroup') }"
            >
              <div class="flex items-center space-x-3">
                <IconProduct
                  class="flex-shrink-0"
                  :class="isGroupActive('productGroup') ? 'text-[#e31837]' : 'text-gray-500'"
                />
                <span>Sản phẩm</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('productGroup')" />
            </button>
            <ul v-if="openGroups.includes('productGroup')" class="mt-1 space-y-1 pl-3">
              <li v-if="hasPermission(Permissions.BrandsView)">
                <RouterLink
                  to="/brands"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/brands'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#e31837]'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Thương hiệu</span>
                </RouterLink>
              </li>
              <li v-if="hasAnyPermission([Permissions.ProductCategoriesView])">
                <button
                  @click.stop="toggleSubGroup('genreSubGroup')"
                  class="flex items-center justify-between space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-[#e31837]"
                  :class="{ 'text-red-700': isSubGroupActive('genreSubGroup') }"
                >
                  <div class="flex items-center space-x-3">
                    <span>Thể loại</span>
                  </div>
                  <IconUpArrow :isOpen="openSubGroups.includes('genreSubGroup')" class="w-3 h-3" />
                </button>
                <ul v-if="openSubGroups.includes('genreSubGroup')" class="mt-1 space-y-1 pl-3 border-l border-gray-100 ml-2">
                  <li v-if="hasPermission(Permissions.ProductCategoriesView)">
                    <RouterLink
                      to="/categories"
                      class="flex items-center space-x-3 py-1.5 px-3 rounded-lg w-full text-xs font-medium"
                      active-class="bg-red-50 text-red-700"
                      :class="
                        route.path === '/categories'
                          ? 'bg-red-50 text-red-700'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-[#e31837]'
                      "
                      @click="closeMobileMenu"
                    >
                      <span>Loại sản phẩm</span>
                    </RouterLink>
                  </li>
                  <li v-if="hasPermission(Permissions.ProductCategoriesView)">
                    <RouterLink
                      to="/vehicle-types"
                      class="flex items-center space-x-3 py-1.5 px-3 rounded-lg w-full text-xs font-medium"
                      active-class="bg-red-50 text-red-700"
                      :class="
                        route.path === '/vehicle-types'
                          ? 'bg-red-50 text-red-700'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-red-600'
                      "
                      @click="closeMobileMenu"
                    >
                      <span>Loại xe</span>
                    </RouterLink>
                  </li>
                </ul>
              </li>
              <li v-if="hasPermission(Permissions.ProductsView)">
                <RouterLink
                  to="/products"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path.startsWith('/products')
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#e31837]'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Danh sách sản phẩm</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li
            v-if="
              hasAnyPermission([
                Permissions.SuppliersView,
                Permissions.InputsView,
                Permissions.ProductsEditPrice,
              ])
            "
          >
            <button
              @click="toggleGroup('warehouse')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-[#e31837] border-l-[3px] border-transparent"
              :class="{ 'text-red-700 bg-red-50/30': isGroupActive('warehouse') }"
            >
              <div class="flex items-center space-x-3">
                <IconWarehouse
                  class="flex-shrink-0"
                  :class="isGroupActive('warehouse') ? 'text-red-600' : 'text-gray-500'"
                />
                <span>Kho vận</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('warehouse')" />
            </button>

            <ul v-if="openGroups.includes('warehouse')" class="mt-1 space-y-1 pl-3">
              <li v-if="hasPermission(Permissions.SuppliersView)">
                <RouterLink
                  to="/suppliers"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/suppliers'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Đối tác & NCC</span>
                </RouterLink>
              </li>
              <li v-if="hasPermission(Permissions.InputsView)">
                <RouterLink
                  to="/inputs"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/inputs'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Nhập kho</span>
                </RouterLink>
              </li>
              <li v-if="hasPermission(Permissions.SuppliersView)">
                <RouterLink
                  to="/debts"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/debts'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Công nợ & Cam kết</span>
                </RouterLink>
              </li>
              <li v-if="hasPermission(Permissions.ProductsEditPrice)">
                <RouterLink
                  to="/price-management"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/price-management'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Thiết lập giá</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li v-if="hasPermission(Permissions.OutputsView)">
            <RouterLink
              to="/orders"
              class="flex items-center space-x-3 p-3 rounded-lg w-full font-medium"
              active-class="bg-red-50 text-red-700 border-l-[3px] border-[#e31837]"
              :class="
                route.path.startsWith('/orders')
                  ? 'bg-red-50 text-red-700 border-l-[3px] border-[#e31837]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-[#e31837] border-l-[3px] border-transparent'
              "
              @click="closeMobileMenu"
            >
              <IconOrder
                class="flex-shrink-0"
                :class="route.path.startsWith('/orders') ? 'text-red-600' : 'text-gray-500'"
              />
              <span>Đơn hàng</span>
            </RouterLink>
          </li>

          <li v-if="hasAnyPermission([Permissions.UsersView, Permissions.RolesView])">
            <button
              @click="toggleGroup('user')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent"
              :class="{ 'text-red-700': isGroupActive('user') }"
            >
              <div class="flex items-center space-x-3">
                <IconUser
                  class="flex-shrink-0 w-6 h-6"
                  :class="isGroupActive('user') ? 'text-red-600' : 'text-gray-500'"
                />
                <span>Người dùng</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('user')" />
            </button>

            <ul v-if="openGroups.includes('user')" class="mt-1 space-y-1 pl-3">
              <li v-if="hasPermission(Permissions.UsersView)">
                <RouterLink
                  to="/users"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/users'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Danh sách</span>
                </RouterLink>
              </li>
              <li v-if="hasPermission(Permissions.RolesView)">
                <RouterLink
                  to="/permissions"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/permissions'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Vai trò & quyền hạn</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- Section: Nhân sự moved here -->
          <li v-if="true">
            <button
              @click="toggleGroup('hr')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-[#e31837] border-l-[3px] border-transparent"
              :class="{ 'text-red-700 bg-red-50/30': isGroupActive('hr') }"
            >
              <div class="flex items-center space-x-3">
                <IconReport
                  class="flex-shrink-0"
                  :class="isGroupActive('hr') ? 'text-[#e31837]' : 'text-gray-500'"
                />
                <span>Nhân Sự</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('hr')" />
            </button>

            <ul v-if="openGroups.includes('hr')" class="mt-1 space-y-1 pl-3">
              <li>
                <RouterLink
                  to="/hr/employees"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path.startsWith('/hr/employees')
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Hồ sơ nhân sự</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/hr/commission-policy"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/hr/commission-policy'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Chính sách hoa hồng</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/hr/payroll"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/hr/payroll'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Bảng Lương</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/hr/kpi"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/hr/kpi'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Quản lý KPI</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li
            v-if="
              true ||
              hasAnyPermission([
                Permissions.ContactsView,
                Permissions.BookingsView,
              ])
            "
          >
            <button
              @click="toggleGroup('crm')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent"
              :class="{ 'text-red-700': isGroupActive('crm') }"
            >
              <div class="flex items-center space-x-3">
                <IconUser
                  class="flex-shrink-0 w-6 h-6"
                  :class="isGroupActive('crm') ? 'text-red-600' : 'text-gray-500'"
                />
                <span>Khách Hàng</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('crm')" />
            </button>

            <ul v-if="openGroups.includes('crm')" class="mt-1 space-y-1 pl-3">
              <li v-if="hasPermission(Permissions.LeadsView)">
                <RouterLink
                  to="/leads"
                  class="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-medium transition-all group"
                  :class="[
                    route.path === '/leads'
                      ? 'bg-red-50 text-red-600 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                  ]"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    :class="route.path === '/leads' ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-gray-200'"
                  >
                    <font-awesome-icon icon="users-rays" class="text-xs" />
                  </div>
                  <span>Khách hàng tiềm năng</span>
                </RouterLink>
              </li>
              <li v-if="hasPermission(Permissions.UsersView)">
                <RouterLink
                  to="/customers"
                  class="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-medium transition-all group"
                  :class="[
                    route.path === '/customers'
                      ? 'bg-red-50 text-red-600 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                  ]"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    :class="route.path === '/customers' ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-gray-200'"
                  >
                    <font-awesome-icon icon="address-card" class="text-xs" />
                  </div>
                  <span>Hồ sơ khách hàng</span>
                </RouterLink>
              </li>
              <li v-if="true || hasPermission(Permissions.ContactsView)">
                <RouterLink
                  to="/pipeline"
                  class="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-medium transition-all group"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/pipeline'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    :class="route.path === '/pipeline' ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-gray-200'"
                  >
                    <font-awesome-icon icon="chart-line" class="text-xs" />
                  </div>
                  <span>Tiến độ mua hàng </span>
                </RouterLink>
              </li>
              <li v-if="true || hasPermission(Permissions.ContactsView)">
                <RouterLink
                  to="/vehicles"
                  class="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-medium transition-all group"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/vehicles'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    :class="route.path === '/vehicles' ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-gray-200'"
                  >
                    <font-awesome-icon icon="car" class="text-xs" />
                  </div>
                  <span>Quản lý Tài sản </span>
                </RouterLink>
              </li>
              <li v-if="true || hasPermission(Permissions.ContactsView)">
                <RouterLink
                  to="/loyalty"
                  class="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-medium transition-all group"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/loyalty'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    :class="route.path === '/loyalty' ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-gray-200'"
                  >
                    <font-awesome-icon icon="gift" class="text-xs" />
                  </div>
                  <span>Chăm sóc & Ưu đãi </span>
                </RouterLink>
              </li>
              <li v-if="true || hasPermission(Permissions.ContactsView)">
                <RouterLink
                  to="/contacts"
                  class="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-medium transition-all group"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/contacts'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    :class="route.path === '/contacts' ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-gray-200'"
                  >
                    <font-awesome-icon icon="comment-dots" class="text-xs" />
                  </div>
                  <span>Quản lý liên hệ </span>
                </RouterLink>
              </li>
              <li v-if="true || hasPermission(Permissions.BookingsView)">
                <RouterLink
                  to="/bookings"
                  class="flex items-center space-x-3 p-2.5 rounded-lg text-sm font-medium transition-all group"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/bookings'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    :class="route.path === '/bookings' ? 'bg-red-100' : 'bg-gray-100 group-hover:bg-gray-200'"
                  >
                    <font-awesome-icon icon="calendar-check" class="text-xs" />
                  </div>
                  <span>Đặt lịch & Lái thử </span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <!-- Tạm thời mở để kiểm tra -->
          <li v-if="true || hasAnyPermission([Permissions.NewsView, Permissions.BannersView])">
            <button
              @click="toggleGroup('marketing')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-[#e31837] border-l-[3px] border-transparent"
              :class="{ 'text-red-700 bg-red-50/30': isGroupActive('marketing') }"
            >
              <div class="flex items-center space-x-3">
                <IconReport
                  class="flex-shrink-0"
                  :class="isGroupActive('marketing') ? 'text-red-600' : 'text-gray-500'"
                />
                <span>Nội dung</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('marketing')" />
            </button>

            <ul v-if="openGroups.includes('marketing')" class="mt-1 space-y-1 pl-3">
              <li v-if="true || hasPermission(Permissions.NewsView)">
                <RouterLink
                  to="/news"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/news'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Bài viết & Tin tức</span>
                </RouterLink>
              </li>
              <li v-if="true || hasPermission(Permissions.BannersView)">
                <RouterLink
                  to="/banners"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/banners'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Banner & Khuyến mãi</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li v-if="hasPermission(Permissions.StatisticalView)">
            <button
              @click="toggleGroup('reports')"
              class="flex items-center justify-between space-x-3 p-3 rounded-lg w-full font-medium cursor-pointer text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent"
              :class="{ 'text-red-700': isGroupActive('reports') }"
            >
              <div class="flex items-center space-x-3">
                <IconReport
                  class="flex-shrink-0"
                  :class="isGroupActive('reports') ? 'text-red-600' : 'text-gray-500'"
                />
                <span>Thống kê</span>
              </div>
              <IconUpArrow :isOpen="openGroups.includes('reports')" />
            </button>

            <ul v-if="openGroups.includes('reports')" class="mt-1 space-y-1 pl-3">
              <li>
                <RouterLink
                  to="/statistics-warehouse"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/statistics-warehouse'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Tồn kho</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/statistics-revenue"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/statistics-revenue'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Doanh thu</span>
                </RouterLink>
              </li>
              <li>
                <RouterLink
                  to="/statistics-product"
                  class="flex items-center space-x-3 py-2 px-3 rounded-lg w-full text-sm font-medium"
                  active-class="bg-red-50 text-red-700"
                  :class="
                    route.path === '/statistics-product'
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                  "
                  @click="closeMobileMenu"
                >
                  <span>Sản phẩm</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li v-if="hasPermission(Permissions.SettingsView)">
            <RouterLink
              to="/settings"
              class="flex items-center space-x-3 p-3 rounded-lg w-full font-medium"
              active-class="bg-red-50 text-red-700 border-l-4 border-red-600"
              :class="
                route.path.startsWith('/settings')
                  ? 'bg-red-50 text-red-700 border-l-4 border-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-red-600 border-l-4 border-transparent'
              "
              @click="closeMobileMenu"
            >
              <IconSettings
                class="flex-shrink-0"
                :class="route.path.startsWith('/settings') ? 'text-red-600' : 'text-gray-500'"
              />
              <span>Cài đặt</span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="mt-auto w-full p-4 border-t border-gray-100 bg-gray-50/50">
        <LoadingOverlay :show="loading" message="Đang đăng xuất..." />
        <div class="relative" @mouseleave="isUserMenuOpen = false">
          <div
            v-show="isUserMenuOpen"
            class="user-menu absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:w-full after:h-2 after:bg-transparent"
          >
            <RouterLink
              to="/profile?tab=profile"
              class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <IconUserProfile class="h-5 w-5" />
              Hồ sơ cá nhân
            </RouterLink>
            <RouterLink
              to="/profile?tab=password"
              class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <IconLock class="h-5 w-5" />
              Đổi mật khẩu
            </RouterLink>
          </div>

          <div
            class="flex items-center gap-3 w-full rounded-xl p-2 cursor-pointer hover:bg-white transition-colors border border-transparent hover:border-gray-100"
            @mouseenter="isUserMenuOpen = true"
          >
            <template v-if="authStore.user?.avatarUrl">
              <img
                :src="
                  authStore.user.avatarUrl.startsWith('http')
                    ? authStore.user.avatarUrl
                    : `${apiUrl}${authStore.user.avatarUrl.startsWith('/') ? '' : '/'}${authStore.user.avatarUrl}`
                "
                alt="Avatar"
                class="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
              />
            </template>
            <template v-else>
              <div
                class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0"
              >
                {{ authStore.user?.fullName?.charAt(0)?.toUpperCase() || 'A' }}
              </div>
            </template>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ authStore.user?.fullName || 'Admin User' }}
              </p>
              <p class="text-xs text-gray-500 truncate" :title="authStore.user?.email">
                {{ authStore.user?.email }}
              </p>
            </div>

            <button
              @click.stop="handleLogout"
              class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 shrink-0 z-10"
              title="Đăng xuất"
            >
              <IconLogout class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-menu::after {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 100%;
  height: 8px;
  background-color: transparent;
}
</style>

<script setup lang="js">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import IconHome from '@/assets/icons/IconHome.svg'
import IconReport from '@/assets/icons/IconReport.svg'
import IconProduct from '@/assets/icons/IconProduct.svg'
import IconUser from '@/assets/icons/IconUser.svg'
import IconOrder from '@/assets/icons/IconOrder.svg'
import IconUpArrow from '@components/icons/IconUpArrow.vue'
import IconWarehouse from '@/assets/icons/IconWarehouse.svg'
import IconSettings from '@/assets/icons/IconSettings.svg'
import IconLogout from '@/assets/icons/logout.svg'
import IconMenu from '@/assets/icons/menu.svg'
import IconCloseLine from '@/assets/icons/close-line.svg'
import IconUserProfile from '@/assets/icons/user-profile.svg'
import IconLock from '@/assets/icons/login-lock.svg'
import { useAuthStore } from '@stores/auth.store'
import { useRouter, useRoute } from 'vue-router'
import LoadingOverlay from '@components/ui/LoadingOverlay.vue'
import { Permissions } from '@constants/permissions'
import { usePermission } from '@composables/usePermission'

const { hasPermission, hasAnyPermission } = usePermission()
const apiUrl = import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT || 'http://localhost:5000'

const openGroups = ref([])
const openSubGroups = ref([])
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

const handleLogout = async () => {
  loading.value = true
  try {
    await authStore.logout()
    router.push('/login')
  } finally {
    loading.value = false
  }
}

const groupRoutes = {
  productGroup: ['/products', '/brands', '/categories', '/vehicle-types'],
  warehouse: ['/suppliers', '/inputs', '/price-management'],
  user: ['/users', '/permissions'],
  reports: ['/statistics-warehouse', '/statistics-revenue', '/statistics-product'],
  marketing: ['/news', '/banners'],
  crm: ['/contacts', '/bookings', '/leads', '/pipeline', '/vehicles', '/loyalty'],
  hr: ['/hr/employees', '/hr/commission-policy', '/hr/payroll', '/hr/kpi'],
}

const subGroupRoutes = {
  genreSubGroup: ['/categories', '/vehicle-types'],
}

const toggleGroup = (group) => {
  const index = openGroups.value.indexOf(group)
  if (index > -1) {
    openGroups.value = []
  } else {
    openGroups.value = [group]
  }
}

const toggleSubGroup = (subGroup) => {
  const index = openSubGroups.value.indexOf(subGroup)
  if (index > -1) {
    openSubGroups.value = []
  } else {
    openSubGroups.value = [subGroup]
  }
}

const isGroupActive = (group) => {
  return groupRoutes[group].some((path) => route.path.startsWith(path))
}

const isSubGroupActive = (subGroup) => {
  return subGroupRoutes[subGroup].some((path) => route.path.startsWith(path))
}

const openActiveGroup = (path) => {
  for (const groupName in groupRoutes) {
    if (groupRoutes[groupName].some((p) => path.startsWith(p))) {
      openGroups.value = [groupName]
      
      // Also check sub-groups
      for (const subGroupName in subGroupRoutes) {
        if (subGroupRoutes[subGroupName].some((p) => path.startsWith(p))) {
          openSubGroups.value = [subGroupName]
          break
        }
      }
      return
    }
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

watch(
  () => route.path,
  (newPath) => {
    openActiveGroup(newPath)
  },
  { immediate: true },
)

const checkScreenSize = () => {
  if (window.innerWidth >= 1024) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>



