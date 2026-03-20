import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type CancelTokenSource,
} from 'axios'
import { message } from './message'

export interface RequestConfig extends AxiosRequestConfig {
  showError?: boolean
  customHeaders?: Record<string, string>
  skipAuth?: boolean
}

const HEADER_SHOW_ERROR = 'X-Show-Error'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let authToken: string | null = null

const cancelTokenSources: Map<string, CancelTokenSource> = new Map()

export function setAuthToken(token: string | null) {
  authToken = token
}

export function getAuthToken(): string | null {
  return authToken
}

export function cancelRequest(requestKey: string) {
  const source = cancelTokenSources.get(requestKey)
  if (source) {
    source.cancel(`Request ${requestKey} was cancelled`)
    cancelTokenSources.delete(requestKey)
  }
}

export function cancelAllRequests() {
  cancelTokenSources.forEach((source, key) => {
    source.cancel(`Request ${key} was cancelled`)
  })
  cancelTokenSources.clear()
}

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const configWithOptions = config as InternalAxiosRequestConfig & RequestConfig

    if (authToken && !configWithOptions.skipAuth) {
      configWithOptions.headers.Authorization = `Bearer ${authToken}`
    }

    if (configWithOptions.customHeaders) {
      Object.entries(configWithOptions.customHeaders).forEach(([key, value]) => {
        configWithOptions.headers[key] = value
      })
    }

    if (configWithOptions.showError !== undefined) {
      configWithOptions.headers[HEADER_SHOW_ERROR] = configWithOptions.showError.toString()
    }

    return configWithOptions
  },
  (error) => {
    return Promise.reject(error)
  },
)

instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  (error) => {
    const config = error.config as RequestConfig
    const showErrorHeader = config?.headers?.[HEADER_SHOW_ERROR]
    const showError = showErrorHeader ? showErrorHeader !== 'false' : true

    if (error.response) {
      const status = error.response.status
      const data = error.response.data as ApiResponse

      if (status === 401) {
        authToken = null
        localStorage.removeItem('token')

        if (showError) {
          message.error('登录已过期，请重新登录')
        }

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      } else if (status === 403) {
        if (showError) {
          message.error('没有权限访问该资源')
        }
      } else if (status === 404) {
        if (showError) {
          message.error('请求的资源不存在')
        }
      } else if (status >= 500) {
        if (showError) {
          message.error('服务器错误，请稍后重试')
        }
      } else {
        if (showError && data?.message) {
          message.error(data.message)
        }
      }
    } else if (error.request) {
      if (showError) {
        message.error('网络错误，请检查网络连接')
      }
    } else {
      if (showError) {
        message.error('请求配置错误')
      }
    }

    return Promise.reject(error)
  },
)

export async function request<T = any>(config: RequestConfig): Promise<ApiResponse<T>> {
  const response = await instance.request<ApiResponse<T>>(config)
  return response.data
}

export async function get<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({ ...config, method: 'GET', url, params, showError: config?.showError ?? true })
}

export async function post<T = any>(
  url: string,
  data?: any,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({ ...config, method: 'POST', url, data, showError: config?.showError ?? true })
}

export async function put<T = any>(
  url: string,
  data?: any,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({ ...config, method: 'PUT', url, data, showError: config?.showError ?? true })
}

export async function patch<T = any>(
  url: string,
  data?: any,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({ ...config, method: 'PATCH', url, data, showError: config?.showError ?? true })
}

export async function del<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return request<T>({
    ...config,
    method: 'DELETE',
    url,
    params,
    showError: config?.showError ?? true,
  })
}

export async function upload<T = any>(
  url: string,
  file: File | FormData,
  config?: RequestConfig & { onProgress?: (percent: number) => void },
): Promise<ApiResponse<T>> {
  const formData = file instanceof FormData ? file : new FormData()
  if (file instanceof File) {
    formData.append('file', file)
  }

  return request<T>({
    ...config,
    method: 'POST',
    url,
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...config?.customHeaders,
    },
    onUploadProgress: (progressEvent) => {
      if (config?.onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        config.onProgress(percent)
      }
    },
  })
}

export async function download(
  url: string,
  params?: Record<string, any>,
  config?: RequestConfig & { filename?: string },
): Promise<void> {
  const response = await instance.request<Blob>({
    ...config,
    method: 'GET',
    url,
    params,
    responseType: 'blob',
  })

  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = downloadUrl

  const contentDisposition = response.headers['content-disposition']
  let filename = config?.filename || 'download'
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1].replace(/['"]/g, '')
    }
  }

  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(downloadUrl)
}

const http = {
  request,
  get,
  post,
  put,
  patch,
  del,
  upload,
  download,
  setAuthToken,
  getAuthToken,
  cancelRequest,
  cancelAllRequests,
}

export default http
