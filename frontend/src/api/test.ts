import { get } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'
import type { HealthResponse, TestListResponse } from './types'

export const testApi = {
  health(): Promise<ApiResponse<HealthResponse>> {
    return get<HealthResponse>('/health', undefined, { showError: false })
  },

  list(): Promise<ApiResponse<TestListResponse>> {
    return get<TestListResponse>('/test/list', undefined, { showError: false })
  },
}

export default testApi
