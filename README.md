# AnhEmMotor Management Dashboard Project

**Copyright (C) 2026 Tran Thanh Binh, Nguyen Huynh Kim Ngan, Nguyen Trinh Anh Khoi, Trinh Minh Uyen.**

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.
See the [LICENSE](LICENSE) file for details.

Dự án này là hệ thống quản trị của AnhEmMotor (sản phẩm, giá, đơn hàng, người dùng, ...)

# Yêu cầu hệ thống
- Node.js (v20 trở lên)
- Access to GitHub Repository

# Cài đặt

Clone dự án và cài đặt dependencies:

```bash
git clone <repo-url>
cd AnhEmMotor-Management
npm install
```

# Cấu hình Môi trường

Tạo file `.env` từ file mẫu:

```bash
cp .env.template .env
```

Cập nhật thông tin trong `.env`:

```properties
# URL của Backend API (Production hoặc Local)
VITE_API_URL=https://localhost:7001
```

# Chạy Local Development

```bash
npm run dev
```
Trang web có thể sẽ chạy tại: `http://localhost:5173`

# Deployment & CI/CD

Dự án sử dụng GitHub Actions để auto deploy.

## Secrets cần cấu hình trên GitHub Repo:

| Secret Name | Mô tả |
|-------------|-------|
| `VITE_API_URL` | URL của Backend API (Production) |
| `REMOTE_HOST` | IP của Server deploy |
| `REMOTE_USER` | Username SSH (thường là root) |
| `SSH_PRIVATE_KEY` | Key SSH private để access server |
| `REMOTE_PORT` | Port SSH (mặc định 22) |

## Workflow
1. Tạo pull request
2. Sau khi được chắp nhận pull request (nếu đạt đủ chất lượng), GitHub Action sẽ tự động build.
3. Nếu build thành công, code sẽ được deploy lên server.
