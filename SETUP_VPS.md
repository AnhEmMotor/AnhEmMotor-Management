# Bước 1: Cập nhật thư viện

Chạy câu lệnh sau để cập nhật thư viện. Nếu chưa có cài sudo, buộc phải chạy trong root.

```
apt update && apt upgrade -y
apt install -y sudo curl git unzip libicu-dev build-essential
```

# Bước 2: Tạo người dùng riêng biệt

Ở đây sẽ tạo người dùng github-action. Nếu có sẵn user dùng github action thì bỏ qua bước này

```
sudo adduser -- disabled-password -- gecos "" github-action
usermod -aG sudo github-action
su - github-action
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
nano ~/.ssh/authorized_keys
```

Sau đó chạy câu lệnh trên máy tính windows, git bash để tạo public key ssh:

```
ssh-keygen -t ed25519 -C "anhemmotor-hosting"
```

Ở bước "Enter file in which to save the key", lưu ý gõ tên khác tên gốc để cho dễ nhớ, sau khi xong thì nó sẽ tạo ra 2 file. 1 file không có pub, 1 file có pub. Paste cái nội dung file .pub cho phần sudo nano trên hosting. Sau đó chạy câu lệnh:

```
sudo visudo /etc/sudoers.d/github-action
```

Thêm cái này vào cuối file. Chú ý, nếu được, sửa câu lệnh này chỉ cho chạy các lệnh cơ bản

```
github-action ALL=(ALL:ALL) NOPASSWD: ALL
```

# Bước 3: Tạo khoá SSL HTTPS trên Cloudflare (Nếu chưa cài đặt cho tên miền) & Cài đặt Ngnix (Nếu chưa cài đặt cho toàn bộ hosting)

Vào trong Cloudflare Dashboard, vào mục SSL/TLS -> Origin Server, nhấn Create Certificate.

Trong phần tạo mới, chọn:

- Generate private key and CSR with Cloudflare
- List the hostname: Ví dụ như tên miền là atmotor.com, phần này sẽ có 2 cái điền sẵn và giữ nguyên, nhưng buộc phải có: \*.atmotor.com và atmotor.com
- Choose how long before your certificate expires: Chọn thời gian dài nhất, hiện tại lúc viết là 15 năm.

Khi đó, 2 key hiện ra ở phần: Origin Certificate Installation. Với key ở Origin Certificate, bạn chạy câu lệnh sau, paste vào làm nội dung file và save nó:

```
sudo mkdir -p /etc/nginx/ssl
sudo nano /etc/nginx/ssl/anhemmotor.pem
```

Với key ở trong Private Key thì chạy câu lệnh sau và paste vào, và save nó:

```
sudo mkdir -p /etc/nginx/ssl
sudo nano /etc/nginx/ssl/anhemmotor.key
```

Sau đó chạy câu lệnh

```
sudo apt update
sudo apt install nginx -y
```

Tạo file ngnix cho dự án:

```
sudo nano /etc/nginx/sites-available/anhemmotor
```

Nội dung như sau, chỉnh sửa lại địa chỉ chứa dự án, cổng chạy dự án:

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;
    ssl_certificate /etc/nginx/ssl/anhemmotor.pem;
    ssl_certificate_key /etc/nginx/ssl/anhemmotor.key;
    return 444;
}

server {
    listen 80;
    server_name anhemmotor.online admin.anhemmotor.online api.anhemmotor.online monitor.anhemmotor.online;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name admin.anhemmotor.online;
    ssl_certificate /etc/nginx/ssl/anhemmotor.pem;
    ssl_certificate_key /etc/nginx/ssl/anhemmotor.key;
    root /var/www/anhemmotor/frontend-management;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Sau đó chạy câu lệnh để link với file vừa mới tạo (nếu đang chỉnh file có sẵn và chạy được thì không cần chạy 2 câu lệnh đầu mà chạy mỗi câu lệnh cuối):

```
sudo ln -s /etc/nginx/sites-available/anhemmotor /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

# Bước 4: Tạo folder chứa dự án và dữ liệu của dự án

```
sudo chown -R github-action:github-action /var/www/anhemmotor/
sudo chmod -R 755 /var/www/anhemmotor/
sudo mkdir -p /var/www/anhemmotor/frontend-management
```
