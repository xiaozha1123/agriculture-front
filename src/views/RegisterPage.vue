<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'

const router = useRouter()
const registerForm = ref<FormInstance>()

// ✅ 类型定义
interface RegisterForm {
  username: string
  password: string
  confirmPassword: string
  role: string
  phone: string
}

const form = reactive<RegisterForm>({
  username: '',
  password: '',
  confirmPassword: '',
  role: '',
  phone: ''
})

// ✅ 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== form.password) {
          callback(new Error('两次密码不一致'))
        } else callback()
      },
      trigger: 'blur'
    }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

const roles = [
  { label: '管理员', value: '管理员' },
  { label: '商家', value: '商家' },
  { label: '顾客', value: '顾客' }
]

const selectRole = (value: string) => {
  form.role = form.role === value ? '' : value
}

const hasSelectedRole = computed(() => form.role !== '')

const clearRole = () => {
  form.role = ''
}

// ✅ 核心修复：正确的请求URL和数据格式
const onSubmit = async () => {
  if (!registerForm.value) return
  
  const valid = await registerForm.value.validate()
  if (!valid) return

  try {
    const response = await fetch('http://localhost:8080/register/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        role: form.role,
        phone: form.phone
      }),
      credentials: 'include'
    })

    const result = await response.json()
    
    if (response.ok && result.success) {
      ElMessage.success('注册成功')
      console.log('✅ 准备跳转，角色:', form.role) // ✅ 调试日志
      
      const routeMap: Record<string, string> = {
        '顾客': '/login',
        '商家': '/apply',
        '管理员': '/login'
      }
      
      const targetRoute = routeMap[form.role] || '/login'
      console.log('🚀 跳转到:', targetRoute) // ✅ 确认路由
      
      // ✅ 增强的跳转逻辑，捕获错误
      await router.push(targetRoute).catch(err => {
        console.error('❌ 路由跳转失败:', err)
        ElMessage.error(`跳转失败: ${err.message}`)
        // 降级处理：跳转到登录页
        router.push('/login')
      })
      
      if (form.role === '管理员') {
        ElMessage.info('管理员账户注册后需人工审核')
      }
    } else {
      throw new Error(result.message || '注册失败')
    }
  } catch (error) {
    console.error('注册错误:', error)
    ElMessage.error(error instanceof Error ? error.message : '注册失败，请重试')
  }
}
</script>

<template>
  <div class="register">
    <el-form
      ref="registerForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="top"
      size="large"
    >
      <h2>用户注册</h2>

      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号" />
      </el-form-item>

      <el-form-item label="角色选择" prop="role">
        <div class="role-selection-wrapper">
          <!-- 角色选择框 -->
          <div class="role-list">
            <div
              v-for="item in roles"
              :key="item.value"
              class="role-row"
              :class="{ active: form.role === item.value }"
              @click="selectRole(item.value)"
              :title="form.role === item.value ? '点击取消选择' : '点击选择此角色'"
            >
              <span class="box" :class="{ checked: form.role === item.value }">
                <span v-if="form.role === item.value" class="tick">✔</span>
              </span>
              <span class="role-label">{{ item.label }}</span>
            </div>
          </div>

          <!-- 清除按钮（已选择时显示） -->
          <transition name="fade">
            <el-button 
              v-if="hasSelectedRole" 
              type="info" 
              size="small" 
              class="clear-btn"
              @click="clearRole"
            >
              清除选择
            </el-button>
          </transition>

          <!-- 提示文字 -->
          <p v-if="!hasSelectedRole" class="role-tip">
            点击上方角色进行选择（再次点击可取消）
          </p>
          <p v-else class="role-selected">
            已选择：<strong>{{ form.role }}</strong>
          </p>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit" style="width: 100%">
          注册
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.register {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  .el-form {
    width: 100%;
    max-width: 420px;
    background-color: #fff;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #2c3e50;
    }

    // 角色选择容器
    .role-selection-wrapper {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    // 关键：确保角色选择框在一行
    .role-list {
      display: flex;
      justify-content: space-between;
      gap: 12px;

      .role-row {
        flex: 1;
        min-width: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background-color: #fff;

        // 悬停效果
        &:hover {
          border-color: #409eff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        // 选中状态
        &.active {
          border-color: #409eff;
          background-color: #ecf5ff;
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
        }

        .box {
          width: 20px;
          height: 20px;
          border: 2px solid #dcdfe6;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          transition: all 0.3s;

          &.checked {
            background: #409eff;
            border-color: #409eff;
          }

          .tick {
            color: #fff;
            font-size: 12px;
            font-weight: bold;
          }
        }

        .role-label {
          font-size: 14px;
          color: #2c3e50;
          font-weight: 500;
          white-space: nowrap;
        }
      }
    }

    // 清除按钮
    .clear-btn {
      align-self: flex-end;
      margin-top: 4px;
    }

    // 提示文字
    .role-tip {
      margin: 0;
      font-size: 12px;
      color: #909399;
      text-align: center;
    }

    .role-selected {
      margin: 0;
      font-size: 13px;
      color: #409eff;
      text-align: center;
      font-weight: 500;
    }

    // 淡入淡出动画
    .fade-enter-active, .fade-leave-active {
      transition: opacity 0.3s;
    }
    .fade-enter-from, .fade-leave-to {
      opacity: 0;
    }

    // 响应式优化
    @media (max-width: 480px) {
      .role-list {
        gap: 8px;
        
        .role-row {
          padding: 12px 6px;
          min-width: 80px;
          
          .role-label {
            font-size: 13px;
          }
        }
      }
    }
  }
}
</style>