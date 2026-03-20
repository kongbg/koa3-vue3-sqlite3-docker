<template>
    <div class="sidebar">
        <div class="sidebar-logo">
            <img v-if="settingStore.systemLogo" :src="settingStore.systemLogo" alt="Logo" class="logo-image" />
            <el-icon v-else :size="28">
                <Monitor />
            </el-icon>
            <span v-show="!isCollapsed" class="logo-text">{{ settingStore.systemName }}</span>
        </div>
        <el-menu :default-active="activeMenu" :collapse="isCollapsed" :collapse-transition="false"
            background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff" router class="sidebar-menu">
            <el-menu-item index="/dashboard">
                <el-icon>
                    <HomeFilled />
                </el-icon>
                <template #title>首页</template>
            </el-menu-item>
            <el-menu-item index="/profile">
                <el-icon>
                    <User />
                </el-icon>
                <template #title>个人中心</template>
            </el-menu-item>
            <el-menu-item index="/settings">
                <el-icon>
                    <Setting />
                </el-icon>
                <template #title>设置</template>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingStore } from '@/stores/setting'

interface Props {
    isCollapsed: boolean
}

defineProps<Props>()
defineEmits<{
    (e: 'toggle'): void
}>()

const route = useRoute()
const settingStore = useSettingStore()

const activeMenu = computed(() => {
    return route.path
})

onMounted(() => {
    settingStore.loadSettings()
})
</script>

<style scoped lang="scss">
.sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #304156;
}

.sidebar-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: var(--header-height);
    padding: 0 16px;
    background-color: #263445;
    color: #fff;
    overflow: hidden;
    white-space: nowrap;

    .logo-image {
        width: 28px;
        height: 28px;
        object-fit: contain;
    }

    .logo-text {
        margin-left: 12px;
        font-size: 18px;
        font-weight: 600;
    }
}

.sidebar-menu {
    flex: 1;
    border-right: none;
    overflow-y: auto;

    &:not(.el-menu--collapse) {
        width: 210px;
    }

    :deep(.el-menu-item) {
        &:hover {
            background-color: #263445 !important;
        }

        &.is-active {
            background-color: #409eff !important;
            color: #fff !important;
        }
    }
}
</style>
