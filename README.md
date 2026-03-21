# AnhEmMotor Management Dashboard Project

[English](#english) | [Tiếng Việt](#tiếng-việt) | [Rules (Quy chuẩn)](./RULES.md)

---

<a name="english"></a>

## English

[Project Rules](./RULES.md)

**Copyright (C) 2026 Tran Thanh Binh, Nguyen Huynh Kim Ngan, Nguyen Trinh Anh Khoi, Trinh Minh Uyen.**

This project is licensed under the **Apache License 2.0**.
See the [LICENSE](LICENSE) file for details.

This project is the management system of AnhEmMotor (products, prices, orders, users, etc.).

### Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Deployment & CI/CD](#deployment--cicd)

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
VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT=https://localhost:7001
```

### Local Development

```bash
npm run dev
```

The website will run at: `http://localhost:5173`

### Deployment & CI/CD

The project uses GitHub Actions for auto-deployments.

#### Required Secrets on GitHub Repo:

| Secret Name                         | Description                          |
| ----------------------------------- | ------------------------------------ |
| `PUBLIC_API_URL_FOR_BROWSER_CLIENT` | Backend API URL (Production)         |
| `PRODUCTION_SERVER_IP`              | Production Server IP                 |
| `PRODUCTION_SERVER_USERNAME`        | SSH Username (usually root)          |
| `SERVER_REMOTE_ACCESS_PRIVATE_KEY`  | Private SSH Key to access the server |
| `SSH_PORT_FOR_PRODUCTION_SERVER`    | SSH Port (default 22)                |

#### Workflow

1. Create a pull request.
2. After the pull request is approved (if it meets quality standards), GitHub Action will automatically build the project.
3. If the build is successful, the code will be deployed to the server.

#### Troubleshooting: Port is already in use / Not run in port 5173

**Solution:**

Check if any other projects are running on port 5173. If not, try running the following two commands in Command Prompt with administrator privileges:

```
sc stop winnat
sc start winnat
```

If it hasn't been successful yet, Restart your computer.

---

<a name="tieng-viet"></a>

## Tiếng Việt

[Quy chuẩn dự án](./RULES.md)

**Copyright (C) 2026 Tran Thanh Binh, Nguyen Huynh Kim Ngan, Nguyen Trinh Anh Khoi, Trinh Minh Uyen.**

Dự án này được cấp phép theo **Giấy phép Apache 2.0**.
Xem tệp [LICENSE](LICENSE) để biết chi tiết.

Dự án này là hệ thống quản trị của AnhEmMotor (sản phẩm, giá, đơn hàng, người dùng, ...)

### Mục lục

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Cấu hình Môi trường](#cấu-hình-môi-trường)
- [Chạy Local Development](#chạy-local-development)
- [Deployment & CI/CD](#deployment--cicd-1)

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
VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT=https://localhost:7001
```

### Chạy Local Development

```bash
npm run dev
```

Trang web có thể sẽ chạy tại: `http://localhost:5173`

### Deployment & CI/CD

Dự án sử dụng GitHub Actions để auto deploy.

#### Secrets cần cấu hình trên GitHub Repo:

| Secret Name                         | Mô tả                            |
| ----------------------------------- | -------------------------------- |
| `PUBLIC_API_URL_FOR_BROWSER_CLIENT` | URL của Backend API (Production) |
| `PRODUCTION_SERVER_IP`              | IP của Server deploy             |
| `PRODUCTION_SERVER_USERNAME`        | Username SSH (thường là root)    |
| `SERVER_REMOTE_ACCESS_PRIVATE_KEY`  | Key SSH private để access server |
| `SSH_PORT_FOR_PRODUCTION_SERVER`    | Port SSH (mặc định 22)           |

#### Workflow

1. Tạo pull request
2. Sau khi được chấp nhận pull request (nếu đạt đủ chất lượng), GitHub Action sẽ tự động build.
3. Nếu build thành công, code sẽ được deploy lên server.

#### Khắc phục sự cố: Cổng đã được sử dụng / Không chạy trên cổng 5173

**Giải pháp:**

Hãy xem coi có dự án nào khác chạy trên cổng 5173 hay không. Nếu không có, hãy thử chạy 2 lệnh sau trong Command Prompt với quyền quản trị viên:

```
sc stop winnat
sc start winnat
```

Nếu vẫn không thành công, hãy khởi động lại máy tính.
