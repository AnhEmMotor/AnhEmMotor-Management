import fs from 'fs'

const path = 'd:/DATN/AnhEmMotor/AnhEmMotor-Management/src/i18n/package/vi.ts'
let content = fs.readFileSync(path, 'utf8')

// The target marker: line 436 is "},", line 437 is "marketing: {"
// We want to replace the transition with: "},\ncontact: { ... },\nmarketing: {"

const contactBlock = `},
contact: {
  title: 'Quăn lÃ½ LiÃªn háº·',
  subtitle: 'Tiáº¿p nháº­n & xá»­ lÃ½ yÃªu cáº§u há»— trá»£, pháº£n há»“i vÃ  há»“ sÆ¡ á»©ng viÃªn',
  tabSupport: 'YÃªu cáº§u há»— trá»£',
  tabFeedback: 'Äáº§ng gÃ³p Ã½ kiáº¿n',
  tabCandidate: 'Há»“ sÆ¡ á»©ng viÃªn',
  searchPlaceholder: 'TÃ¬m tÃªn, email, SÄ\á»T, tiÃªu Äá»...',
  allStatus: 'Táº¥t cáº£ tráº¡ng thÃ¡i',
  supportStatus: { New: 'Má»›i', InProgress: 'Äang xá»­ lÃ½', Closed: 'ÄÃ£ Äá»ng' },
  feedbackStatus: { Pending: 'ChÆ°a xá»­ lÃ½', Read: 'ÄÃ£ Äá»c', Resolved: 'ÄÃ£ giáº£i quyáº¿t' },
  candidateStatus: { New: 'Má»›i', Interview: 'Phá»ỏng váº¥n', Offer: 'ÄÃ£ gá»­i offer', Rejected: 'Tá»« chá»i' },
  category: {
    Quality: 'Cháº¥t lÆ°á»£ng xe',
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
marketing: {`

content = content.replace('},\nmarketing: {', contactBlock)

fs.writeFileSync(path, content, 'utf8')
console.log('Done')
