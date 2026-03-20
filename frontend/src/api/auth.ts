import { get, post } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from './types'

const BASE_URL = '/auth'

export const authApi = {
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return post<LoginResponse>(`${BASE_URL}/login`, data)
  },

  register(data: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return post<LoginResponse>(`${BASE_URL}/register`, data)
  },

  getCurrentUser(): Promise<ApiResponse<User>> {
    return get<User>(`${BASE_URL}/me`, undefined, { showError: false })
  },

  logout(): Promise<ApiResponse<void>> {
    return post<void>(`${BASE_URL}/logout`, undefined, { showError: false })
  },

  updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return post<User>(`${BASE_URL}/profile`, data)
  },

  changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return post<void>(`${BASE_URL}/change-password`, data)
  },
}

export default authApi
