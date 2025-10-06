<template>
  <div class="bg-white p-6 rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold mb-4 text-red-800">Phân Tích Doanh Thu Chi Tiết</h1>

    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div>
        <span class="text-sm font-medium text-red-700 mr-2">Khoảng Thời Gian:</span>
        <div class="inline-flex rounded-md shadow-sm">
          <button
            v-for="period in timePeriods"
            :key="period.days"
            @click="activePeriod = period.days"
            :class="[
              'filter-btn px-4 py-2 text-sm font-medium border border-red-300 transition-colors duration-200',
              activePeriod === period.days 
                ? 'active text-white bg-red-600 hover:bg-red-700' 
                : 'text-red-700 bg-white hover:bg-red-50',
              { 'rounded-l-md': period.days === 7 },
              { 'rounded-r-md': period.days === 90 },
              { 'border-t border-b border-red-300': period.days === 30 }
            ]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      <div>
        <label for="car-brand" class="text-sm font-medium text-red-700 mr-2">Hãng Xe:</label>
        <select 
          id="car-brand"
          v-model="selectedBrand"
          class="rounded-md border-red-300 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
        >
          <option v-for="brand in carBrands" :key="brand" :value="brand">{{ brand }}</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-3 bg-white p-6 rounded-xl shadow-md h-96">
        <h3 class="text-lg font-semibold text-red-700 mb-4">Xu Hướng Doanh Thu</h3>
        <div id="revenue-trend-chart" ref="trendChartContainer" class="w-full h-full">
            <p class="text-center text-red-500 h-full flex items-center justify-center">Biểu đồ xu hướng doanh thu sẽ được hiển thị ở đây.</p>
        </div>
      </div>

      <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-md h-96">
        <h3 class="text-lg font-semibold text-red-700 mb-4">Doanh Thu Theo Hãng Xe</h3>
        <div id="brand-revenue-chart" ref="brandChartContainer" class="w-full h-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
// Đã xóa: import * as d3 from 'd3'; 
// Thay thế bằng việc tải qua CDN ở cuối file để tránh lỗi module resolve

// State Management
const activePeriod = ref(7);
const selectedBrand = ref('Tất cả');
const trendChartContainer = ref(null);
const brandChartContainer = ref(null);

// Mock Data
const timePeriods = [
  { label: '7 Ngày', days: 7 },
  { label: '30 Ngày', days: 30 },
  { label: '90 Ngày', days: 90 }
];
const carBrands = ['Tất cả', 'HonDa', 'YaMaHa', 'SuZuKi', 'KaWaSaKi'];
const brandRevenueData = [
    { brand: 'VinFast', revenue: 450 }, 
    { brand: 'Hyundai', revenue: 380 },
    { brand: 'Toyota', revenue: 320 }, 
    { brand: 'Ford', revenue: 280 },
    { brand: 'Mazda', revenue: 250 }, 
    { brand: 'Kia', revenue: 210 },
];

/**
 * Hàm vẽ Biểu đồ Doanh Thu Theo Hãng Xe sử dụng D3.js (sử dụng d3 toàn cục)
 * @param {string} containerId - ID của container
 */
const createBrandRevenueChart = (containerId) => {
    // Kiểm tra xem D3 đã tải chưa
    if (typeof d3 === 'undefined') {
        console.error('D3.js chưa được tải. Vui lòng đảm bảo script CDN đã load xong.');
        return;
    }
    
    const d3Instance = window.d3;
    
    // Đảm bảo DOM đã sẵn sàng
    const container = d3Instance.select(containerId);
    if (!container.node()) return;

    // Xóa biểu đồ cũ
    container.selectAll("*").remove();
    
    // Thiết lập kích thước và lề
    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    // Sử dụng getBoundingClientRect() để tính toán kích thước container thực tế
    const containerRect = container.node().getBoundingClientRect();
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;

    // Tạo SVG
    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Thiết lập Scales
    const y = d3Instance.scaleBand()
        .range([0, height])
        .domain(brandRevenueData.map(d => d.brand))
        .padding(0.1);

    const x = d3Instance.scaleLinear()
        .domain([0, d3Instance.max(brandRevenueData, d => d.revenue)])
        .range([0, width]);

    // Thêm Axes
    svg.append("g")
        .call(d3Instance.axisLeft(y));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3Instance.axisBottom(x));

    // Thêm Bars (với hiệu ứng chuyển động như yêu cầu trong HTML gốc)
    svg.selectAll(".bar")
        .data(brandRevenueData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", 0) // Bắt đầu từ 0 cho hiệu ứng
        .attr("y", d => y(d.brand))
        .attr("height", y.bandwidth())
        .attr("fill", "#dc2626") /* Sử dụng màu đỏ của Tailwind (red-700) */
        .transition()
        .duration(800)
        .attr("width", d => x(d.revenue));
};

// Life Cycle Hooks
onMounted(() => {
    // Đợi D3 load xong (nếu dùng CDN)
    const checkD3 = () => {
        if (typeof window.d3 !== 'undefined') {
            // Vẽ biểu đồ ngay khi component được mount VÀ D3 đã tải
            createBrandRevenueChart('#brand-revenue-chart');
        } else {
            setTimeout(checkD3, 100); // Thử lại sau 100ms
        }
    };
    checkD3();
});

// Watchers (Để vẽ lại biểu đồ khi có thay đổi bộ lọc nếu có data thực)
// Hiện tại chỉ log, nhưng đây là nơi bạn sẽ gọi hàm vẽ lại biểu đồ
watch([activePeriod, selectedBrand], ([newPeriod, newBrand]) => {
    console.log(`Bộ lọc thay đổi: Thời gian: ${newPeriod} ngày, Hãng xe: ${newBrand}`);
    // Ở đây bạn sẽ fetch data mới và gọi createBrandRevenueChart lại
    // createBrandRevenueChart('#brand-revenue-chart'); 
    // Nếu Biểu đồ Xu hướng cần vẽ, cũng gọi hàm vẽ nó ở đây.
});
</script>

<!-- Tải D3.js qua CDN do lỗi import ES module trong môi trường này -->
<script>
  if (typeof d3 === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://d3js.org/d3.v7.min.js';
    document.head.appendChild(script);
  }
</script>

<style scoped>
/* CSS overrides từ file gốc (filter-btn.active) */
.filter-btn.active {
    background-color: #3b82f6; /* Tương đương bg-blue-500 */
    color: white;
}
</style>
