<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute() 
const formRef = ref<FormInstance>()
const loading = ref(false)
const applicantName = ref('') 

const form = reactive({
  shopName: '',
  description: '',
  address: '',
  contactName: '',
  phone: ''
})

const rules = {
  shopName: [{ required: true, message: '请输入商铺名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入商铺地址', trigger: 'blur' }],
  contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 获取申请人姓名（优先从路由参数，其次从Session）
const fetchApplicantName = async () => {
  // 1. 尝试从路由参数获取（注册后跳转携带）
  const nameFromRoute = route.query.username as string
  if (nameFromRoute) {
    applicantName.value = nameFromRoute
    sessionStorage.setItem('username', nameFromRoute) // 存入Session供后续使用
    return nameFromRoute
  }

  // 2. 从Session获取（正常登录后访问）
  const storedUsername = sessionStorage.getItem('username')
  if (storedUsername) {
    applicantName.value = storedUsername
    return storedUsername
  }

  // 3. 都没找到，提示登录
  ElMessage.error('请先注册或登录')
  router.push('/register')
  return null
}

// 提交申请
const onSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate()
  if (!valid) return

  // 确保申请人信息存在
  if (!applicantName.value) {
    const name = await fetchApplicantName()
    if (!name) return
  }

  loading.value = true
  try {
    // 提交数据（不包含 userId）
    const payload = {
      contactName: form.contactName,
      shopName: form.shopName,
      description: form.description || '',
      address: form.address,
      phone: form.phone
    }

    console.log('📨 提交数据:', payload)
    console.log('👤 申请人（从注册/Sesion获取）:', applicantName.value)

    const response = await fetch('http://localhost:8080/register/shop', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Username': applicantName.value 
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    })

    const result = await response.json()

    if (response.ok && (result.success || result.code === 200)) {
      ElMessage.success('商铺申请提交成功！请等待管理员审核')
      router.push('/login')
    } else {
      ElMessage.error(result.message || '申请失败')
    }
  } catch (error) {
    ElMessage.error('提交失败: ' + (error instanceof Error ? error.message : '未知错误'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchApplicantName()
})
</script>

<template>
  <div class="apply-page">
    <el-card class="form-card" v-loading="loading">
      <h2>商铺申请</h2>
      
      <!-- 显示申请人（从注册或Session获取） -->
      <div v-if="applicantName" class="user-info">
        <el-alert :title="'当前申请人：' + applicantName" type="info" :closable="false" />
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="top"
        size="large"
      >
        <!-- 表单字段 -->
        <el-form-item label="商铺名称" prop="shopName">
          <el-input v-model="form.shopName" placeholder="请输入商铺名称" />
        </el-form-item>

        <el-form-item label="商铺地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细经营地址" />
        </el-form-item>

        <el-form-item label="联系人姓名" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" type="tel" />
        </el-form-item>

        <el-form-item label="商铺简介" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请简要介绍..." />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit" style="width: 100%" size="large">
            提交申请
          </el-button>
        </el-form-item>

        <div class="footer-tip">
          <el-icon><InfoFilled /></el-icon>
          已有账号？<el-link type="primary" @click="router.push('/customer')">立即登录</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.apply-page {
  min-height: 100vh;
  background-color: #eef2f3;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  .form-card {
    width: 100%;
    max-width: 500px;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    h2 {
      margin: 0 0 20px 0;
      text-align: center;
      color: #2c3e50;
      font-size: 28px;
    }

    .user-info {
      margin-bottom: 20px;
    }

    .footer-tip {
      margin-top: 20px;
      text-align: center;
      font-size: 14px;
      color: #7f8c8d;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .el-link {
        font-weight: 600;
      }
    }
  }
}
</style>