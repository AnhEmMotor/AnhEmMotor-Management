const fs = require('fs');
const path = require('path');

const data = {
  vi: { 
    welcome: "Chào mừng trở lại", todaySales: "Doanh số hôm nay", vsYesterday: "So với hôm qua",
    salesTrend: "Xu hướng bán hàng", monthlyComparison: "So sánh hàng tháng",
    salesClassification: "Phân loại doanh số", byCategory: "Theo danh mục",
    totalIncome: "Tổng doanh thu", growthThisMonth: "Tăng trưởng tháng này",
    totalProducts: "Tổng sản phẩm", growth: "Tăng trưởng",
    hotCommodity: "Sản phẩm bán chạy", weeklyRanking: "Xếp hạng tuần",
    cartConversion: "Tỷ lệ chuyển đổi giỏ hàng",
    recentActivity: "Hoạt động gần đây", orderStatus: "Trạng thái xử lý",
    hotProducts: "Sản phẩm bán chạy", monthlySales: "Tình hình bán hàng tháng này",
    product: "Sản phẩm", price: "Giá", stock: "Kho", sales: "Doanh số",
    outOfStock: "Hết hàng", lowStock: "Sắp hết", moderateStock: "Trung bình", sufficientStock: "Đầy đủ"
  },
  en: { 
    welcome: "Welcome back", todaySales: "Today's Sales", vsYesterday: "Vs Yesterday",
    salesTrend: "Sales Trend", monthlyComparison: "Monthly Comparison",
    salesClassification: "Sales Classification", byCategory: "By Category",
    totalIncome: "Total Income", growthThisMonth: "Growth this month",
    totalProducts: "Total Products", growth: "Growth",
    hotCommodity: "Hot Commodity", weeklyRanking: "Weekly Ranking",
    cartConversion: "Cart Conversion Rate",
    recentActivity: "Recent Activity", orderStatus: "Order Status",
    hotProducts: "Hot Products", monthlySales: "Monthly Sales",
    product: "Product", price: "Price", stock: "Stock", sales: "Sales",
    outOfStock: "Out of Stock", lowStock: "Low Stock", moderateStock: "Moderate", sufficientStock: "Sufficient"
  },
  ara: { 
    welcome: "مرحباً بعودتك", todaySales: "مبيعات اليوم", vsYesterday: "مقابل الأمس",
    salesTrend: "اتجاه المبيعات", monthlyComparison: "مقارنة شهرية",
    salesClassification: "تصنيف المبيعات", byCategory: "حسب الفئة",
    totalIncome: "إجمالي الدخل", growthThisMonth: "النمو هذا الشهر",
    totalProducts: "إجمالي المنتجات", growth: "نمو",
    hotCommodity: "السلع الساخنة", weeklyRanking: "الترتيب الأسبوعي",
    cartConversion: "معدل تحويل العربة",
    recentActivity: "النشاط الأخير", orderStatus: "حالة الطلب",
    hotProducts: "المنتجات الأكثر مبيعا", monthlySales: "المبيعات الشهرية",
    product: "منتج", price: "سعر", stock: "مخزون", sales: "مبيعات",
    outOfStock: "نفد المخزون", lowStock: "مخزون منخفض", moderateStock: "معتدل", sufficientStock: "كاف"
  }
};

const otherLangs = ["de", "fra", "it", "jp", "kor", "spa", "ru", "el", "nl", "pl", "pt", "rom", "swe"];
for (const lang of otherLangs) {
    if (!data[lang]) data[lang] = data.en;
}

const langsDir = path.join(process.cwd(), 'src/locales/langs');

for (const [lang, translations] of Object.entries(data)) {
    const fileName = lang === 'jp' ? 'jp' : (lang === 'kor' ? 'kor' : (lang === 'spa' ? 'spa' : (lang === 'rom' ? 'rom' : (lang === 'swe' ? 'swe' : lang))));
    const filePath = path.join(langsDir, `${fileName}.json`);
    if (fs.existsSync(filePath)) {
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        json.dashboard = json.dashboard || {};
        json.dashboard.ecommerce = json.dashboard.ecommerce || {};
        Object.assign(json.dashboard.ecommerce, translations);
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    }
}
console.log('Injected all module headers.');
