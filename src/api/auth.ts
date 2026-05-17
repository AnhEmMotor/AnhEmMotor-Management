import request from '@/utils/http'

export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    params
  })
}

export function fetchGoogleLogin(params: Api.Auth.GoogleLoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/google',
    params
  })
}

export function fetchFacebookLogin(params: Api.Auth.FacebookLoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/facebook',
    params
  })
}

export function fetchExternalAuthConfig() {
  return request.get<Api.Auth.ExternalAuthConfigResponse>({
    url: '/api/auth/external-config'
  })
}

export function fetchGetUserInfo() {
  return request.get<any>({
    url: '/api/user/me'
  })
}
