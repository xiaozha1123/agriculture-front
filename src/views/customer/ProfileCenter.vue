<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const user = ref({
  username: '张三',
  phone: '13800000000',
  address: '江苏省南京市雨花台区',
  avatar: 'https://picsum.photos/seed/avatar/100/100'
})

const saveProfile = () => {
  ElMessage.success('信息已保存')
}
</script>

<template>
  <div class="profile-page">
    <h2>👤 个人中心</h2>
    <el-card class="profile-card">
      <div class="profile-header">
        <img :src="user.avatar" class="avatar" />
        <div class="user-info">
          <p class="name">{{ user.username }}</p>
          <p class="desc">欢迎回来！助农服务平台感谢您的支持🌾</p>
        </div>
      </div>

      <el-divider>个人信息</el-divider>

      <el-form label-width="100px" class="profile-form">
        <el-form-item label="用户名">
          <el-input v-model="user.username" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="user.phone" />
        </el-form-item>
        <el-form-item label="收货地址">
          <el-input v-model="user.address" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveProfile">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 30px 60px;
}

.profile-card {
  max-width: 700px;
  margin: auto;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.user-info .name {
  font-size: 20px;
  font-weight: 600;
}

.user-info .desc {
  color: #888;
  font-size: 14px;
}
</style>
