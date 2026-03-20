<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message } from '@/utils/message'

const router = useRouter()
const userStore = useUserStore()

const form = reactive({
    username: '',
    password: '',
    confirmPassword: ''
})

const errors = reactive({
    username: '',
    password: '',
    confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const registerError = ref('')

function validateForm(): boolean {
    let isValid = true
    errors.username = ''
    errors.password = ''
    errors.confirmPassword = ''
    registerError.value = ''

    if (!form.username.trim()) {
        errors.username = '请输入用户名'
        isValid = false
    } else if (form.username.length < 3) {
        errors.username = '用户名至少3个字符'
        isValid = false
    } else if (form.username.length > 20) {
        errors.username = '用户名最多20个字符'
        isValid = false
    }

    if (!form.password) {
        errors.password = '请输入密码'
        isValid = false
    } else if (form.password.length < 6) {
        errors.password = '密码至少6个字符'
        isValid = false
    } else if (form.password.length > 32) {
        errors.password = '密码最多32个字符'
        isValid = false
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = '请确认密码'
        isValid = false
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = '两次输入的密码不一致'
        isValid = false
    }

    return isValid
}

async function handleRegister() {
    if (!validateForm()) return

    isLoading.value = true
    registerError.value = ''

    try {
        const result = await userStore.register(form.username.trim(), form.password)
        if (result.success) {
            message.success('注册成功')
            router.push('/')
        } else {
            registerError.value = result.message || '注册失败'
        }
    } catch {
        registerError.value = '网络错误，请稍后重试'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="register-page">
        <div class="register-container">
            <div class="register-left">
                <div class="brand-section">
                    <div class="logo">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <h1 class="brand-name">Admin Pro</h1>
                    <p class="brand-desc">现代化后台管理系统</p>
                </div>
                <div class="features">
                    <div class="feature-item">
                        <div class="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <span>安全可靠</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                        </div>
                        <span>高效便捷</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" />
                            </svg>
                        </div>
                        <span>实时同步</span>
                    </div>
                </div>
            </div>

            <div class="register-right">
                <div class="register-form-wrapper">
                    <h2 class="form-title">创建账户</h2>
                    <p class="form-subtitle">填写以下信息完成注册</p>

                    <form class="register-form" @submit.prevent="handleRegister">
                        <div class="form-group">
                            <label class="form-label">用户名</label>
                            <div class="input-wrapper" :class="{ 'has-error': errors.username }">
                                <span class="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <input v-model="form.username" type="text" placeholder="请输入用户名（3-20个字符）" maxlength="20"
                                    @input="errors.username = ''" />
                            </div>
                            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
                        </div>

                        <div class="form-group">
                            <label class="form-label">密码</label>
                            <div class="input-wrapper" :class="{ 'has-error': errors.password }">
                                <span class="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                    placeholder="请输入密码（6-32个字符）" maxlength="32" @input="errors.password = ''" />
                                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                                    <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path
                                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                </button>
                            </div>
                            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                        </div>

                        <div class="form-group">
                            <label class="form-label">确认密码</label>
                            <div class="input-wrapper" :class="{ 'has-error': errors.confirmPassword }">
                                <span class="input-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                                    placeholder="请再次输入密码" maxlength="32" @input="errors.confirmPassword = ''" />
                                <button type="button" class="toggle-password"
                                    @click="showConfirmPassword = !showConfirmPassword">
                                    <svg v-if="showConfirmPassword" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path
                                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                </button>
                            </div>
                            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword
                                }}</span>
                        </div>

                        <div v-if="registerError" class="alert alert-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{{ registerError }}</span>
                        </div>

                        <button type="submit" class="submit-btn" :disabled="isLoading">
                            <span v-if="isLoading" class="loading-spinner"></span>
                            <span>{{ isLoading ? '注册中...' : '注册' }}</span>
                        </button>
                    </form>

                    <div class="form-footer">
                        <span>已有账户？</span>
                        <router-link to="/login" class="link">立即登录</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.register-container {
    display: flex;
    width: 100%;
    max-width: 1000px;
    min-height: 600px;
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.register-left {
    flex: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 60px 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #fff;
}

.brand-section {
    .logo {
        width: 64px;
        height: 64px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;

        svg {
            width: 36px;
            height: 36px;
            color: #fff;
        }
    }

    .brand-name {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .brand-desc {
        font-size: 16px;
        opacity: 0.9;
    }
}

.features {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;

    .feature-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
            width: 20px;
            height: 20px;
        }
    }
}

.register-right {
    flex: 1;
    padding: 60px 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.register-form-wrapper {
    width: 100%;
    max-width: 360px;
}

.form-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
    margin-bottom: 8px;
}

.form-subtitle {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 32px;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

.input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    transition: all 0.2s;
    background: #f9fafb;

    &:focus-within {
        border-color: #667eea;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &.has-error {
        border-color: #ef4444;
        background: #fef2f2;

        &:focus-within {
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
    }

    .input-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-left: 14px;
        color: #9ca3af;

        svg {
            width: 20px;
            height: 20px;
        }
    }

    input {
        flex: 1;
        padding: 14px 12px;
        border: none;
        background: transparent;
        font-size: 15px;
        color: #1f2937;
        outline: none;

        &::placeholder {
            color: #9ca3af;
        }
    }

    .toggle-password {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 14px;
        background: none;
        border: none;
        cursor: pointer;
        color: #9ca3af;
        transition: color 0.2s;

        &:hover {
            color: #6b7280;
        }

        svg {
            width: 20px;
            height: 20px;
        }
    }
}

.error-message {
    font-size: 12px;
    color: #ef4444;
}

.alert {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;

    svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }

    &.alert-error {
        background: #fef2f2;
        color: #dc2626;
        border: 1px solid #fecaca;
    }
}

.submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 8px;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px -5px rgba(102, 126, 234, 0.4);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
}

.loading-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.form-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 14px;
    color: #6b7280;

    .link {
        color: #667eea;
        text-decoration: none;
        font-weight: 500;
        margin-left: 4px;

        &:hover {
            text-decoration: underline;
        }
    }
}

@media (max-width: 768px) {
    .register-container {
        flex-direction: column;
        min-height: auto;
    }

    .register-left {
        padding: 40px 30px;

        .brand-section {
            text-align: center;

            .logo {
                margin: 0 auto 20px;
            }
        }
    }

    .features {
        flex-direction: row;
        justify-content: center;
        margin-top: 30px;

        .feature-item span {
            display: none;
        }
    }

    .register-right {
        padding: 40px 30px;
    }
}
</style>
