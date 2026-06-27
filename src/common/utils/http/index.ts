import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useUserStore } from "@/application/store/user";
import { ApiStatus } from "./status";
import { HttpError, handleError, showError, showSuccess } from "./error";
import { $t } from "@/i18n";
import { BaseResponse } from "@/types";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const REQUEST_TIMEOUT = 15000;
const LOGOUT_DELAY = 500;
const MAX_RETRIES = 0;
const RETRY_DELAY = 1000;
const UNAUTHORIZED_DEBOUNCE_TIME = 3000;

let isUnauthorizedErrorShown = false;
let unauthorizedTimer: NodeJS.Timeout | null = null;

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean;
  showSuccessMessage?: boolean;
}

const { VITE_WITH_CREDENTIALS } = import.meta.env;
const baseUrl =
  import.meta.env.VITE_PUBLIC_API_URL_FOR_BROWSER_CLIENT ||
  "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: REQUEST_TIMEOUT,
  withCredentials: VITE_WITH_CREDENTIALS !== "false",
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers["content-type"] as string;
      if (contentType?.includes("application/json")) {
        try {
          return JSON.parse(data);
        } catch {
          return data;
        }
      }
      return data;
    },
  ],
});

axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const userStore = useUserStore();
    // Get token from store first (reactive), fallback to localStorage for initial requests
    let token = userStore.accessToken;
    if (!token) {
      // Fallback to localStorage for initial load when store hydration hasn't completed yet
      // Check both old and new keys for backwards compatibility
      token =
        localStorage.getItem("auth_token") ||
        (() => {
          const userData = localStorage.getItem("user");
          if (userData) {
            try {
              return JSON.parse(userData).accessToken;
            } catch {
              return null;
            }
          }
          return null;
        })();
    }

    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }

    if (
      request.data &&
      !(request.data instanceof FormData) &&
      !request.headers["Content-Type"]
    ) {
      request.headers.set("Content-Type", "application/json");
      request.data = JSON.stringify(request.data);
    }

    return request;
  },
  (error) => {
    showError(
      createHttpError($t("httpMsg.requestConfigError"), ApiStatus.error),
    );
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { status, data } = response;

    if (data && typeof data.code === "number") {
      if (data.code === ApiStatus.success) return response;
      if (data.code === ApiStatus.unauthorized)
        handleUnauthorizedError(data.msg);
      throw createHttpError(data.msg || $t("httpMsg.requestFailed"), data.code);
    }

    if (status >= 200 && status < 300) {
      response.data = {
        code: ApiStatus.success,
        msg: "success",
        data: data,
      };
      return response;
    }

    return response;
  },
  async (error) => {
    const { response } = error;
    if (response) {
      const { status, data } = response;
      let backendMsg: string | undefined;

      if (status === ApiStatus.unauthorized) {
        const originalRequest = error.config as ExtendedAxiosRequestConfig & {
          _retry?: boolean;
        };

        if (
          originalRequest &&
          !originalRequest._retry &&
          originalRequest.url !== "/api/v1/auth/refresh-token" &&
          originalRequest.url !== "/api/v1/Auth/refresh-token"
        ) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                return axiosInstance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshResponse = await axios.post(
              "/api/v1/auth/refresh-token",
              {},
              {
                withCredentials:
                  import.meta.env.VITE_WITH_CREDENTIALS !== "false",
              },
            );

            const newAccessToken =
              refreshResponse.data?.data?.accessToken ||
              refreshResponse.data?.accessToken;

            if (newAccessToken) {
              const userStore = useUserStore();
              userStore.setToken(newAccessToken);
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] =
                `Bearer ${newAccessToken}`;
              processQueue(null, newAccessToken);
              return axiosInstance(originalRequest);
            } else {
              throw new Error("No token returned");
            }
          } catch (err) {
            processQueue(err, null);
            backendMsg =
              data?.errors?.[0]?.message ||
              data?.Message ||
              data?.msg ||
              data?.message ||
              "Truy cập không được phép, vui lòng đăng nhập lại";
            handleUnauthorizedError(backendMsg);
            return Promise.reject(err);
          } finally {
            isRefreshing = false;
          }
        } else {
          // Extract backend error message more carefully
          backendMsg =
            data?.errors?.[0]?.message ||
            data?.Message ||
            data?.msg ||
            data?.message ||
            "Truy cập không được phép, vui lòng đăng nhập lại";
          handleUnauthorizedError(backendMsg);
        }
      }

      if (!backendMsg && data?.errors) {
        if (Array.isArray(data.errors)) {
          backendMsg = data.errors
            .map((e: any) => e.message || e.Message || JSON.stringify(e))
            .join(", ");
        } else if (typeof data.errors === "object") {
          backendMsg = Object.values(data.errors).flat().join(", ");
        }
      }

      if (backendMsg) {
        return Promise.reject(new HttpError(backendMsg, status, { data }));
      }
    }
    return Promise.reject(handleError(error));
  },
);

function createHttpError(message: string, code: number) {
  return new HttpError(message, code);
}

function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(
    message || $t("httpMsg.unauthorized"),
    ApiStatus.unauthorized,
  );

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true;
    logOut();

    unauthorizedTimer = setTimeout(
      resetUnauthorizedError,
      UNAUTHORIZED_DEBOUNCE_TIME,
    );

    showError(error, true);
    throw error;
  }

  throw error;
}

function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false;
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer);
  unauthorizedTimer = null;
}

function logOut() {
  setTimeout(() => {
    useUserStore().logOut();
  }, LOGOUT_DELAY);
}

function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout,
  ].includes(statusCode);
}

async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES,
): Promise<T> {
  try {
    return await request<T>(config);
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY);
      return retryRequest<T>(config, retries - 1);
    }
    throw error;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T = any>(
  config: ExtendedAxiosRequestConfig,
): Promise<T> {
  if (
    ["POST", "PUT"].includes(config.method?.toUpperCase() || "") &&
    config.params &&
    !config.data
  ) {
    config.data = config.params;
    config.params = undefined;
  }

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config);

    if (config.showSuccessMessage && res.data.msg) {
      showSuccess(res.data.msg);
    }

    return res.data.data as T;
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false;
      showError(error, showMsg);
    }
    return Promise.reject(error);
  }
}

const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: "GET" });
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: "POST" });
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: "PUT" });
  },
  patch<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: "PATCH" });
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: "DELETE" });
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config);
  },
};

export default api;
