<template>
  <div class="settings-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
        </div>
      </template>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" label-width="120px" style="max-width: 600px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input v-model="basicForm.description" type="textarea" :rows="3" placeholder="请输入系统描述" />
            </el-form-item>
            <el-form-item label="Logo">
              <div class="logo-upload-container">
                <el-upload class="logo-uploader" action="#" :show-file-list="false" :auto-upload="false"
                  accept="image/*" @change="handleLogoChange">
                  <el-image v-if="basicForm.logo" :src="basicForm.logo" class="logo-preview" fit="contain" />
                  <el-icon v-else class="logo-uploader-icon">
                    <Plus />
                  </el-icon>
                </el-upload>
                <div class="logo-info">
                  <p class="logo-tip">支持 JPG、PNG、GIF、WEBP 格式，文件大小不超过 5MB</p>
                  <el-button v-if="basicForm.logo" type="danger" size="small" @click="removeLogo">
                    移除Logo
                  </el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="savingBasic" @click="saveBasicSettings">
                保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <!-- <el-tab-pane label="安全设置" name="security">
          <el-form :model="securityForm" label-width="120px" style="max-width: 600px">
            <el-form-item label="登录超时">
              <el-input-number v-model="securityForm.loginTimeout" :min="5" :max="1440" :step="5" />
              <span style="margin-left: 10px; color: #909399">分钟</span>
            </el-form-item>
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securityForm.minPasswordLength" :min="6" :max="32" />
            </el-form-item>
            <el-form-item label="强制密码复杂度">
              <el-switch v-model="securityForm.requirePasswordComplexity" />
              <div class="form-tip">开启后密码必须包含大小写字母、数字和特殊字符</div>
            </el-form-item>
            <el-form-item label="首次登录改密">
              <el-switch v-model="securityForm.forceChangePasswordOnFirstLogin" />
              <div class="form-tip">开启后用户首次登录必须修改密码</div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="savingSecurity" @click="saveSecuritySettings">
                保存设置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane> -->
        <!-- <el-tab-pane label="账户安全" name="account">
          <div class="account-security">
            <el-alert title="账户安全提示" type="info" description="定期修改密码可以提高账户安全性，建议每3个月修改一次密码。" :closable="false" show-icon
              style="margin-bottom: 20px" />
            <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px"
              style="max-width: 500px">
              <el-form-item label="当前密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="changingPassword" @click="changePassword">
                  修改密码
                </el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane> -->
        <el-tab-pane label="头像设置" name="avatar">
          <div class="avatar-settings">
            <div class="current-avatar">
              <el-avatar :size="120" :src="avatarUrl" icon="User" />
              <div class="avatar-info">
                <p class="avatar-tip">支持 JPG、PNG、GIF、WEBP 格式，文件大小不超过 5MB</p>
              </div>
            </div>
            <el-upload class="avatar-uploader" action="#" :show-file-list="false" :auto-upload="false" accept="image/*"
              @change="handleAvatarChange">
              <el-button type="primary" :loading="uploadingAvatar">
                {{ uploadingAvatar ? '上传中...' : '选择图片' }}
              </el-button>
            </el-upload>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useSettingStore } from '@/stores/setting'
import { uploadApi } from '@/api'

const router = useRouter()
const userStore = useUserStore()
const settingStore = useSettingStore()

const activeTab = ref('basic')
const changingPassword = ref(false)
const uploadingAvatar = ref(false)
const savingBasic = ref(false)
const savingSecurity = ref(false)
const uploadingLogo = ref(false)

const passwordFormRef = ref<FormInstance>()

const basicForm = reactive({
  systemName: '',
  description: '',
  logo: '',
})

const securityForm = reactive({
  loginTimeout: 30,
  minPasswordLength: 8,
  requirePasswordComplexity: true,
  forceChangePasswordOnFirstLogin: true,
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const avatarUrl = computed(() => {
  return userStore.currentUser?.avatar || undefined
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

async function loadSettings() {
  await settingStore.loadSettings()
  Object.assign(basicForm, settingStore.basicSettings)
  Object.assign(securityForm, settingStore.securitySettings)
}

async function handleLogoChange(file: UploadFile) {
  if (!file.raw) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error('只支持上传 JPG、PNG、GIF、WEBP 格式的图片')
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }

  uploadingLogo.value = true
  try {
    const result = await uploadApi.uploadImage(file.raw)

    if (result.success && result.data?.url) {
      basicForm.logo = result.data.url
      ElMessage.success('Logo上传成功')
    } else {
      ElMessage.error(result.message || 'Logo上传失败')
    }
  } finally {
    uploadingLogo.value = false
  }
}

function removeLogo() {
  basicForm.logo = ''
}

async function saveBasicSettings() {
  savingBasic.value = true
  try {
    const result = await settingStore.saveBasicSettings({ ...basicForm })
    if (result.success) {
      ElMessage.success('基本设置保存成功')
    } else {
      ElMessage.error(result.message || '保存失败')
    }
  } finally {
    savingBasic.value = false
  }
}

async function saveSecuritySettings() {
  savingSecurity.value = true
  try {
    const result = await settingStore.saveSecuritySettings({ ...securityForm })
    if (result.success) {
      ElMessage.success('安全设置保存成功')
    } else {
      ElMessage.error(result.message || '保存失败')
    }
  } finally {
    savingSecurity.value = false
  }
}

async function changePassword() {
  const valid = await passwordFormRef.value?.validate().catch(() => false)
  if (!valid) return

  changingPassword.value = true
  try {
    const result = await userStore.changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword,
    )

    if (result.success) {
      ElMessage.success('密码修改成功，请重新登录')
      resetPasswordForm()
      userStore.logout()
      router.push('/login')
    } else {
      ElMessage.error(result.message || '密码修改失败')
    }
  } finally {
    changingPassword.value = false
  }
}

function resetPasswordForm() {
  passwordFormRef.value?.resetFields()
}

async function handleAvatarChange(file: UploadFile) {
  if (!file.raw) return

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error('只支持上传 JPG、PNG、GIF、WEBP 格式的图片')
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }

  uploadingAvatar.value = true
  try {
    const result = await uploadApi.uploadImage(file.raw)

    if (result.success && result.data?.url) {
      const updateResult = await userStore.updateAvatar(result.data.url)
      if (updateResult) {
        ElMessage.success('头像更新成功')
      } else {
        ElMessage.error('头像更新失败')
      }
    } else {
      ElMessage.error(result.message || '头像上传失败')
    }
  } finally {
    uploadingAvatar.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
.settings-page {
  .card-header {
    font-weight: 600;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }

  .logo-upload-container {
    display: flex;
    align-items: flex-start;
    gap: 20px;
  }

  .logo-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s;
      width: 100px;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: #409eff;
      }
    }

    .logo-uploader-icon {
      font-size: 28px;
      color: #8c939d;
    }

    .logo-preview {
      width: 100%;
      height: 100%;
    }
  }

  .logo-info {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .logo-tip {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .account-security {
    padding: 10px 0;
  }

  .avatar-settings {
    .current-avatar {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;

      .avatar-info {
        .avatar-tip {
          font-size: 14px;
          color: #909399;
          margin: 0;
        }
      }
    }

    .avatar-uploader {
      margin-top: 10px;
    }
  }
}
</style>
