import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { settingApi } from '@/api'
import type { BasicSettings, SecuritySettings } from '@/api/setting'

export const useSettingStore = defineStore('setting', () => {
  const basicSettings = ref<BasicSettings>({
    systemName: '管理系统',
    description: '',
    logo: '',
  })

  const securitySettings = ref<SecuritySettings>({
    loginTimeout: 30,
    minPasswordLength: 6,
    requirePasswordComplexity: false,
    forceChangePasswordOnFirstLogin: true,
  })

  const loading = ref(false)
  const loaded = ref(false)

  const systemName = computed(() => basicSettings.value.systemName)
  const systemLogo = computed(() => basicSettings.value.logo)
  const systemDescription = computed(() => basicSettings.value.description)

  async function loadSettings() {
    if (loaded.value) return

    loading.value = true
    try {
      const [basicResult, securityResult] = await Promise.all([
        settingApi.getBasicSettings(),
        settingApi.getSecuritySettings(),
      ])

      if (basicResult.success && basicResult.data) {
        basicSettings.value = { ...basicSettings.value, ...basicResult.data }
      }

      if (securityResult.success && securityResult.data) {
        securitySettings.value = { ...securitySettings.value, ...securityResult.data }
      }

      loaded.value = true
    } catch (error) {
      console.error('加载设置失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function updateBasicSettings(settings: Partial<BasicSettings>) {
    basicSettings.value = { ...basicSettings.value, ...settings }
  }

  async function saveBasicSettings(settings: BasicSettings) {
    const result = await settingApi.saveBasicSettings(settings)
    if (result.success) {
      basicSettings.value = settings
    }
    return result
  }

  async function saveSecuritySettings(settings: SecuritySettings) {
    const result = await settingApi.saveSecuritySettings(settings)
    if (result.success) {
      securitySettings.value = settings
    }
    return result
  }

  function reset() {
    basicSettings.value = {
      systemName: '管理系统',
      description: '',
      logo: '',
    }
    securitySettings.value = {
      loginTimeout: 30,
      minPasswordLength: 6,
      requirePasswordComplexity: false,
      forceChangePasswordOnFirstLogin: true,
    }
    loaded.value = false
  }

  return {
    basicSettings,
    securitySettings,
    loading,
    loaded,
    systemName,
    systemLogo,
    systemDescription,
    loadSettings,
    updateBasicSettings,
    saveBasicSettings,
    saveSecuritySettings,
    reset,
  }
})
