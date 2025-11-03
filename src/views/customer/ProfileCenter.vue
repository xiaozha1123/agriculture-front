<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Edit, UserFilled } from '@element-plus/icons-vue'; // 添加图标导入

// 接口定义
interface User {
  id: number;
  username: string;
  password: string;
  phone: string;
  role: string;
  address: string;
}

// 响应式数据
const userInfo = ref<Partial<User>>({}); // 改为空对象而不是null
const username = ref('');

// 对话框控制
const userDialogVisible = ref(false);
const dialogTitle = ref('');

// 表单数据
const userForm = reactive({
  id: 0,
  username: '',
  password: '',
  phone: '',
  address: ''
});

// 获取当前登录用户名
const getUsername = () => {
  const sessionUser = sessionStorage.getItem('username');
  username.value = sessionUser || '';
  console.log('获取到的用户名:', username.value); // 添加日志
  return sessionUser;
};

// 获取个人资料信息
const fetchUserProfile = async () => {
  try {
    console.log('开始获取个人资料信息，用户名:', username.value);
    
    if (!username.value) {
      console.error('用户名为空');
      return;
    }
    
    const response = await fetch(`http://localhost:8080/user/profile?username=${encodeURIComponent(username.value)}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('响应状态:', response.status);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    console.log('获取到的完整响应:', data);
    
    if (data && data.data && data.data.user) {
      userInfo.value = data.data.user;
    } else if (data && data.user) {
      userInfo.value = data.user;
    } else if (data) {
      userInfo.value = data; // 直接使用返回的数据
    } else {
      console.warn('未找到用户数据');
      userInfo.value = {};
    }
    
    console.log('最终设置的userInfo:', userInfo.value);
    
  } catch (error) {
    console.error('获取个人资料失败:', error);
    ElMessage.error('获取个人资料失败');
  }
};

// 编辑用户信息
const openUserEdit = () => {
  if (!userInfo.value || !userInfo.value.id) {
    ElMessage.warning('请先等待用户信息加载完成');
    return;
  }
  
  dialogTitle.value = '编辑个人信息';
  Object.assign(userForm, {
    id: userInfo.value.id || 0,
    username: userInfo.value.username || '',
    password: userInfo.value.password || '',
    phone: userInfo.value.phone || '',
    address: userInfo.value.address || ''
  });
  userDialogVisible.value = true;
};

// 保存用户信息
const saveUserInfo = async () => {
  try {
    console.log('保存用户信息:', userForm);
    
    const response = await fetch(`http://localhost:8080/user/update/${userForm.id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userForm)
    });
    
    console.log('用户信息更新响应状态:', response.status);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.json();
    console.log('用户信息更新结果:', result);
    
    // 判断操作是否成功
    const isSuccess = result === true || result?.success === true || result?.code === 200;
    
    if (isSuccess) {
      ElMessage.success('用户信息更新成功');
      userDialogVisible.value = false;
      await fetchUserProfile(); // 重新获取用户资料
    } else {
      ElMessage.error(result?.message || '用户信息更新失败');
    }
    
  } catch (error) {
    console.error('更新用户信息失败:', error);
    ElMessage.error('更新用户信息失败');
  }
};

// 页面加载
onMounted(async () => {
  console.log('组件挂载开始');
  const currentUsername = getUsername();
  if (!currentUsername) {
    ElMessage.error('请先登录');
    console.error('未找到用户名，请检查登录状态');
    return;
  }
  console.log('页面加载，当前用户:', currentUsername);
  await fetchUserProfile();
  console.log('用户信息获取完成');
});
</script>

<template>
  <div class="profile-container">
    <!-- 个人资料卡片 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><UserFilled /></el-icon> 
            个人资料
          </span>
          <el-button type="primary" :icon="Edit" @click="openUserEdit">编辑</el-button>
        </div>
      </template>
      
      <!-- 添加加载状态和空状态处理 -->
      <div v-if="userInfo && userInfo.username">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userInfo.phone || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="userInfo.role === '商家' ? 'success' : 'primary'">
              {{ userInfo.role || '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="密码">******</el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">{{ userInfo.address || '未设置' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <el-empty v-else description="暂无用户信息或加载中..." />
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog v-model="userDialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="userForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" disabled />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="userForm.password" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="userForm.address" placeholder="请输入地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUserInfo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.profile-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: bold;
      font-size: 20px;
    }
  }

  .profile-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .el-descriptions {
    margin-top: 10px;
  }
}
</style>