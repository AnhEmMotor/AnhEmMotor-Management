import request from '@/utils/http'

/**
 * DangNhap
 * @param params DangNhapTham số
 * @returns DangNhapứng
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    params
    // showSuccessMessage: true // Hiển thịThanhCongTinNhan
    // showErrorMessage: false // KhôngHiển thịLỗiTinNhan
  })
}

/**
 * LấyNguoiDungThongTin
 * @returns NguoiDungThongTin
 */
export function fetchGetUserInfo() {
  return request.get<any>({
    url: '/api/user/me'
  })
}
