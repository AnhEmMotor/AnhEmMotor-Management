import request from "@/common/utils/http";

export interface CommentResponse {
  id: number;
  newsId: number;
  userId?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export const commentApi = {
  getAll() {
    return request.get<CommentResponse[]>({
      url: "/api/v1/news-comments",
    });
  },
  getByNewsId(newsId: number) {
    return request.get<CommentResponse[]>({
      url: `/api/v1/news-comments/news/${newsId}`,
    });
  },
};
