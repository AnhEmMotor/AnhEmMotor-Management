import fs from 'fs';

const dictPath = 'scratch/translation_dict.json';
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

const extraChars = {
  '简': 'rút', '源': 'nguồn', '码': 'mã', '撤': 'hoàn', '销': 'tác', '做': 'làm', 
  '引': 'trích', '齐': 'căn', '缩': 'thụt', '序': 'thứ', '任': 'nhiệm', '彩': 'màu',
  '功': 'công', '能': 'năng', '页': 'trang', '面': 'mặt', '级': 'cấp', '项': 'mục',
  '目': 'mục', '录': 'lục', '输': 'nhập', '出': 'xuất', '入': 'vào', '进': 'vào',
  '回': 'về', '应': 'ứng', '该': 'nên', '存': 'tồn', '在': 'tại', '避': 'tránh',
  '免': 'miễn', '警': 'cảnh', '告': 'báo', '示': 'thị', '提': 'gợi', '键': 'phím',
  '值': 'giá trị', '格': 'cách', '式': 'kiểu', '化': 'hóa', '样': 'kiểu', '本': 'bản',
  '例': 'ví dụ', '试': 'thử', '验': 'nghiệm', '体': 'thể', '现': 'hiện', '实': 'thực',
  '载': 'tải', '加': 'thêm', '减': 'bớt', '乘': 'nhân', '除': 'chia',
  '等': 'bằng', '于': 'ở', '由': 'do', '经': 'qua', '过': 'qua', '如': 'nếu',
  '果': 'quả', '但': 'nhưng', '并': 'và', '且': 'vừa', '或': 'hoặc', '即': 'là',
  '之': 'của', '后': 'sau', '前': 'trước', '中': 'trong', '间': 'giữa', '内': 'trong',
  '外': 'ngoài', '里': 'trong', '上': 'trên', '下': 'dưới', '左': 'trái', '右': 'phải',
  '全': 'toàn', '局': 'bộ', '部': 'phần', '分': 'phần', '个': 'cái', '只': 'chỉ',
  '都': 'đều', '也': 'cũng', '又': 'lại', '还': 'còn', '很': 'rất', '太': 'quá',
  '最': 'nhất', '更': 'hơn', '多': 'nhiều', '少': 'ít', '好': 'tốt', '坏': 'xấu',
  '真': 'thật', '假': 'giả', '大': 'lớn', '小': 'nhỏ', '长': 'dài', '短': 'ngắn',
  '高': 'cao', '低': 'thấp', '新': 'mới', '旧': 'cũ', '老': 'già', '快': 'nhanh', '慢': 'chậm',
  '开': 'mở', '关': 'đóng', '打': 'mở', '发': 'phát', '展': 'triển', '用': 'dùng',
  '使': 'khiến', '为': 'vì', '以': 'lấy', '而': 'mà', '此': 'này', '其': 'nó',
  '各': 'các', '每': 'mỗi', '单': 'đơn', '双': 'đôi', '复': 'phức', '杂': 'tạp',
  '易': 'dễ', '难': 'khó', '明': 'minh', '暗': 'ám', '清': 'thanh', '爽': 'sảng',
  '富': 'phong', '丰': 'phong', '感': 'cảm', '觉': 'giác', '视': 'thị', '听': 'thính',
  '读': 'đọc', '写': 'viết', '学': 'học', '习': 'tập', '教': 'dạy', '授': 'trao',
  '给': 'cho', '得': 'được', '要': 'cần', '想': 'muốn', '见': 'thấy', '看': 'xem', 
  '听': 'nghe', '说': 'nói', '笑': 'cười', '哭': 'khóc', '划': 'gạch', '粗': 'đậm',
  '斜': 'nghiêng', '划': 'gạch', '线': 'đường', '方': 'phương', '向': 'hướng',
  '齐': 'căn', '缩': 'thụt', '进': 'tiến', '序': 'thứ', '任': 'nhiệm', '务': 'vụ',
  '插': 'chèn', '彩': 'màu', '块': 'khối', '撤': 'hoàn', '销': 'tác', '重': 'làm lại',
  '全': 'toàn', '屏': 'màn hình', '清': 'xóa', '除': 'bỏ', '适': 'thích', '场': 'trường',
  '景': 'cảnh', '界': 'giao', '画': 'họa', '富': 'phú', '丰': 'phong', '艺': 'nghệ',
  '术': 'thuật', '设': 'thiết', '计': 'kế', '美': 'mỹ', '效': 'hiệu', '高': 'cao'
};

Object.assign(dict, extraChars);
fs.writeFileSync(dictPath, JSON.stringify(dict, null, 2), 'utf8');
