import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { setAuthToken, getAuthToken } from '@/utils/request'
import { encryptPassword } from '@/utils/crypto'
import { authApi } from '@/api'
import type { User, ApiResponse, LoginResponse } from '@/api/types'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<User | null>(null)
  const loading = ref(false)

  if (token.value) {
    setAuthToken(token.value)
  }

  const isLoggedIn = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const isFirstLogin = computed(() => user.value?.isFirstLogin === true)

  async function login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    loading.value = true
    try {
      const encryptedPassword = await encryptPassword(password)
      const data = await authApi.login({ username, password: encryptedPassword })

      if (data.success && data.data) {
        token.value = data.data.token
        user.value = data.data.user
        localStorage.setItem('token', data.data.token)
        setAuthToken(data.data.token)
      }

      return data
    } finally {
      loading.value = false
    }
  }

  async function register(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    loading.value = true
    try {
      const encryptedPassword = await encryptPassword(password)
      const data = await authApi.register({ username, password: encryptedPassword })

      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchUserInfo(): Promise<boolean> {
    const currentToken = getAuthToken() || localStorage.getItem('token')
    if (!currentToken) return false

    setAuthToken(currentToken)

    try {
      const data = await authApi.getCurrentUser()

      if (data.success && data.data) {
        user.value = data.data
        return true
      } else {
        logout()
        return false
      }
    } catch {
      logout()
      return false
    }
  }

  async function logoutUser(): Promise<void> {
    try {
      await authApi.logout()
    } finally {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    setAuthToken(null)
  }

  function updateUser(userData: Partial<User>) {
    if (user.value) {
      user.value = { ...user.value, ...userData }
    }
  }

  async function updateAvatar(avatarUrl: string): Promise<boolean> {
    try {
      const data = await authApi.updateProfile({ avatar: avatarUrl })

      if (data.success && data.data) {
        updateUser({ avatar: avatarUrl })
        return true
      }
      return false
    } catch {
      return false
    }
  }

  async function changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    const encryptedOldPassword = await encryptPassword(oldPassword)
    const encryptedNewPassword = await encryptPassword(newPassword)

    const data = await authApi.changePassword({
      oldPassword: encryptedOldPassword,
      newPassword: encryptedNewPassword,
    })

    if (data.success) {
      updateUser({ isFirstLogin: false })
    }

    return data
  }

  function getAuthHeaders(): Record<string, string> {
    const currentToken = getAuthToken()
    return currentToken ? { Authorization: `Bearer ${currentToken}` } : {}
  }

  return {
    token,
    user,
    loading,
    isLoggedIn,
    currentUser,
    isFirstLogin,
    login,
    register,
    fetchUserInfo,
    logout,
    logoutUser,
    updateUser,
    updateAvatar,
    changePassword,
    getAuthHeaders,
  }
})
