/* eslint-disable */
const fs = require('fs');
const path = require('path');

const translations = {
  "admin.t1": "Độ hài lòng của khách hàng",
  "admin.t2": "Phân bố doanh số toàn quốc",
  "admin.t3": "Mục tiêu và thực tế",
  "admin.t4": "Doanh số hôm nay",
  "admin.t5": "Tổng kết doanh số",
  "admin.t6": "Xuất",
  "admin.t7": "So với hôm qua",
  "admin.t8": "Sản phẩm nổi bật",
  "admin.t9": "Tên sản phẩm",
  "admin.t10": "Lượng bán",
  "admin.t11": "Tổng doanh thu",
  "admin.t12": "Phân tích khách truy cập",
  "admin.t13": "Khối lượng công việc & Dịch vụ",
  "admin.t14": "Về dự án",
  "admin.t15": "Sử dụng công nghệ mới nhất như Vue3, TypeScript, Vite, Element Plus",
  "admin.t16": "Tổng quan người dùng",
  "admin.t17": "So với tuần trước",
  "admin.t18": "Chúng tôi cung cấp nhiều tùy chọn có thể kết hợp và tùy chỉnh để tạo trang hoàn hảo",
  "admin.t19": "So với tuần trước",
  "admin.t20": "Hoạt động",
  "admin.t21": "Thêm mới",
  "admin.t22": "Người dùng mới",
  "admin.t23": "Tăng trưởng tháng này",
  "admin.t24": "Tháng này",
  "admin.t25": "Tháng này",
  "admin.t26": "Tháng trước",
  "admin.t27": "Tháng trước",
  "admin.t28": "Năm nay",
  "admin.t29": "Năm nay",
  "admin.t30": "Ảnh đại diện",
  "admin.t31": "Lượt truy cập",
  "admin.t32": "Tăng trưởng năm nay",
  "admin.t33": "Việc cần làm",
  "admin.t34": "Đang chờ xử lý",
  "admin.t35": "Doanh số hàng năm",
  "admin.t36": "Thống kê theo quý",
  "admin.t37": "Bán hàng trực tuyến",
  "admin.t38": "Bán hàng trực tiếp",
  "admin.t39": "Doanh số hôm nay",
  "admin.t40": "So với hôm qua",
  "admin.t41": "Tỷ lệ chuyển đổi giỏ hàng",
  "admin.t42": "Sản phẩm bán chạy",
  "admin.t43": "Xếp hạng doanh số tuần này",
  "admin.t44": "Sản phẩm hot",
  "admin.t45": "Tình hình bán hàng tháng này",
  "admin.t46": "Sản phẩm",
  "admin.t47": "Doanh số",
  "admin.t48": "Giao dịch gần đây",
  "admin.t49": "Đơn hàng hôm nay",
  "admin.t50": "Phân loại doanh số",
  "admin.t51": "Theo danh mục sản phẩm",
  "admin.t52": "Tổng doanh thu",
  "admin.t53": "Lợi nhuận ròng",
  "admin.t54": "Tăng trưởng",
  "admin.t55": "Xu hướng bán hàng",
  "admin.t56": "So sánh doanh số hàng tháng",
  "admin.t57": "Tăng trưởng tháng này",
  "admin.t58": "Tổng số sản phẩm",
  "admin.t59": "Hoạt động gần đây",
  "admin.t60": "Trạng thái xử lý đơn hàng"
};

const langsDir = path.join(process.cwd(), 'src/locales/langs');
const files = fs.readdirSync(langsDir);

for (const file of files) {
    if (file.endsWith('.json')) {
        const filePath = path.join(langsDir, file);
        let data = {};
        try {
            data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch(e){}
        
        data.admin = data.admin || {};
        // clear old admin keys just in case
        data.admin = {};
        for (const [key, value] of Object.entries(translations)) {
            const shortKey = key.split('.')[1];
            data.admin[shortKey] = value;
        }
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
}

console.log('Injected 60 translations to all languages.');
