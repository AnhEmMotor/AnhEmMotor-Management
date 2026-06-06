export interface Comment {
  id: number
  author: string
  content: string
  timestamp: string
  replies: Comment[]
}

export const commentList = ref<Comment[]>([
  {
    id: 1,
    author: 'trắngđêm',
    content: 'đenthầnlờingộkhôngcủamởđấutrườngmặtthậtcủađốtnổrồi！kỳđợitrênđường！',
    timestamp: '2024-09-04 09:00',
    replies: [
      {
        id: 101,
        author: 'sông',
        content: 'làa，đặctínhlàkiavàikỹnăngđặchiệu，rútthẳngsoáinổ！',
        timestamp: '2024-09-04 09:15',
        replies: [
          {
            id: 201,
            author: 'quangmang',
            content:
              'hyvọngTốihóanăngtheotrên，KhôngnhiênnàygìhảocủahọamặtnếuquảthẻđốnthìCó thểtiếcrồi。',
            timestamp: '2024-09-04 09:30',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    author: 'nổisinh',
    content:
      'liệunóiđenthầnlờingộkhôngcầncầnrấtcaocủaCauHinh，KhôngbáođạotôicủađiệnnãonăngKhôngnăngchạykhởiđến。',
    timestamp: '2024-09-04 10:00',
    replies: [
      {
        id: 102,
        author: 'sớmnắng',
        content: 'cùngđảmtâma，nghenóicầncầnđếnthiểuRTX 3070mớinăngcaohiệuvậndòng。',
        timestamp: '2024-09-04 10:20',
        replies: [
          {
            id: 202,
            author: 'chuyểnquang',
            content: 'tôilàmởNâng cấpCauHinh，bằngnàykhoảnduhíthìlàrồi。',
            timestamp: '2024-09-04 10:40',
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    author: 'chuông',
    content: '130GBcủatồntrữcầncầucóđiểmkhoetờa，Khôngquahọachấtnàygìhảo，cũngtìnhcóCó thểnguyên。',
    timestamp: '2024-09-04 11:00',
    replies: [
      {
        id: 103,
        author: 'vânđầu',
        content: 'Chínhthựccóđiểmcao，Khôngquađểnàyloạisản phẩmchấtcủaduhí，giá trịđược。',
        timestamp: '2024-09-04 11:15',
        replies: [
          {
            id: 203,
            author: 'mộngcảnh',
            content: 'hyvọngphátbánsaunăngTốihóamộtdướianbaothểtích。',
            timestamp: '2024-09-04 11:30',
            replies: [],
          },
        ],
      },
    ],
  },
])
