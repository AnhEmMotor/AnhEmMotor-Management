<template>
  <!-- 1. Thanh Header (Top Bar) -->
  <header
    class="flex items-center justify-between bg-white shadow-md py-2 px-4 border-b border-gray-200"
  >
    <h1 class="text-lg font-semibold text-gray-800 hidden sm:block">Nhập hàng</h1>

    <!-- Ô tìm kiếm và lọc -->
    <div class="flex items-center space-x-2 flex-grow mx-4 max-w-md">
      <div class="relative w-full">
        <input
          type="text"
          placeholder="Tìm kiếm phiếu nhập..."
          class="w-full p-1.5 pl-8 border border-gray-300 rounded-md text-xs focus:ring-red-500 focus:border-red-500"
        />
        <svg
          class="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <button
        class="p-1.5 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8h12a2 2 0 002-2v-3a2 2 0 00-2-2H6a2 2 0 00-2 2v3a2 2 0 002 2z"
          ></path>
        </svg>
      </button>
    </div>

    <!-- Các nút hành động -->
    <div class="flex items-center space-x-2">
      <a
        href="#"
        class="flex items-center space-x-1 bg-red-600 text-white py-1.5 px-3 rounded-md hover:bg-red-700 text-xs font-medium transition duration-150"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        <span>Nhập hàng</span>
      </a>
      <div class="relative">
        <button
          class="flex items-center space-x-1 bg-gray-100 text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-200 text-xs font-medium transition duration-150 border border-gray-300"
        >
          <span>Xuất file</span>
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>
      </div>
      <!-- Icons bên phải -->
      <button
        class="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 hidden sm:block"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8.228 9.247a3 3 0 100 5.506 3 3 0 100-5.506z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 100 6 3 3 0 000-6z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9a2 2 0 012 2v2a2 2 0 01-2 2h-1a2 2 0 01-2-2v-2a2 2 0 012-2h1z"
          ></path>
        </svg>
      </button>
      <button
        class="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-100 hidden sm:block"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5.121 17.804A13.935 13.935 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 14c-5.143 0-9.574 3.007-11.233 7.558.175.247.368.488.577.726a13.935 13.935 0 0010.656 2.716c3.279.172 6.556-.27 9.544-1.314.28-.103.55-.21.807-.323-1.659-4.551-6.09-7.558-11.233-7.558z"
          ></path>
        </svg>
      </button>
    </div>
  </header>
</template>
