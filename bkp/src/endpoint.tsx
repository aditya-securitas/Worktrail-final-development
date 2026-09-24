/**
 * Lightweight Axios-compatible HTTP client & API Endpoints.
 * Pure fetch implementation with zero external dependencies.
 */

export interface AxiosRequestConfig {
  baseURL?: string
  headers?: Record<string, string>
  params?: Record<string, any>
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

export class AxiosClient {
  public defaults: AxiosRequestConfig
  public interceptors = {
    request: { use: (fn: (c: AxiosRequestConfig) => any) => { this.reqInterceptors.push(fn) } },
    response: { use: (fn: (r: AxiosResponse) => any) => { this.resInterceptors.push(fn) } },
  }
  private reqInterceptors: Array<(c: AxiosRequestConfig) => any> = []
  private resInterceptors: Array<(r: AxiosResponse) => any> = []

  constructor(defaults: AxiosRequestConfig = {}) {
    this.defaults = { headers: { 'Content-Type': 'application/json' }, ...defaults }
  }

  async request<T = any>(cfg: AxiosRequestConfig & { url?: string; method?: string }): Promise<AxiosResponse<T>> {
    let conf: AxiosRequestConfig = {
      ...this.defaults,
      ...cfg,
      headers: { ...this.defaults.headers, ...cfg.headers },
    }
    for (const fn of this.reqInterceptors) conf = (await fn(conf)) || conf

    let url = conf.url || ''
    if (!/^https?:\/\//i.test(url) && conf.baseURL) {
      url = `${conf.baseURL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`
    }

    if (conf.params) {
      const q = new URLSearchParams()
      Object.entries(conf.params).forEach(([k, v]) => v != null && q.append(k, String(v)))
      const qs = q.toString()
      if (qs) url += (url.includes('?') ? '&' : '?') + qs
    }

    const isJson = conf.data && typeof conf.data === 'object' && !(conf.data instanceof FormData || conf.data instanceof Blob)
    const res = await fetch(url, {
      method: (conf.method || 'GET').toUpperCase(),
      headers: conf.headers,
      body: isJson ? JSON.stringify(conf.data) : conf.data,
    })

    const ct = res.headers.get('content-type') || ''
    const data = ct.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => '')
    let axiosRes: AxiosResponse<T> = { data, status: res.status, statusText: res.statusText, headers: res.headers, config: conf }

    if (!res.ok) {
      const err: any = new Error(data?.message || `Request failed with status code ${res.status}`)
      err.response = axiosRes
      err.config = conf
      err.status = res.status
      throw err
    }

    for (const fn of this.resInterceptors) axiosRes = (await fn(axiosRes)) || axiosRes
    return axiosRes
  }

  get = <T = any>(url: string, c?: AxiosRequestConfig) => this.request<T>({ ...c, url, method: 'GET' })
  post = <T = any>(url: string, data?: any, c?: AxiosRequestConfig) => this.request<T>({ ...c, url, data, method: 'POST' })
  put = <T = any>(url: string, data?: any, c?: AxiosRequestConfig) => this.request<T>({ ...c, url, data, method: 'PUT' })
  delete = <T = any>(url: string, c?: AxiosRequestConfig) => this.request<T>({ ...c, url, method: 'DELETE' })
  patch = <T = any>(url: string, data?: any, c?: AxiosRequestConfig) => this.request<T>({ ...c, url, data, method: 'PATCH' })
}

export const BASE_URL = 'https://worktrail.ai/api'

export const apiClient = new AxiosClient({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    APIKEY: 'Securitas@#!1234',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('worktrail_token')
  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
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
    verifyLoginOtp: `${BASE_URL}/VerifyLoginOtp`,
    verifyRegistrationOtp: `${BASE_URL}/VerifyRegistrationOtp`,
    requestPasswordReset: `${BASE_URL}/RequestPasswordReset`,
    updatePassword: `${BASE_URL}/UpdatePassword`,
  },
  menu: `${BASE_URL}/Menu`,
  payments: {
    createOrder: `${BASE_URL}/Payment/CreateOrder`,
    verify: `${BASE_URL}/Payment/Verify`,
    transaction: (orderId: string) => `${BASE_URL}/Payment/Transaction/${encodeURIComponent(orderId)}`,
  },
  clientEmpData: `${BASE_URL}/ClientEmpData`,
  clientEmpStatus: `${BASE_URL}/ClientEmpStatus`,
  reviewClientData: `${BASE_URL}/ReviewClientData`,
  clientDocumentUpdate: `${BASE_URL}/ClientDocumentUpdate`,
  users: {
    profile: `${BASE_URL}/users/profile`,
  },
} as const

export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]]