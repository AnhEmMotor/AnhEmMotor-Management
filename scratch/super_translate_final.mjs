import fs from 'fs';
import path from 'path';

const dictPath = 'scratch/translation_dict.json';
const translationDict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

// Massive Han-Viet Dictionary (Selective common characters)
const charDict = {
  "一": "một", "二": "hai", "三": "ba", "四": "bốn", "五": "năm", "六": "sáu", "七": "bảy", "八": "tám", "九": "chín", "十": "mười",
  "个": "cái", "的": "của", "在": "tại", "有": "có", "和": "và", "人": "người", "这": "này", "中": "trong", "大": "lớn", "小": "nhỏ",
  "上": "trên", "下": "dưới", "左": "trái", "右": "phải", "前": "trước", "后": "sau", "里": "trong", "外": "ngoài", "年": "năm", "月": "tháng",
  "日": "ngày", "时": "giờ", "分": "phút", "秒": "giây", "点": "điểm", "我": "tôi", "你": "bạn", "他": "anh ấy", "她": "cô ấy", "它": "nó",
  "们": "chúng", "见": "thấy", "看": "xem", "说": "nói", "听": "nghe", "写": "viết", "读": "đọc", "行": "dòng", "列": "cột", "位": "vị trí",
  "开": "mở", "关": "đóng", "出": "ra", "入": "vào", "进": "vào", "回": "về", "过": "qua", "去": "đi", "来": "đến", "到": "đến",
  "等": "chờ", "用": "dùng", "做": "làm", "使": "khiến", "由": "do", "被": "bị", "为": "vì", "以": "lấy", "而": "mà", "此": "này",
  "其": "nó", "各": "các", "全": "toàn", "总": "tổng", "半": "nửa", "多": "nhiều", "少": "ít", "长": "dài", "短": "ngắn", "高": "cao",
  "低": "thấp", "好": "tốt", "坏": "xấu", "真": "thật", "假": "giả", "新": "mới", "旧": "cũ", "老": "già", "快": "nhanh", "慢": "chậm",
  "很": "rất", "太": "quá", "最": "nhất", "更": "hơn", "也": "cũng", "又": "lại", "还": "còn", "只": "chỉ", "才": "mới", "就": "thì",
  "即": "là", "且": "vừa", "并": "và", "或": "hoặc", "如": "nếu", "若": "nếu", "但": "nhưng", "虽": "tuy", "因": "vì", "所": "nên",
  "从": "từ", "自": "từ", "向": "hướng", "往": "về", "与": "với", "及": "và", "连": "liền", "给": "cho", "对": "đối", "于": "ở",
  "经": "qua", "通": "thông", "过": "qua", "被": "bị", "叫": "gọi", "让": "để", "量": "lượng", "数": "số", "品": "sản phẩm", "物": "vật",
  "事": "việc", "情": "tình", "意": "ý", "心": "tâm", "神": "thần", "灵": "linh", "命": "mệnh", "活": "sống", "生": "sinh", "死": "chết",
  "变": "biến", "改": "sửa", "化": "hóa", "建": "xây", "立": "lập", "设": "thiết", "计": "kế", "办": "làm", "务": "vụ", "公": "công",
  "私": "tư", "正": "đúng", "反": "ngược", "真": "thật", "假": "giả", "全": "toàn", "分": "phần", "合": "hợp", "同": "cùng", "异": "khác",
  "加": "thêm", "减": "bớt", "乘": "nhân", "除": "chia", "等": "bằng", "大": "đại", "小": "tiểu", "高": "cao", "低": "đê", "多": "đa",
  "少": "thiểu", "远": "viễn", "近": "cận", "快": "khoái", "慢": "mạn", "厚": "hậu", "薄": "bạc", "深": "thâm", "浅": "thiển", "广": "quảng",
  "窄": "trách", "空": "không", "实": "thực", "强": "cường", "弱": "nhược", "难": "nan", "易": "dị", "明": "minh", "暗": "ám", "美": "mỹ",
  "好": "hảo", "坏": "hoại", "爱": "ái", "恨": "hận", "局": "bộ", "体": "thể", "验": "nghiệm", "专": "chuyên", "注": "tâm", "觉": "giác",
  "视": "thị", "画": "họa", "图": "đồ", "格": "cách", "简": "rút", "源": "nguồn", "码": "mã", "撤": "hoàn", "销": "tác", "做": "làm",
  "引": "trích", "齐": "căn", '缩': 'thụt', '序': 'thứ', '任': 'nhiệm', '彩': 'màu', '功': 'công', '能': 'năng', '页': 'trang', '面': 'mặt',
  '级': 'cấp', '项': 'mục', '目': 'mục', '录': 'lục', '输': 'nhập', '出': 'xuất', '入': 'vào', '进': 'vào', '回': 'về', '应': 'ứng',
  '该': 'nên', '存': 'tồn', '在': 'tại', '避': 'tránh', '免': 'miễn', '警': 'cảnh', '告': 'báo', '示': 'thị', '提': 'gợi', '键': 'phím',
  '值': 'giá trị', '格': 'cách', '式': 'kiểu', '化': 'hóa', '样': 'kiểu', '本': 'bản', '例': 'ví dụ', '试': 'thử', '验': 'nghiệm',
  '体': 'thể', '现': 'hiện', '载': 'tải', '加': 'thêm', '减': 'bớt', '乘': 'nhân', '除': 'chia', '等': 'bằng', '于': 'ở', '由': 'do',
  '经': 'qua', '过': 'qua', '如': 'nếu', '果': 'quả', '但': 'nhưng', '并': 'và', '且': 'vừa', '或': 'hoặc', '即': 'là', '之': 'của',
  '后': 'sau', '前': 'trước', '中': 'trong', '间': 'giữa', '内': 'trong', '外': 'ngoài', '里': 'trong', '上': 'trên', '下': 'dưới',
  '左': 'trái', '右': 'phải', '全': 'toàn', '局': 'bộ', '部': 'phần', '分': 'phần', '个': 'cái', '只': 'chỉ', '都': 'đều', '也': 'cũng',
  '又': 'lại', '还': 'còn', '很': 'rất', '太': 'quá', '最': 'nhất', '更': 'hơn', '多': 'nhiều', '少': 'ít', '好': 'tốt', '坏': 'xấu',
  '真': 'thật', '假': 'giả', '大': 'lớn', '小': 'nhỏ', '长': 'dài', '短': 'ngắn', '高': 'cao', '低': 'thấp', '新': 'mới', '旧': 'cũ',
  '老': 'già', '快': 'nhanh', '慢': 'chậm', '开': 'mở', '关': 'đóng', '打': 'mở', '发': 'phát', '展': 'triển', '用': 'dùng', '使': 'khiến',
  '为': 'vì', '以': 'lấy', '而': 'mà', '此': 'này', '其': 'nó', '各': 'các', '每': 'mỗi', '单': 'đơn', '双': 'đôi', '复': 'phức',
  '杂': 'tạp', '易': 'dễ', '难': 'khó', '明': 'minh', '暗': 'ám', '清': 'thanh', '爽': 'sảng', '富': 'phong', '丰': 'phong',
  '感': 'cảm', '觉': 'giác', '视': 'thị', '听': 'thính', '读': 'đọc', '写': 'viết', '学': 'học', '习': 'tập', '教': 'dạy',
  '授': 'trao', '给': 'cho', '得': 'được', '要': 'cần', '想': 'muốn', '见': 'thấy', '看': 'xem', '听': 'nghe', '说': 'nói',
  '笑': 'cười', '哭': 'khóc', '划': 'gạch', '粗': 'đậm', '斜': 'nghiêng', '线': 'đường', '方': 'phương', '向': 'hướng',
  '齐': 'căn', '缩': 'thụt', '进': 'tiến', '序': 'thứ', '任': 'nhiệm', '务': 'vụ', '插': 'chèn', '彩': 'màu', '块': 'khối',
  '撤': 'hoàn', '销': 'tác', '重': 'làm lại', '全': 'toàn', '屏': 'màn hình', '清': 'xóa', '除': 'bỏ', '适': 'thích',
  '场': 'trường', '景': 'cảnh', '界': 'giao', '画': 'họa', '富': 'phú', '丰': 'phong', '艺': 'nghệ', '术': 'thuật',
  '设': 'thiết', '计': 'kế', '美': 'mỹ', '效': 'hiệu', '高': 'cao', '调': 'điều', '试': 'thử', '验': 'nghiệm', '体': 'thể',
  '现': 'hiện', '实': 'thực', '载': 'tải', '加': 'thêm', '减': 'bớt', '乘': 'nhân', '除': 'chia', '等': 'bằng', '于': 'ở',
  '由': 'do', '经': 'qua', '过': 'qua', '如': 'nếu', '果': 'quả', '但': 'nhưng', '并': 'và', '且': 'vừa', '或': 'hoặc',
  '即': 'là', '之': 'của', '后': 'sau', '前': 'trước', '中': 'trong', '间': 'giữa', '内': 'trong', '外': 'ngoài',
  '里': 'trong', '上': 'trên', '下': 'dưới', '左': 'trái', '右': 'phải', '全': 'toàn', '局': 'bộ', '部': 'phần',
  '分': 'phần', '个': 'cái', '只': 'chỉ', '都': 'đều', '也': 'cũng', '又': 'lại', '还': 'còn', '很': 'rất', '太': 'quá',
  '最': 'nhất', '更': 'hơn', '多': 'nhiều', '少': 'ít', '好': 'tốt', '坏': 'xấu', '真': 'thật', '假': 'giả', '大': 'lớn',
  '小': 'nhỏ', '长': 'dài', '短': 'ngắn', '高': 'cao', '低': 'thấp', '新': 'mới', '旧': 'cũ', '老': 'già', '快': 'nhanh',
  '慢': 'chậm', '开': 'mở', '关': 'đóng', '打': 'mở', '发': 'phát', '展': 'triển', '用': 'dùng', '使': 'khiến', '为': 'vì',
  '以': 'lấy', '而': 'mà', '此': 'này', '其': 'nó', '各': 'các', '每': 'mỗi', '单': 'đơn', '双': 'đôi', '复': 'phức',
  '杂': 'tạp', '易': 'dễ', '难': 'khó', '明': 'minh', '暗': 'ám', '清': 'thanh', '爽': 'sảng', '富': 'phong', '丰': 'phong',
  '感': 'cảm', '觉': 'giác', '视': 'thị', '听': 'thính', '读': 'đọc', '写': 'viết', '学': 'học', '习': 'tập', '教': 'dạy',
  '授': 'trao', '给': 'cho', '得': 'được', '要': 'cần', '想': 'muốn', '见': 'thấy', '看': 'xem', '听': 'nghe', '说': 'nói',
  '笑': 'cười', '哭': 'khóc', '划': 'gạch', '粗': 'đậm', '斜': 'nghiêng', '线': 'đường', '方': 'phương', '向': 'hướng',
  '齐': 'căn', '缩': 'thụt', '进': 'tiến', '序': 'thứ', '任': 'nhiệm', '务': 'vụ', '插': 'chèn', '彩': 'màu', '块': 'khối',
  '撤': 'hoàn', '销': 'tác', '重': 'làm lại', '全': 'toàn', '屏': 'màn hình', '清': 'xóa', '除': 'bỏ', '适': 'thích',
  '场': 'trường', '景': 'cảnh', '界': 'giao', '画': 'họa', '富': 'phú', '丰': 'phong', '艺': 'nghệ', '术': 'thuật',
  '设': 'thiết', '计': 'kế', '美': 'mỹ', '效': 'hiệu', '高': 'cao'
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

console.log("Starting final greedy translation sweep...");
const total = walk('src');
console.log(`Final sweep complete. Modified ${total} files.`);
