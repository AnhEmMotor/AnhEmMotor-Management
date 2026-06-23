import { fetchLogin, fetchGetUserInfo } from "@/api/auth";

// Types are from global namespace Api (declared in src/types/api/api.d.ts)
export interface AuthState {
  token: string | null;
  userInfo: Api.Auth.UserInfo | null;
  isAuthenticated: boolean;
}

class AuthService {
  private readonly TOKEN_KEY = "auth_token";

  async login(credentials: Api.Auth.LoginParams): Promise<AuthState> {
    try {
      const response = await fetchLogin(credentials);

      const token = response.accessToken;
      if (!token) {
        throw new Error("No access token received");
      }

      this.setToken(token);

      // Fetch user info after login
      const userInfo = await this.getUserInfo();

      return {
        token,
        userInfo,
        isAuthenticated: true,
      };
    } catch (error) {
      console.error("[AuthService] Login failed:", error);
      this.clearToken();
      throw error;
    }
  }

  async register(_data: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
  }): Promise<AuthState> {
    // TODO: Implement register API call when available
    throw new Error("Register API not implemented yet");
  }

  async logout(): Promise<void> {
    try {
      // TODO: Call backend logout endpoint if exists
      // await fetchLogout();
    } finally {
      this.clearToken();
    }
  }

  async getUserInfo(): Promise<Api.Auth.UserInfo | null> {
    try {
      const response = await fetchGetUserInfo();
      return response as Api.Auth.UserInfo;
    } catch (error) {
      console.error("[AuthService] Get user info failed:", error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
