<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapsed ? '64px' : '210px'" class="layout-aside">
      <Sidebar :is-collapsed="isCollapsed" @toggle="toggleSidebar" />
    </el-aside>
    <el-container class="layout-main">
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleSidebar">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.meta?.title || item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userStore.currentUser?.avatar" icon="User" />
              <span class="username">{{ userStore.currentUser?.username || '用户' }}</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="settings">设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <el-dialog v-model="showFirstLoginDialog" title="首次登录提示" width="400px" :close-on-click-modal="false"
      :show-close="false">
      <div class="dialog-content">
        <el-icon class="warning-icon">
          <WarningFilled />
        </el-icon>
        <p>检测到您是首次登录，为了账户安全，建议您立即修改密码。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="skipChangePassword">稍后再说</el-button>
          <el-button type="primary" @click="goToChangePassword">立即修改</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import Sidebar from './Sidebar.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapsed = ref(false)
const showFirstLoginDialog = ref(false)

const breadcrumbs = computed(() => {
  return route.matched.filter((item) => item.meta?.title || item.name)
})

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

async function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await userStore.logoutUser()
      router.push('/login')
      break
  }
}

function checkFirstLogin() {
  if (userStore.currentUser?.isFirstLogin) {
    showFirstLoginDialog.value = true
  }
}

function skipChangePassword() {
  showFirstLoginDialog.value = false
  ElMessage.info('建议尽快修改密码以确保账户安全')
}

function goToChangePassword() {
  showFirstLoginDialog.value = false
  router.push('/profile?tab=password')
}

onMounted(() => {
  checkFirstLogin()
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  width: 100%;
}

.layout-aside {
  background-color: #304156;
  transition: width 0.3s ease;
  overflow: hidden;
}

.layout-main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;

  .collapse-btn {
    font-size: 20px;
    cursor: pointer;
    color: #606266;
    transition: color 0.3s;

    &:hover {
      color: var(--primary-color);
    }
  }
}

.header-right {
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #606266;

    .username {
      font-size: 14px;
    }
  }
}

.layout-content {
  background-color: var(--bg-color);
  padding: 20px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;

  .warning-icon {
    font-size: 48px;
    color: #e6a23c;
    margin-bottom: 16px;
  }

  p {
    font-size: 14px;
    color: #606266;
    margin: 0;
    line-height: 1.6;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
