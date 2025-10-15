<template>
  <header
    class="flex items-center justify-between bg-white shadow-md py-2 px-4 border-b border-gray-200"
  >
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
    </div>
  </header>
</template>
