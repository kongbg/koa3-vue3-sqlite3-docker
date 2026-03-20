import { getAuthToken } from '@/utils/request'
import type { ApiResponse } from '@/utils/request'
import type { UploadResponse } from './types'

const BASE_URL = '/upload'

export const uploadApi = {
  async uploadImage(file: File): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)

    const token = getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`/api${BASE_URL}/image`, {
        method: 'POST',
        headers,
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || '上传失败',
          data: null as unknown as UploadResponse,
        }
      }

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      return {
        success: false,
        message: errorMessage,
        data: null as unknown as UploadResponse,
      }
    }
  },
}

export default uploadApi
