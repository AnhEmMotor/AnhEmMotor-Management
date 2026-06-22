import fs from "fs";

const path = "d:/DATN/AnhEmMotor/AnhEmMotor-Management/src/i18n/package/vi.ts";
let content = fs.readFileSync(path, "utf8");

// The target marker: line 436 is "},", line 437 is "marketing: {"
// We want to replace the transition with: "},\ncontact: { ... },\nmarketing: {"

const contactBlock = `},
contact: {
  title: 'Quản lý Liên hệ',
  subtitle: 'Tiếp nhận & xử lý yêu cầu hỗ trợ, phản hồi và hồ sơ ứng viên',
  tabSupport: 'Yêu cầu hỗ trợ',
  tabFeedback: 'Đóng góp ý kiến',
  tabCandidate: 'Hồ sơ ứng viên',
  searchPlaceholder: 'Tìm tên, email, SĐT, tiêu đề...',
  allStatus: 'Tất cả trạng thái',
  supportStatus: { New: 'Mới', InProgress: 'Đang xử lý', Closed: 'Đã đóng' },
  feedbackStatus: { Pending: 'Chưa xử lý', Read: 'Đã đọc', Resolved: 'Đã giải quyết' },
  candidateStatus: { New: 'Mới', Interview: 'Phỏng vấn', Offer: 'Đã gửi offer', Rejected: 'Từ chối' },
  category: {
    Service: 'ThÃ¡i Äá» phá»¥c váº¥',
    Rating: 'Äánh giÃ¡ & Rating',
    General: 'Chung',
    Sales: 'TÆ° váº¥n bÃ¡n hÃ ng',
    AfterSales: 'Háº­u mÃ£i',
    Other: 'KhÃ¡c',
  },
  columnId: '#ID',
  columnSubject: 'TiÃªu Äá»',
  columnCustomer: 'KhÃ¡ch hÃ ng',
  columnPhone: 'Sá»‘ Äiá»‡n thoáº¡i',
  columnContent: 'Ná»™i dung',
  columnStatus: 'Tráº¡ng thÃ¡i',
  columnCreatedAt: 'Thá»i gian',
  columnRating: 'Äánh giÃ¡',
  columnPosition: 'Vá»‹ trÃ­',
  columnCv: 'CV / Há»“ sÆ¡',
  columnAssignedTo: 'NgÆ°á»i phá»¥ trÃ¡ch',
  noDetail: 'Chá»n má»™t liÃªn há»‡ Äá» xem chi tiáº¿t',
  replyDialog: {
    title: 'Gá»­i pháº£n há»“i',
    contentLabel: 'Ná»™i dung pháº£n há»“i',
    contentPlaceholder: 'Nháº­p ná»™i dung pháº£n há»“i...',
    sendViaEmail: 'Gá»­i qua Email',
    sendViaZalo: 'Gá»­i qua Zalo',
    sendBtn: 'Gá»­i pháº£n há»“i',
  },
  noteDialog: {
    title: 'Ghi chÃº ná»™i bá»™',
    placeholder: 'Nháº­p ghi chÃº ná»™i bá»™...',
    saveBtn: 'LÆ°u ghi chÃº',
  },
  actionReply: 'Pháº£n há»“i',
  actionNote: 'Ghi chÃº',
  actionViewCv: 'Xem CV',
  actionAssign: 'PhÃ¢n cÃ´ng',
  actionExport: 'Xuáº¥t bÃ¡o cÃ¡o',
  statusNew: 'Má»›i',
  statusInProgress: 'Äang xá»­ lÃ½',
  statusClosed: 'ÄÃ£ Äá»ng',
  statusPending: 'Chá» xá»­ lÃ½',
  statusRead: 'ÄÃ£ Äá»c',
  statusResolved: 'ÄÃ£ giáº£i quyáº¿t',
  emptySupport: 'ChÆ°a cÃ³ yÃªu cáº§u há»— trá»£ nÃ o',
  emptyFeedback: 'ChÆ°a cÃ³ Äáº§ng gÃ³p Ã½ kiáº¿n nÃ o',
  emptyCandidate: 'ChÆ°a cÃ³ há»“ sÆ¡ á»©ng viÃªn nÃ o',
  totalCount: 'Tá»•ng {count}',
  unreadBadge: 'LiÃªn há»‡ má»›i',
  cvViewer: { title: 'Xem há»“ sÆ¡ á»©ng viÃªn', noFile: 'KhÃ´ng cÃ³ file CV', download: 'Táº£i CV' },
  assignDialog: { title: 'PhÃ¢n cÃ´ng xá»­ lÃ½', selectUser: 'Chá»n nhÃ¢n viÃªn phá»¥ trÃ¡ch' },
  createDialog: {
    titleSupport: 'Táº¡o yÃªu cáº§u há»— trá»£',
    titleFeedback: 'Táº¡o Äáº§ng gÃ³p Ã½ kiáº¿n',
    titleCandidate: 'Táº¡o há»“ sÆ¡ á»©ng viÃªn',
    subject: 'TiÃªu Äá»',
    category: 'Danh má»¥c',
    email: 'Email',
    orderCode: 'MÄ ÄÆ¡n hÃ ng',
    content: 'Ná»™i dung',
    rating: 'Äánh giÃ¡',
    customerName: 'TÃªn khÃ¡ch hÃ ng',
    phoneNumber: 'Sá»‘ Äiá»‡n thoáº¡i',
    fullName: 'Há»™ vÃ  tÃªn',
    appliedPosition: 'Vá»‹ trÃ­ á»©ng tuyá»ƒn',
    cvFile: 'File CV',
    coverLetter: 'ThÆ° xin viá»‡c',
    submit: 'Táº¡o má»›i',
  },
},
marketing: {`;

content = content.replace("},\nmarketing: {", contactBlock);

fs.writeFileSync(path, content, "utf8");
console.log("Done");
