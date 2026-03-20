export * from './types'
export { authApi } from './auth'
export { testApi } from './test'
export { uploadApi } from './upload'
export { settingApi } from './setting'

import { authApi } from './auth'
import { testApi } from './test'
import { uploadApi } from './upload'
import { settingApi } from './setting'

export const api = {
  auth: authApi,
  test: testApi,
  upload: uploadApi,
  setting: settingApi,
}

export default api
