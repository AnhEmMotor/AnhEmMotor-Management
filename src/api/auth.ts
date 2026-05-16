import request from '@/utils/http'

export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    params
  })
}

export function fetchGetUserInfo() {
  return request.get<any>({
    url: '/api/user/me'
  })
}
