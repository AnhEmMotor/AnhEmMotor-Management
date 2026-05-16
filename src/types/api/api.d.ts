/**
 * API Giao diện (Interface)loạikiểuĐịnh nghĩamôkhối
 *
 * gợicungnêncósauđầuGiao diện (Interface)củaloạikiểuĐịnh nghĩa
 *
 * ## chủcầncôngnăng
 *
 * - thôngdùngloạikiểu（Phân trangTham số、ứngKếtcấubằng）
 * - danhtínhloạikiểu（DangNhap、NguoiDungThongTinbằng）
 * - HeThongQuản lýloạikiểu（NguoiDung、VaiTrobằng）
 * - toànbộmệnhdanhkhônggianâmminh
 *
 * ## khiếndùngtrườngcảnh
 *
 * - API Vui lòngcầuTham sốloạikiểuhẹnthúc
 * - API ứngDữ liệuloạikiểuĐịnh nghĩa
 * - Giao diện (Interface)TaiLieuloạikiểucùngbước
 *
 * ## tâmýviệcmục
 *
 * - tại .vue vănphần tửkhiếndùngcầncầntại eslint.config.mjs trongCauHinh globals: { Api: 'readonly' }
 * - khiếndùngtoànbộmệnhdanhkhônggian，vôcầnNhập filelàCó thểkhiếndùng
 *
 * ## khiếndùngphươngkiểu
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** thôngdùngloạikiểu */
  namespace Common {
    /** Phân trangTham số */
    interface PaginationParams {
      /** khitrướctrangmã */
      current: number
      /** mỗitrangđiềusố */
      size: number
      /** tổngđiềusố */
      total: number
    }

    /** thôngdùngTimKiemTham số */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** Phân trangứngCơ bảnKếtcấu */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** BậtTrạng thái */
    type EnableStatus = '1' | '2'
  }

  /** danhtínhloạikiểu */
  namespace Auth {
    /** DangNhapTham số */
    interface LoginParams {
      usernameOrEmail: string
      password: string
    }

    /** DangNhapứng */
    interface LoginResponse {
      accessToken: string
      refreshToken?: string
    }

    /** NguoiDungThongTin */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: string
      userName: string
      email: string
      avatar?: string
    }
  }

  /** HeThongQuản lýloạikiểu */
  namespace SystemManage {
    /** NguoiDungDanh sách */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** NguoiDungDanh sáchmục */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** NguoiDungTimKiemTham số */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    /** VaiTroDanh sách */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** VaiTroDanh sáchmục */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** VaiTroTimKiemTham số */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams & {
          startTime: string | null
          endTime: string | null
        }
    >
  }
}
