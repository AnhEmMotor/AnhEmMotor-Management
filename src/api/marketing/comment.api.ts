import request from "@/common/utils/http";

export interface NewsCommentResponse {
  id: number;
  newsId: number;
  newsTitle?: string;
  userId?: string;
  authorName?: string;
  authorEmail?: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
}

export const commentApi = {
  getAll() {
    return request.get<NewsCommentResponse[]>({
      url: "/api/v1/news-comments",
    });
  },
  getByNewsId(newsId: number) {
    return request.get<NewsCommentResponse[]>({
      url: `/api/v1/news-comments/news/${newsId}`,
    });
  },
};
