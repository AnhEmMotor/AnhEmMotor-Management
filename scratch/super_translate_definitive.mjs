import fs from 'fs';
import path from 'path';

const dictPath = 'scratch/translation_dict.json';
const translationDict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

// Common Han-Viet character mapping
const charDict = {
    "的": "của", "一": "một", "是": "là", "不": "không", "了": "rồi", "在": "tại", "人": "người", "有": "có", "我": "tôi", "他": "anh ấy", 
    "这": "này", "个": "cái", "们": "chúng", "中": "trong", "来": "đến", "上": "trên", "大": "lớn", "为": "vì", "和": "và", "国": "quốc", 
    "地": "địa", "到": "đến", "以": "lấy", "说": "nói", "时": "thời", "要": "cần", "就": "thì", "出": "ra", "会": "sẽ", "可": "có thể", 
    "也": "cũng", "你": "bạn", "对": "đối", "生": "sinh", "能": "năng", "而": "mà", "子": "tử", "那": "kia", "得": "được", "于": "ở", 
    "着": "đang", "下": "dưới", "自": "tự", "之": "của", "年": "năm", "过": "qua", "发": "phát", "后": "sau", "作": "làm", "里": "trong", 
    "用": "dùng", "道": "đạo", "行": "dòng", "所": "nên", "然": "nhiên", "家": "gia", "种": "loại", "事": "việc", "成": "thành", "方": "phương", 
    "多": "nhiều", "经": "kinh", "么": "gì", "去": "đi", "法": "pháp", "学": "học", "如": "như", "都": "đều", "同": "cùng", "现": "hiện", 
    "当": "khi", "没": "không", "动": "động", "面": "mặt", "起": "khởi", "看": "xem", "定": "định", "天": "thiên", "分": "phần", "还": "còn", 
    "进": "vào", "好": "tốt", "小": "nhỏ", "部": "bộ", "其": "nó", "些": "vài", "主": "chủ", "样": "kiểu", "理": "lý", "心": "tâm", 
    "她": "cô ấy", "本": "bản", "前": "trước", "开": "mở", "但": "nhưng", "因": "vì", "只": "chỉ", "从": "từ", "想": "muốn", "实": "thực", 
    "意": "ý", "力": "lực", "而": "mà", "它": "nó", "无": "vô", "代": "thế", "性": "tính", "关": "quan", "见": "thấy", "使": "khiến", 
    "应": "ứng", "体": "thể", "提": "đề", "设": "thiết", "建": "xây", "立": "lập", "格": "cách", "式": "thức", "计": "kế", "录": "lục",
    "输": "nhập", "出": "xuất", "入": "vào", "页": "trang", "码": "mã", "源": "nguồn", "简": "rút", "级": "cấp", "项": "mục", "目": "mục",
    "回": "về", "应": "ứng", "该": "nên", "存": "tồn", "在": "tại", "避": "tránh", "免": "miễn", "警": "cảnh", "告": "báo", "示": "thị",
    "提": "gợi", "键": "phím", "值": "giá trị", "格": "cách", "式": "kiểu", "化": "hóa", "样": "kiểu", "本": "bản", "例": "ví dụ",
    "试": "thử", "验": "nghiệm", "体": "thể", "现": "hiện", "实": "thực", "载": "tải", "加": "thêm", "减": "bớt", "乘": "nhân", "除": "chia",
    "等": "bằng", "于": "ở", "由": "do", "经": "qua", "过": "qua", "如": "nếu", "果": "quả", "但": "nhưng", "并": "và", "且": "vừa",
    "或": "hoặc", "即": "là", "之": "của", "后": "sau", "前": "trước", "中": "trong", "间": "giữa", "内": "trong", "外": "ngoài",
    "里": "trong", "上": "trên", "下": "dưới", "左": "trái", "右": "phải", "全": "toàn", "局": "bộ", "部": "phần", "分": "phần",
    "个": "cái", "只": "chỉ", "都": "đều", "也": "cũng", "又": "lại", "还": "còn", "很": "rất", "太": "quá", "最": "nhất", "更": "hơn",
    "多": "nhiều", "少": "ít", "好": "tốt", "坏": "xấu", "真": "thật", "假": "giả", "大": "lớn", "小": "nhỏ", "长": "dài", "短": "ngắn",
    "高": "cao", "低": "thấp", "新": "mới", "旧": "cũ", "老": "già", "快": "nhanh", "慢": "chậm", "开": "mở", "关": "đóng", "打": "mở",
    "发": "phát", "展": "triển", "用": "dùng", "使": "khiến", "为": "vì", "以": "lấy", "而": "mà", "此": "này", "其": "nó", "各": "các",
    "每": "mỗi", "单": "đơn", "双": "đôi", "复": "phức", "杂": "tạp", "易": "dễ", "难": "khó", "明": "minh", "暗": "ám", "清": "thanh",
    "爽": "sảng", "富": "phong", "丰": "phong", "感": "cảm", "觉": "giác", "视": "thị", "听": "thính", "读": "đọc", "写": "viết",
    "学": "học", "习": "tập", "教": "dạy", "授": "trao", "给": "cho", "得": "được", "要": "cần", "想": "muốn", "见": "thấy", "看": "xem",
    "听": "nghe", "说": "nói", "笑": "cười", "哭": "khóc", "划": "gạch", "粗": "đậm", "斜": "nghiêng", "线": "đường", "方": "phương",
    "向": "hướng", "齐": "căn", "缩": "thụt", "进": "tiến", "序": "thứ", "任": "nhiệm", "务": "vụ", "插": "chèn", "彩": "màu", "块": "khối",
    "撤": "hoàn", "销": "tác", "重": "làm lại", "全": "toàn", "屏": "màn hình", "清": "xóa", "除": "bỏ", "适": "thích", "场": "trường",
    "景": "cảnh", "界": "giao", "画": "họa", "富": "phú", "丰": "phong", "艺": "nghệ", "术": "thuật", "设": 'thiết', '计': 'kế', '美': 'mỹ',
    "效": "hiệu", "高": "cao", "调": "điều", "试": "thử", "验": "nghiệm", "体": "thể", "现": "hiện", "实": "thực", "载": "tải", "加": "thêm",
    "减": "bớt", "乘": "nhân", "除": "chia", "等": "bằng", "于": "ở", "由": "do", "经": "qua", "过": "qua", "如": "nếu", "果": "quả",
    "但": "nhưng", "并": "và", "且": "vừa", "或": "hoặc", "即": "là", "之": "của", "后": "sau", "前": "trước", "中": "trong", "间": "giữa",
    "内": "trong", "外": "ngoài", "里": "trong", "上": "trên", "下": "dưới", "左": "trái", "右": "phải", "全": "toàn", "局": "bộ", "部": "phần",
    "分": "phần", "个": "cái", "只": "chỉ", "都": "đều", "也": "cũng", "又": "lại", "还": "còn", "很": "rất", "太": "quá", "最": "nhất",
    "更": "hơn", "多": "nhiều", "少": "ít", "好": "tốt", "坏": "xấu", "真": "thật", "假": "giả", "大": "lớn", "小": "nhỏ", "长": "dài",
    "短": "ngắn", "高": "cao", "低": "thấp", "新": "mới", "旧": "cũ", "老": "già", "快": "nhanh", "慢": "chậm", "开": "mở", "关": "đóng",
    "打": "mở", "发": "phát", "展": "triển", "用": "dùng", "使": "khiến", "为": "vì", "以": "lấy", "而": "mà", "此": "này", "其": "nó",
    "各": "các", "每": "mỗi", "单": "đơn", "双": "đôi", "复": "phức", "杂": "tạp", "易": "dễ", "难": "khó", "明": "minh", "暗": "ám",
    "清": "thanh", "爽": "sảng", "富": "phong", "丰": "phong", "感": "cảm", "觉": "giác", "视": "thị", "听": "thính", "读": "đọc",
    "写": "viết", "学": "học", "习": "tập", "教": "dạy", "授": "trao", "给": "cho", "得": "được", "要": "cần", "想": "muốn", "见": "thấy",
    "看": "xem", "听": "nghe", "说": "nói", "笑": "cười", "哭": "khóc", "划": "gạch", "粗": "đậm", "斜": "nghiêng", "线": "đường",
    "方": "phương", "向": "hướng", "齐": "căn", "缩": "thụt", "进": "tiến", "序": "thứ", "任": "nhiệm", "务": "vụ", "插": "chèn",
    "彩": "màu", "块": "khối", "撤": "hoàn", "销": "tác", "重": "làm lại", "全": "toàn", "屏": "màn hình", "清": "xóa", "除": "bỏ",
    "适": "thích", "场": "trường", "景": "cảnh", "界": "giao", "画": "họa", "富": "phú", "丰": "phong", "艺": "nghệ", "术": "thuật",
    "设": "thiết", "计": "kế", "美": "mỹ", "效": "hiệu", "高": "cao", "特": "đặc", "性": "tính", "已": "đã", "启": "bật", "高": "cao", "级": "cấp",
    "强": "mạnh", "大": "đại", "功": "công", "能": "năng", "支": "chi", "持": "trì", "丰": "phong", "富": "phú", "文": "văn", "本": "bản",
    "格": "cách", "式": "thức", "包": "bao", "含": "hàm", "等": "đợi", "演": "diễn", "示": "thị", "内": "nội", "容": "dung", "愿": "nguyện",
    "欢": "hoan", "示": "thị", "例": "ví dụ", "代": "đại", "码": "mã", "块": "khối", "等": "đợi", "高": "cao", "级": "cấp", "功": "công",
    "能": "năng", "提": "đề", "供": "cung", "完": "hoàn", "整": "chỉnh", "的": "đích", "编": "biên", "辑": "tập", "体": "thể", "验": "nghiệm",
    "特": "đặc", "性": "tính", "状": "trạng", "态": "thái", "完": "hoàn", "整": "chỉnh", "工": "công", "具": "cụ", "栏": "lan",
    "已": "đã", "启": "bật", "高": "cao", "级": "cấp", "功": "công", "能": "năng"
};

const allDict = { ...translationDict, ...charDict };
const sortedKeys = Object.keys(allDict).sort((a, b) => b.length - a.length);

function greedyTranslate(text) {
    if (!text) return '';
    let result = '';
    let i = 0;
    while (i < text.length) {
        let found = false;
        for (const key of sortedKeys) {
            if (text.substring(i, i + key.length) === key) {
                result += allDict[key];
                i += key.length;
                found = true;
                break;
            }
        }
        if (!found) {
            const char = text[i];
            if (/[\u4e00-\u9fa5]/.test(char)) {
                result += charDict[char] || char; 
            } else {
                result += char;
            }
            i++;
        }
    }
    return result;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/([^\s"'>]*[\u4e00-\u9fa5]+[^\s"'>]*)/g, (match) => {
        if (match.includes('/') || match.includes('.') || match.includes('ri:') || match.includes('vaadin:')) return match;
        return greedyTranslate(match);
    });

    content = content.replace(/(["'])([^"']*[\u4e00-\u9fa5]+[^"']*)(\1)/g, (match, quote, inner, quoteEnd) => {
        return quote + greedyTranslate(inner) + quoteEnd;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    let count = 0;
    for (const file of files) {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            if (!p.includes('node_modules') && !p.includes('.git')) {
                count += walk(p);
            }
        } else if (p.endsWith('.vue') || p.endsWith('.ts') || p.endsWith('.js') || p.endsWith('.json')) {
            if (processFile(p)) count++;
        }
    }
    return count;
}

console.log("Starting definitive greedy translation sweep...");
const total = walk('src');
console.log(`Definitive sweep complete. Modified ${total} files.`);
