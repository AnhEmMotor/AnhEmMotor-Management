import fs from 'fs'
import path from 'path'

const replacements = {
  'Cấu hình': 'CauHinh',
  'Thực hiện': 'ThucHien',
  'Hành động': 'HanhDong',
  'Chi tiết': 'ChiTiet',
  'Thông báo': 'ThongBao',
  'Người dùng': 'NguoiDung',
  'Mật mã': 'MatMa',
  'Vai trò': 'VaiTro',
  'Quyền hạn': 'QuyenHan',
  'Danh mục': 'DanhMuc',
  'Đường dẫn': 'DuongDan',
  'Trang chủ': 'TrangChu',
  'Đăng nhập': 'DangNhap',
  'Đăng ký': 'DangKy',
  'Thành công': 'ThanhCong',
  'Thất bại': 'ThatBai',
  'Lỗi sai': 'LoiSai',
  'Cảnh báo': 'CanhBao',
  'Chính xác': 'ChinhXac',
  'Khởi tạo': 'KhoiTao',
  'Thường dùng': 'ThuongDung',
  'Tập hợp': 'TapHop',
  'Cá nhân': 'CaNhan',
  'Tự định nghĩa': 'TuDinhNghia',
  'Hoạt ảnh': 'HoatAnh',
  'Hiệu ứng': 'HieuUng',
  'Thành phần': 'ThanhPhan',
  'Cửa sổ': 'CuaSo',
  'Tiến độ': 'TienDo',
  'Tiêu đề': 'TieuDe',
  'Nội dung': 'NoiDung',
  'Ghi chú': 'GhiChu',
  'Thời gian': 'ThoiGian',
  'Ngày tháng': 'NgayThang',
  'Vị trí': 'ViTri',
  'Hệ thống': 'HeThong',
  'Cài đặt': 'CaiDat',
  'Máy chủ': 'MayChu',
  'Địa chỉ': 'DiaChi',
  'Tên miền': 'TenMien',
  'Giao thức': 'GiaoThuc',
  'Giới tính': 'GioiTinh',
  'Điện thoại': 'DienThoai',
  'Thư điện tử': 'ThuDienTu',
  'Liên hệ': 'LienHe',
  'Địa đồ': 'DiaDo',
  'Tìm kiếm': 'TimKiem',
  'Kết quả': 'KetQua',
  'Sắp xếp': 'SapXep',
  'Lựa chọn': 'LuaChon',
  'Văn bản': 'VanBan',
  'Mặc định': 'MacDinh',
  'Phương thức': 'PhuongThuc',
  'Đối tượng': 'DoiTuong',
  'Thuộc tính': 'ThuocTinh',
  'Phòng ban': 'PhongBan',
  'Chức vụ': 'ChucVu',
  'Nhân viên': 'NhanVien',
  'Khách hàng': 'KhachHang',
  'Hợp đồng': 'HopDong',
  'Dự án': 'DuAn',
  'Nhiệm vụ': 'NhiemVu',
  'Kế hoạch': 'KeHoach',
  'Phê duyệt': 'PheDuyet',
  'Chấp thuận': 'ChapThuan',
  'Từ chối': 'TuChoi',
  'Xử lý': 'XuLy',
  'Hoàn thành': 'HoanThanh',
  'Tạm dừng': 'TamDung',
  'Kết thúc': 'KetThuc',
  'Phát hành': 'PhatHanh',
  'Thu hồi': 'ThuHoi',
  'Xóa bỏ': 'XoaBo',
  'Tin tức': 'TinTuc',
  'Thao tác': 'ThaoTac',
  'Nhật ký': 'NhatKy',
  'Ngoại lệ': 'NgoaiLe',
  'Báo cáo': 'BaoCao',
  'Thống kê': 'ThongKe',
  'Phân tích': 'PhanTich',
  'Tổng quan': 'TongQuan',
  'Bảng điều khiển': 'BangDieuKhien',
  'Thực tại': 'ThucTai',
  'Lịch sử': 'LichSu',
  'Bộ nhớ': 'BoNho',
  'Xóa sạch': 'XoaSach',
  'Đồng bộ': 'DongBo',
  'Bất đồng bộ': 'BatDongBo',
  'Hàng đợi': 'HangDoi',
  'Tin nhắn': 'TinNhan',
  'Sản phẩm': 'SanPham',
  'Hàng hóa': 'HangHoa',
  'Giá cả': 'GiaCa',
  'Số tiền': 'SoTien',
  'Thanh toán': 'ThanhToan',
  'Hoàn tiền': 'HoanTien',
  'Hóa đơn': 'HoaDon',
  'Vận chuyển': 'VanChuyen',
  'Chuyển phát': 'ChuyenPhat',
  'Địa điểm nhận': 'DiaDiemNhan',
  'Tài khoản': 'TaiKhoan',
  'Số dư': 'SoDu',
  'Nạp tiền': 'NapTien',
  'Rút tiền': 'RutTien',
  'Ngân hàng': 'NganHang',
  'Cửa hàng': 'CuaHang',
  'Khuyến mãi': 'KhuyenMai',
  'Quảng cáo': 'QuangCao',
  'Ưu đãi': 'UuDai',
  'Điểm tích': 'DiemTich',
  'Thành viên': 'ThanhVien',
  'Trực tuyến': 'TrucTuyen',
  'Ngoại tuyến': 'NgoaiTuyen',
  'Gợi nhắc': 'GoiNhac',
  'Tin riêng': 'TinRieng',
  'Bạn bè': 'BanBe',
  'Tài liệu': 'TaiLieu',
  'Chia sẻ': 'ChiaSe',
  'Sưu tầm': 'SuuTam',
  'Lượt thích': 'LuotThich',
  'Bình luận': 'BinhLuan',
  'Trả lời': 'TraLoi',
  'Thịnh hành': 'ThinhHanh',
  'Đề xuất': 'DeXuat',
  'Chủ đề': 'ChuDe',
  'Thẻ tên': 'TheTen',
  'Thông tin': 'ThongTin',
  'Sự kiện': 'SuKien',
  'Cuộc thi': 'CuocThi',
  'Trực tiếp': 'TrucTiep',
  'Cộng đồng': 'CongDong',
  'Diễn đàn': 'DienDan',
  'Trợ giúp': 'TroGiup',
  'Phản hồi': 'PhanHoi',
  'Quyền riêng': 'QuyenRieng',
  'An toàn': 'AnToan',
  'Xác thực danh tính': 'XacThucDanhTinh'
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  for (const [key, value] of Object.entries(replacements)) {
    // We only replace if it's likely part of an identifier (follows a dot or is in a property definition)
    // But to be safe, let's replace ALL occurrences that have spaces.
    if (content.includes(key)) {
      content = content.split(key).join(value)
      modified = true
    }
  }
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`Repaired: ${filePath}`)
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walkDir(filePath)
      }
    } else if (/\.(vue|ts|js|json|html|mjs|css|scss)$/.test(file)) {
      processFile(filePath)
    }
  }
}

walkDir('src')
console.log('Repair complete.')
