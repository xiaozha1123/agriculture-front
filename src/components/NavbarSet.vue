<template>
  <el-header class="navbar">
    <div class="logo" @click="goHome">🌾助农服务平台</div>
    <div class="nav-right">
      <template v-if="!userStore.role">
        <el-button type="primary" @click="simulateLogin('customer')">顾客登录</el-button>
        <el-button type="success" @click="simulateLogin('merchant')">商家登录</el-button>
        <el-button type="warning" @click="simulateLogin('admin')">管理员登录</el-button>
      </template>
      <template v-else>
        <el-tag type="info">{{ roleText }}</el-tag>
        <el-dropdown>
          <span class="el-dropdown-link">
            {{ userStore.username }}<el-icon><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goCenter">个人中心</el-dropdown-item>
              <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </div>
  </el-header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 模拟登录（未连后端时）
function simulateLogin(role: string) {
  userStore.setUser(role + 'User', role, 'fake-token')
}

// 显示角色标签
const roleText = computed(() => {
  switch (userStore.role) {
    case 'customer': return '顾客模式'
    case 'merchant': return '商家模式'
    case 'admin': return '管理员模式'
    default: return ''
  }
})

function goHome() {
  router.push('/')
}

function goCenter() {
  router.push(`/${userStore.role}`)
}

function logout() {
  userStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #409eff;
  color: #fff;
  padding: 10px 30px;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
