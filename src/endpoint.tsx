/**
 * Zero-dependency Axios-compatible HTTP client & API Endpoints.
 * Works natively with browser fetch — no external npm package installation required.
 */

export interface AxiosRequestConfig {
  baseURL?: string
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined | null>
  data?: any
  timeout?: number
  [key: string]: any
}

export interface AxiosResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
  config: AxiosRequestConfig
}

type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>
type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>
type ErrorInterceptor = (error: any) => any

export class AxiosClient {
  public defaults: AxiosRequestConfig
  public interceptors = {
    request: {
      use: (onFulfilled: RequestInterceptor, onRejected?: ErrorInterceptor) => {
        this.requestInterceptors.push({ onFulfilled, onRejected })
      }
    },
    response: {
      use: (onFulfilled: ResponseInterceptor, onRejected?: ErrorInterceptor) => {
        this.responseInterceptors.push({ onFulfilled, onRejected })
      }
    }
  }

  private requestInterceptors: Array<{ onFulfilled: RequestInterceptor; onRejected?: ErrorInterceptor }> = []
  private responseInterceptors: Array<{ onFulfilled: ResponseInterceptor; onRejected?: ErrorInterceptor }> = []

  constructor(defaults: AxiosRequestConfig = {}) {
    this.defaults = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...defaults,
    }
  }

  public async request<T = any>(
    config: AxiosRequestConfig & { url?: string; method?: string; data?: any }
  ): Promise<AxiosResponse<T>> {
    let mergedConfig: AxiosRequestConfig & { url?: string; method?: string; data?: any } = {
      ...this.defaults,
      ...config,
      headers: {
        ...this.defaults.headers,
        ...config.headers,
      }
    }

    for (const interceptor of this.requestInterceptors) {
      try {
        mergedConfig = await interceptor.onFulfilled(mergedConfig)
      } catch (err) {
        if (interceptor.onRejected) return interceptor.onRejected(err)
        throw err
      }
    }

    let fullUrl = mergedConfig.url || ''
    if (!/^https?:\/\//i.test(fullUrl) && mergedConfig.baseURL) {
      const base = mergedConfig.baseURL.replace(/\/+$/, '')
      const path = fullUrl.replace(/^\/+/, '')
      fullUrl = `${base}/${path}`
    }

    if (mergedConfig.params) {
      const query = new URLSearchParams()
      for (const [k, v] of Object.entries(mergedConfig.params)) {
        if (v !== undefined && v !== null) query.append(k, String(v))
      }
      const qs = query.toString()
      if (qs) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs
      }
    }

    const fetchOptions: RequestInit = {
      method: (mergedConfig.method || 'GET').toUpperCase(),
      headers: mergedConfig.headers,
    }

    if (mergedConfig.data !== undefined) {
      if (
        typeof mergedConfig.data === 'string' ||
        mergedConfig.data instanceof FormData ||
        mergedConfig.data instanceof Blob
      ) {
        fetchOptions.body = mergedConfig.data
      } else {
        fetchOptions.body = JSON.stringify(mergedConfig.data)
      }
    }

    const response = await fetch(fullUrl, fetchOptions)
    const contentType = response.headers.get('content-type') || ''
    let responseData: any = null

    if (contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null)
    } else {
      responseData = await response.text().catch(() => '')
    }

    let axiosResponse: AxiosResponse<T> = {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: mergedConfig,
    }

    if (!response.ok) {
      const error: any = new Error(
        responseData?.message || `Request failed with status code ${response.status}`
      )
      error.response = axiosResponse
      error.config = mergedConfig
      error.status = response.status

      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onRejected) {
          return interceptor.onRejected(error)
        }
      }
      throw error
    }

    for (const interceptor of this.responseInterceptors) {
      try {
        axiosResponse = await interceptor.onFulfilled(axiosResponse)
      } catch (err) {
        if (interceptor.onRejected) return interceptor.onRejected(err)
        throw err
      }
    }

    return axiosResponse
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, data, method: 'POST' })
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, data, method: 'PUT' })
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, url, data, method: 'PATCH' })
  }
}

export const BASE_URL = 'https://worktrail.ai/api'

// Configured Axios-compatible instance for Worktrail API
export const apiClient = new AxiosClient({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    APIKEY: 'Securitas@#!1234',
  },
})

// Automatically attach JWT token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('worktrail_token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const axios = {
  create: (config?: AxiosRequestConfig) => new AxiosClient(config),
  get: (url: string, config?: AxiosRequestConfig) => apiClient.get(url, config),
  post: (url: string, data?: any, config?: AxiosRequestConfig) => apiClient.post(url, data, config),
  put: (url: string, data?: any, config?: AxiosRequestConfig) => apiClient.put(url, data, config),
  delete: (url: string, config?: AxiosRequestConfig) => apiClient.delete(url, config),
  patch: (url: string, data?: any, config?: AxiosRequestConfig) => apiClient.patch(url, data, config),
}

export const API_ENDPOINTS = {
  auth: {
    login: `${BASE_URL}/login`,
    register: `${BASE_URL}/Register`,
    logout: `${BASE_URL}/auth/logout`,
    me: `${BASE_URL}/auth/me`,
  },
  menu: `${BASE_URL}/Menu`,
  payments: {
    createOrder: `${BASE_URL}/Payment/CreateOrder`,
    verify: `${BASE_URL}/Payment/Verify`,
    transaction: (orderId: string) => `${BASE_URL}/Payment/Transaction/${encodeURIComponent(orderId)}`,
  },
  users: {
    profile: `${BASE_URL}/users/profile`,
  },
} as const

export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]]

export const api = apiClient
export default apiClient