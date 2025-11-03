<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

export default defineComponent({
  name: 'LOGIN',
  setup() {
    const loginForm = ref<FormInstance>()
    const router = useRouter()

    const form = reactive({
      name: '',
      password: ''
    })

    const rules = {
      name: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    }

    const onSubmit = async () => {
      if (!loginForm.value) return

      try {
        const valid = await loginForm.value.validate()
        if (valid) {
          // 发送用户名和密码到后端登录接口
          const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              username: form.name,
              password: form.password,
            }),
            credentials: 'include',  // 确保带上 Cookie，后端使用 JSESSIONID 来处理会话
          })

          if (response.ok) {
            ElMessage.success('登录成功')
            console.log('Redirecting to /home')
            await router.push('/home')
          } else {
            ElMessage.error('登录失败')
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error('登录失败，请检查网络连接或联系管理员')
      }
    }

    return {
      form,
      rules,
      loginForm,
      onSubmit
    }
  }
})
</script>

<template>
  <div class="login">
    <el-form
      ref="loginForm"
      :model="form"
      :rules="rules"
      label-width="120px"
      label-position="top"
      size="large"
    >
      <h2>登录</h2>
      <el-form-item label="用户名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          show-password
          type="password"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="onSubmit">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.login {
  background-color: #eee;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-form {
  width: 300px;
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  
  .el-form-item {
    margin-top: 20px;
  }
  
  .el-button {
    width: 100%;
    margin-top: 30px;
  }
}
</style>
