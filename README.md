# AnhEmMotor Management Dashboard Project


---

## English

**Copyright (C) 2026 Tran Thanh Binh, Nguyen Huynh Kim Ngan, Nguyen Trinh Anh Khoi, Trinh Minh Uyen.**

This project is licensed under the **Apache License 2.0**.
See the [LICENSE](LICENSE) file for details.

This project is the management system of AnhEmMotor (products, prices, orders, users, etc.).

### System Requirements
- Node.js (v20 or higher)
- Access to GitHub Repository

### Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd AnhEmMotor-Management
npm install
```

### Environment Configuration

Create a `.env` file from the template:

```bash
cp .env.template .env
```

Update the information in `.env`:

```properties
# Backend API URL (Production or Local)
VITE_API_URL=https://localhost:7001
```

### Local Development

```bash
npm run dev
```
The website will run at: `http://localhost:5173`

### Deployment & CI/CD

The project uses GitHub Actions for auto-deployments.

#### Required Secrets on GitHub Repo:

| Secret Name | Description |
|-------------|-------------|
| `VITE_API_URL` | Backend API URL (Production) |
| `REMOTE_HOST` | Production Server IP |
| `REMOTE_USER` | SSH Username (usually root) |
| `SSH_PRIVATE_KEY` | Private SSH Key to access the server |
| `REMOTE_PORT` | SSH Port (default 22) |

#### Workflow
1. Create a pull request.
2. After the pull request is approved (if it meets quality standards), GitHub Action will automatically build the project.
3. If the build is successful, the code will be deployed to the server.

---

## Tiếng Việt

**Copyright (C) 2026 Tran Thanh Binh, Nguyen Huynh Kim Ngan, Nguyen Trinh Anh Khoi, Trinh Minh Uyen.**

Dự án này được cấp phép theo **Giấy phép Apache 2.0**.
Xem tệp [LICENSE](LICENSE) để biết chi tiết.

Dự án này là hệ thống quản trị của AnhEmMotor (sản phẩm, giá, đơn hàng, người dùng, ...)

### Yêu cầu hệ thống
- Node.js (v20 trở lên)
- Access to GitHub Repository

### Cài đặt

Clone dự án và cài đặt dependencies:

```bash
git clone <repo-url>
cd AnhEmMotor-Management
npm install
```

### Cấu hình Môi trường

Tạo file `.env` từ file mẫu:

```bash
cp .env.template .env
```

Cập nhật thông tin trong `.env`:

```properties
# URL của Backend API (Production hoặc Local)
VITE_API_URL=https://localhost:7001
```

### Chạy Local Development

```bash
npm run dev
```
Trang web có thể sẽ chạy tại: `http://localhost:5173`

### Deployment & CI/CD

Dự án sử dụng GitHub Actions để auto deploy.

#### Secrets cần cấu hình trên GitHub Repo:

| Secret Name | Mô tả |
|-------------|-------|
| `VITE_API_URL` | URL của Backend API (Production) |
| `REMOTE_HOST` | IP của Server deploy |
| `REMOTE_USER` | Username SSH (thường là root) |
| `SSH_PRIVATE_KEY` | Key SSH private để access server |
| `REMOTE_PORT` | Port SSH (mặc định 22) |

#### Workflow
1. Tạo pull request
2. Sau khi được chấp nhận pull request (nếu đạt đủ chất lượng), GitHub Action sẽ tự động build.
3. Nếu build thành công, code sẽ được deploy lên server.
