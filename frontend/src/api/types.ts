export interface User {
  id: string
  username: string
  avatar?: string
  isFirstLogin?: boolean
  createdAt?: number | string
  updatedAt?: number | string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface HealthResponse {
  status: string
  timestamp: string
  uptime: number
}

export interface TestListResponse {
  timestamp: string
}

export interface UploadResponse {
  url: string
  name: string
  size: number
  type: string
}

export type {
  ApiResponse,
  PaginationParams,
  PaginationResponse,
  RequestConfig,
} from '@/utils/request'
