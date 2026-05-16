import fs from 'fs';
import path from 'path';

const translationDict = JSON.parse(fs.readFileSync('scratch/translation_dict.json', 'utf8'));

// Add single character mappings for common characters found in the project
const charDict = {
  "一": "một", "二": "hai", "三": "ba", "四": "bốn", "五": "năm",
  "六": "sáu", "七": "bảy", "八": "tám", "九": "chín", "十": "mười",
  "个": "cái", "的": "của", "在": "tại", "有": "có", "和": "và",
  "人": "người", "这": "này", "中": "trong", "大": "lớn", "小": "nhỏ",
  "上": "trên", "下": "dưới", "左": "trái", "右": "phải", "前": "trước",
  "后": "sau", "里": "trong", "外": "ngoài", "年": "năm", "月": "tháng",
  "日": "ngày", "时": "giờ", "分": "phút", "秒": "giây", "点": "điểm",
  "我": "tôi", "你": "bạn", "他": "anh ấy", "她": "cô ấy", "它": "nó",
  "们": "chúng", "见": "thấy", "看": "xem", "说": "nói", "听": "nghe",
  "写": "viết", "读": "đọc", "行": "dòng", "列": "cột", "位": "vị trí",
  "开": "mở", "关": "đóng", "出": "ra", "入": "vào", "进": "vào",
  "回": "về", "过": "qua", "去": "đi", "来": "đến", "到": "đến",
  "等": "chờ", "用": "dùng", "做": "làm", "使": "khiến", "由": "do",
  "被": "bị", "为": "vì", "以": "lấy", "而": "mà", "此": "này",
  "其": "nó", "各": "các", "全": "toàn", "总": "tổng", "半": "nửa",
  "多": "nhiều", "少": "ít", "长": "dài", "短": "ngắn", "高": "cao",
  "低": "thấp", "好": "tốt", "坏": "xấu", "真": "thật", "假": "giả",
  "新": "mới", "旧": "cũ", "老": "già", "快": "nhanh", "慢": "chậm",
  "很": "rất", "太": "quá", "最": "nhất", "更": "hơn", "也": "cũng",
  "又": "lại", "还": "còn", "只": "chỉ", "才": "mới", "就": "thì",
  "即": "là", "且": "vừa", "并": "đồng thời", "或": "hoặc", "如": "nếu",
  "若": "nếu", "但": "nhưng", "虽": "mặc dù", "虽": "tuy", "因": "vì",
  "所": "nên", "从": "từ", "自": "từ", "向": "hướng", "往": "về",
  "与": "với", "及": "và", "连": "liền", "给": "cho", "对": "đối",
  "于": "ở", "由": "do", "经": "qua", "通过": "thông qua", "关于": "về",
  "对于": "đối với", "为了": "để", "被": "bị", "叫": "gọi", "让": "để",
  "个": "chiếc", "支": "chiếc", "张": "tờ", "件": "món", "台": "chiếc",
  "本": "quyển", "把": "chiếc", "间": "gian", "层": "tầng", "类": "loại",
  "种": "loại", "样": "kiểu", "式": "kiểu", "性": "tính", "度": "độ",
  "化": "hóa", "主义": "chủ nghĩa", "部": "bộ", "位": "vị", "名": "danh",
  "岁": "tuổi", "天": "ngày", "周": "tuần", "期": "kỳ", "季": "mùa",
  "今": "nay", "明": "mai", "昨": "qua", "早": "sáng", "晚": "tối",
  "昼": "ngày", "夜": "đêm", "头": "đầu", "尾": "đuôi", "始": "đầu",
  "终": "cuối", "色": "màu", "红": "đỏ", "黄": "vàng", "蓝": "xanh",
  "黑": "đen", "白": "trắng", "绿": "xanh lá", "金": "vàng", "银": "bạc",
  "图": "ảnh", "表": "bảng", "文": "văn", "字": "chữ", "码": "mã",
  "号": "số", "目": "mục", "标": "tiêu", "志": "chí", "点": "điểm",
  "线": "đường", "面": "mặt", "体": "thể", "形": "hình", "力": "lực",
  "能": "năng", "法": "pháp", "理": "lý", "道": "đạo", "机": "máy",
  "器": "thiết bị", "具": "dụng cụ", "件": "phần tử", "品": "sản phẩm",
  "物": "vật", "事": "việc", "情": "tình", "意": "ý", "心": "tâm",
  "神": "thần", "灵": "linh", "命": "mệnh", "活": "sống", "生": "sinh",
  "死": "chết", "变": "biến", "改": "sửa", "化": "hóa", "建": "xây",
  "立": "lập", "设": "thiết", "计": "kế", "办": "làm", "务": "vụ",
  "公": "công", "私": "tư", "正": "đúng", "反": "ngược", "真": "thật",
  "假": "giả", "全": "toàn", "分": "phần", "合": "hợp", "同": "cùng",
  "异": "khác", "重": "trùng", "复": "phục", "加": "thêm", "减": "bớt",
  "乘": "nhân", "除": "chia", "等": "bằng", "大": "đại", "小": "tiểu",
  "高": "cao", "低": "đê", "多": "đa", "少": "thiểu", "长": "trường",
  "短": "đoản", "远": "viễn", "近": "cận", "快": "khoái", "慢": "mạn",
  "厚": "hậu", "薄": "bạc", "深": "thâm", "浅": "thiển", "广": "quảng",
  "窄": "trách", "空": "không", "实": "thực", "强": "cường", "弱": "nhược",
  "难": "nan", "易": "dị", "明": "minh", "暗": "ám", "美": "mỹ",
  "丑": "xú", "好": "hảo", "坏": "hoại", "爱": "ái", "恨": "hận",
  "局": "bộ", "体": "thể", "验": "nghiệm", "专": "chuyên", "注": "tâm",
  "觉": "giác", "视": "thị", "画": "họa", "图": "đồ", "格": "cách"
};

const allDict = { ...translationDict, ...charDict };

// Sort dictionary keys by length (descending) to match longest phrases first
const sortedKeys = Object.keys(allDict).sort((a, b) => b.length - a.length);

function greedyTranslate(text) {
    if (!text) return '';
    
    let result = '';
    let i = 0;
    while (i < text.length) {
        let found = false;
        // Try to match from longest to shortest
        for (const key of sortedKeys) {
            if (text.substring(i, i + key.length) === key) {
                result += allDict[key];
                i += key.length;
                found = true;
                break;
            }
        }
        
        if (!found) {
            // If it's a Chinese character but not in dict, keep it for now or use a generic marker
            const char = text[i];
            if (/[\u4e00-\u9fa5]/.test(char)) {
                // Try to find in charDict specifically if not already in allDict
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

    // Use regex to find any sequence of characters containing at least one Chinese char
    // This handles mixed strings better
    content = content.replace(/([^\s"'>]*[\u4e00-\u9fa5]+[^\s"'>]*)/g, (match) => {
        // Only translate if it's not a path or something technical
        if (match.includes('/') || match.includes('.') || match.includes('ri:')) return match;
        return greedyTranslate(match);
    });

    // Also handle quoted strings separately
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
            if (!p.includes('node_modules') && !p.includes('.git') && !p.includes('.vscode')) {
                count += walk(p);
            }
        } else if (p.endsWith('.vue') || p.endsWith('.ts') || p.endsWith('.js') || p.endsWith('.json')) {
            if (processFile(p)) count++;
        }
    }
    return count;
}

console.log("Starting greedy translation...");
const total = walk('src');
console.log(`Greedy translation complete. Modified ${total} files.`);
