import { get, post, put } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

export interface BasicSettings {
  systemName: string
  description: string
  logo?: string
}

export interface SecuritySettings {
  loginTimeout: number
  minPasswordLength: number
  requirePasswordComplexity: boolean
  forceChangePasswordOnFirstLogin: boolean
}

const BASE_URL = '/settings'

export const settingApi = {
  getSettings(): Promise<ApiResponse<Record<string, any>>> {
    return get<Record<string, any>>(BASE_URL, undefined, { showError: false })
  },

  getSetting(key: string): Promise<ApiResponse<{ key: string; value: any }>> {
    return get<{ key: string; value: any }>(`${BASE_URL}/${key}`, undefined, { showError: false })
  },

  saveSettings(settings: Record<string, any>): Promise<ApiResponse<void>> {
    return post<void>(BASE_URL, settings)
  },

  saveSetting(key: string, value: any): Promise<ApiResponse<void>> {
    return put<void>(`${BASE_URL}/${key}`, { value })
  },

  getBasicSettings(): Promise<ApiResponse<BasicSettings>> {
    return get<BasicSettings>(`${BASE_URL}/basic`, undefined, { showError: false })
  },

  saveBasicSettings(settings: BasicSettings): Promise<ApiResponse<void>> {
    return post<void>(`${BASE_URL}/basic`, settings)
  },

  getSecuritySettings(): Promise<ApiResponse<SecuritySettings>> {
    return get<SecuritySettings>(`${BASE_URL}/security`, undefined, { showError: false })
  },

  saveSecuritySettings(settings: SecuritySettings): Promise<ApiResponse<void>> {
    return post<void>(`${BASE_URL}/security`, settings)
  },
}

export default settingApi
