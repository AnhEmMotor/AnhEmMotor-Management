import { ref, watch } from "vue";

export interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: string;
  replies: Comment[];
}

const LOCAL_STORAGE_KEY = "aemoto_mock_comments";
const saved = localStorage.getItem(LOCAL_STORAGE_KEY);

const defaultComments: Comment[] = [
  {
    id: 1,
    author: "Nguyễn Văn Hùng",
    content:
      "Mới lấy chiếc SH 125i ở showroom hôm qua, tư vấn và làm thủ tục biển số siêu nhanh. Xe đi êm lắm mọi người ơi!",
    timestamp: "2024-09-04 09:00",
    replies: [
      {
        id: 101,
        author: "Anh Em Motor",
        content:
          "Cảm ơn anh Hùng đã ủng hộ cửa hàng ạ! Chúc anh có những chuyến đi vạn dặm bình an.",
        timestamp: "2024-09-04 09:15",
        replies: [
          {
            id: 201,
            author: "Nguyễn Văn Hùng",
            content:
              "Cảm ơn shop nhé, dịch vụ hậu mãi và bảo hành ở đây rất tuyệt vời.",
            timestamp: "2024-09-04 09:30",
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    author: "Trần Minh Tâm",
    content:
      "Xưởng bảo dưỡng ở đây làm việc chuyên nghiệp không các bác? Mình định mang xe qua sửa xích với thay dầu.",
    timestamp: "2024-09-04 10:00",
    replies: [
      {
        id: 102,
        author: "Vũ Quốc Việt",
        content:
          "Làm rất kỹ nha bác, thợ tay nghề cao, kiểm tra tổng quát xe miễn phí nữa.",
        timestamp: "2024-09-04 10:20",
        replies: [
          {
            id: 202,
            author: "Trần Minh Tâm",
            content:
              "Cảm ơn bác nhé, mai em tranh thủ chạy qua làm luôn cho yên tâm.",
            timestamp: "2024-09-04 10:40",
            replies: [],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    author: "Lê Thị Mai",
    content:
      "Thủ tục trả góp mua xe máy ở đây cần những giấy tờ gì thế ạ? Có hỗ trợ nợ xấu không shop?",
    timestamp: "2024-09-04 11:00",
    replies: [
      {
        id: 103,
        author: "Anh Em Motor",
        content:
          "Chào chị Mai, thủ tục chỉ cần CCCD gắn chip thui ạ. Để kiểm tra chi tiết gói hỗ trợ trả góp, chị vui lòng để lại SĐT nhân viên sẽ gọi tư vấn cụ thể cho mình nhé.",
        timestamp: "2024-09-04 11:15",
        replies: [
          {
            id: 203,
            author: "Lê Thị Mai",
            content:
              "Dạ SĐT em là 0987654321, nhờ shop gọi tư vấn giúp em nhé. Cảm ơn shop nhiều!",
            timestamp: "2024-09-04 11:30",
            replies: [],
          },
        ],
      },
    ],
  },
];

export const commentList = ref<Comment[]>(
  saved ? JSON.parse(saved) : defaultComments,
);

watch(
  commentList,
  (newVal) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newVal));
  },
  { deep: true },
);
