<template>
  <div class="profile-page">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="profile-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <div class="profile-info">
            <div class="avatar-section">
              <el-avatar :size="100" :src="avatarUrl" icon="User" />
              <el-upload class="avatar-upload" action="#" :show-file-list="false" :auto-upload="false" accept="image/*"
                @change="handleAvatarChange">
                <el-button type="primary" link :loading="uploadingAvatar">
                  {{ uploadingAvatar ? '上传中...' : '更换头像' }}
                </el-button>
              </el-upload>
            </div>
            <el-descriptions :column="1" border class="info-descriptions">
              <el-descriptions-item label="用户名">
                {{ userStore.currentUser?.username || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="用户ID">
                {{ userStore.currentUser?.id || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="注册时间">
                {{ formatCreatedAt }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card shadow="hover" class="edit-card">
          <template #header>
            <div class="card-header">
              <span>账户设置</span>
            </div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="basic">
              <el-form ref="basicFormRef" :model="basicForm" label-width="100px" style="max-width: 500px">
                <el-form-item label="用户名">
                  <el-input v-model="basicForm.username" disabled placeholder="用户名不可修改" />
                  <div class="form-tip">用户名创建后不可修改</div>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="password">
              <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px"
                style="max-width: 500px">
                <el-form-item label="当前密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入当前密码" show-password />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码"
                    show-password />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :loading="changingPassword" @click="changePassword">
                    修改密码
                  </el-button>
                  <el-button @click="resetPasswordForm">重置</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { uploadApi } from '@/api'
import { formatDateTime } from '@/utils/date'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeTab = ref('basic')
const changingPassword = ref(false)
const uploadingAvatar = ref(false)

const basicFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()

const basicForm = reactive({
  username: '',
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const avatarUrl = computed(() => {
  return userStore.currentUser?.avatar || undefined
})

const formatCreatedAt = computed(() => {
  return formatDateTime(userStore.currentUser?.createdAt)
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

onMounted(() => {
  if (userStore.currentUser) {
    basicForm.username = userStore.currentUser.username
  }

  const tab = route.query.tab as string
  if (tab === 'password') {
    activeTab.value = 'password'
  }
})

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'password') {
      activeTab.value = 'password'
    }
  }
)

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
</script>

<style scoped lang="scss">
.profile-page {
  .card-header {
    font-weight: 600;
  }

  .profile-card {
    .profile-info {
      .avatar-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 0;

        .avatar-upload {
          margin-top: 12px;
        }
      }

      .info-descriptions {
        margin-top: 20px;
      }
    }
  }

  .edit-card {
    min-height: 400px;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}
</style>
