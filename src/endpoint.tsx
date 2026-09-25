/**
 * Lightweight Axios-compatible HTTP client & API Endpoints.
 * Pure fetch implementation with zero external dependencies.
 */


// API Header to be used in API requests, exported for reuse
export const API_HEADER = {
  APIKEY: "Securitas@#!1234",
  "Content-Type": "application/json",
};

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
    this.defaults = { headers: { ...API_HEADER }, ...defaults }
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

//export const BASE_URL = 'https://worktrail.ai/api'
export const STAGE_URL = 'http://10.80.0.83:3000/api'

export const apiClient = new AxiosClient({
  baseURL: STAGE_URL,
  headers: { ...API_HEADER },
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
    login: `${STAGE_URL}/login`,
    register: `${STAGE_URL}/Register`,
    logout: `${STAGE_URL}/auth/logout`,
    me: `${STAGE_URL}/auth/me`,
    verifyLoginOtp: `${STAGE_URL}/VerifyLoginOtp`,
    verifyRegistrationOtp: `${STAGE_URL}/VerifyRegistrationOtp`,
    requestPasswordReset: `${STAGE_URL}/RequestPasswordReset`,
    updatePassword: `${STAGE_URL}/UpdatePassword`,
  },
  menu: `${STAGE_URL}/Menu`,
  payments: {
    createOrder: `${STAGE_URL}/Payment/CreateOrder`,
    verify: `${STAGE_URL}/Payment/Verify`,
    transaction: (orderId: string) => `${STAGE_URL}/Payment/Transaction/${encodeURIComponent(orderId)}`,
  },
  clientEmpData: `${STAGE_URL}/ClientEmpData`,
  clientEmpStatus: `${STAGE_URL}/ClientEmpStatus`,
  reviewClientData: `${STAGE_URL}/ReviewClientData`,
  clientDocumentUpdate: `${STAGE_URL}/ClientDocumentUpdate`,
  users: {
    profile: `${STAGE_URL}/users/profile`,
  },
  OrgmasterData:`${STAGE_URL}/OrgmasterData`,
  ContributorData:`${STAGE_URL}/ContributorData`,
  ContributorEmpSearch:`${STAGE_URL}/ContributorEmpSearch`,
  ContributorEditData:`${STAGE_URL}/ContributorEditData`,
  ContributorAdminFormDynamic:`${STAGE_URL}/ContributorAdminFormDynamic`,
  ContributorAdminData:`${STAGE_URL}/ContributorAdminData`,
  ContributorRegister:`${STAGE_URL}/ContributorRegister`,
  ContributorDelete:`${STAGE_URL}/ContributorDelete`,
  ContributorUpdate:`${STAGE_URL}/ContributorUpdate`,
  UpdateFinalReport:`${STAGE_URL}/UpdateFinalReport`,
  AdminClientData:`${STAGE_URL}/AdminClientData`,
  Orgmastermanage:`${STAGE_URL}/Orgmastermanage`,
  OrgmasterNameUpdate:`${STAGE_URL}/OrgmasterNameUpdate`,
  OrgmasterDelete:`${STAGE_URL}/OrgmasterDelete`,
  ContributorServiceRequest:`${STAGE_URL}/ContributorServiceRequest`,
  DownloadUpdatePDF:`${STAGE_URL}/DownloadUpdatePDF`
} as const

export type ApiEndpoint =
  (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS][keyof (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]]

export const API_HEADERS = { ...API_HEADER };