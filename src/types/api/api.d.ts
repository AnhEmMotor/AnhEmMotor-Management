declare namespace Api {
  namespace Common {
    interface PaginationParams {
      current: number

      size: number

      total: number
    }

    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    type EnableStatus = '1' | '2'
  }

  namespace Auth {
    interface LoginParams {
      usernameOrEmail: string
      password: string
    }

    interface LoginResponse {
      accessToken: string
      refreshToken?: string
    }

    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: string
      userName: string
      email: string
      avatar?: string
    }

    interface GoogleLoginParams {
      idToken: string
    }

    interface FacebookLoginParams {
      accessToken: string
    }

    interface ExternalAuthConfigResponse {
      googleClientId: string
      facebookAppId: string
    }
  }

  namespace SystemManage {
    type UserList = Api.Common.PaginatedResponse<UserListItem>

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

    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
    >

    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams & {
          startTime: string | null
          endTime: string | null
        }
    >
  }
}
