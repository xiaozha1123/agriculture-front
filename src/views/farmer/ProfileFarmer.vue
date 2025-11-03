<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { UserFilled, Shop, Edit } from '@element-plus/icons-vue';

// 接口定义
interface User {
  id: number;
  username: string;
  password: string;
  phone: string;
  role: string;
  address: string;
}

interface ShopInfo {
  id: number;
  shopName: string;
  description: string;
  address: string;
  contactPhone: string;
  createTime: Date;
  status: string;
}

// 响应式数据
const userInfo = ref<User | null>(null);
const shopInfo = ref<ShopInfo | null>(null);
const username = ref('');

// 对话框控制
const userDialogVisible = ref(false);
const shopDialogVisible = ref(false);
const dialogTitle = ref('');

// 表单数据
const userForm = reactive({
  id: 0,
  username: '',
  password: '',
  phone: '',
  address: ''
});

const shopForm = reactive({
  shopName: '',
  address: '',
  description: '',
  contactPhone: ''
});

// 获取当前登录用户名
const getUsername = () => {
  const sessionUser = sessionStorage.getItem('username');
  username.value = sessionUser || '';
  return sessionUser;
};

// 获取商家资料信息
const fetchSellerProfile = async () => {
  try {
    console.log('开始获取商家资料信息');
    const response = await fetch(`http://localhost:8080/user/shopProfile`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    console.log('获取到的商家资料:', data);
    
    // 处理嵌套的响应格式
    if (data && data.data) {
      userInfo.value = data.data.user;
      shopInfo.value = data.data.shop;
    } else {
      userInfo.value = data.user;
      shopInfo.value = data.shop;
    }
    
  } catch (error) {
    console.error('获取商家资料失败:', error);
    ElMessage.error('获取商家资料失败');
  }
};

// 编辑用户信息
const openUserEdit = () => {
  if (!userInfo.value) return;
  dialogTitle.value = '编辑个人信息';
  Object.assign(userForm, {
    id: userInfo.value.id,
    username: userInfo.value.username,
    password: userInfo.value.password,
    phone: userInfo.value.phone,
    address: userInfo.value.address || ''
  });
  userDialogVisible.value = true;
};

// 编辑店铺信息
const openShopEdit = () => {
  if (!shopInfo.value) return;
  dialogTitle.value = '编辑店铺信息';
  Object.assign(shopForm, {
    shopName: shopInfo.value.shopName || '',
    address: shopInfo.value.address || '',
    description: shopInfo.value.description || '',
    contactPhone: shopInfo.value.contactPhone || ''
  });
  shopDialogVisible.value = true;
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
      await fetchSellerProfile(); // 重新获取商家资料
    } else {
      ElMessage.error(result?.message || '用户信息更新失败');
    }
    
  } catch (error) {
    console.error('更新用户信息失败:', error);
    ElMessage.error('更新用户信息失败');
  }
};

// 保存商家资料（同时更新用户和店铺信息）
const saveSellerProfile = async () => {
  try {
    console.log('保存商家资料:', shopForm);
    
    const updateData = {
      username: userInfo.value?.username, // 保持用户名不变
      phone: userInfo.value?.phone, // 保持手机号不变
      shopName: shopForm.shopName,
      address: shopForm.address,
      description: shopForm.description,
      contactPhone: shopForm.contactPhone
    };
    
    const response = await fetch(`http://localhost:8080/user/updateProfile`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('商家资料更新响应状态:', response.status);
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const result = await response.text();
    console.log('商家资料更新结果:', result);
    
    if (result === '更新成功' || result?.includes('成功')) {
      ElMessage.success('商家资料更新成功');
      shopDialogVisible.value = false;
      await fetchSellerProfile(); // 重新获取商家资料
    } else {
      ElMessage.error('商家资料更新失败');
    }
    
  } catch (error) {
    console.error('更新商家资料失败:', error);
    ElMessage.error('更新商家资料失败');
  }
};

// 页面加载
onMounted(async () => {
  const currentUsername = getUsername();
  if (!currentUsername) {
    ElMessage.error('请先登录');
    return;
  }
  
  console.log('页面加载，当前用户:', currentUsername);
  
  // 获取商家资料信息
  await fetchSellerProfile();
});
</script>

<template>
  <div class="profile-container">
    <!-- 个人资料卡片 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span><el-icon><UserFilled /></el-icon> 个人资料</span>
          <el-button type="primary" :icon="Edit" @click="openUserEdit">编辑</el-button>
        </div>
      </template>
      
      <el-descriptions :column="2" border v-if="userInfo">
        <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ userInfo.phone || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="userInfo.role === '商家' ? 'success' : 'primary'">
            {{ userInfo.role }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="密码">{{ userInfo.password }}</el-descriptions-item>
        <el-descriptions-item label="地址" :span="2">{{ userInfo.address || '未设置' }}</el-descriptions-item>
      </el-descriptions>
      
      <el-empty v-else description="暂无用户信息" />
    </el-card>

    <!-- 店铺信息卡片 -->
    <el-card class="shop-card" v-if="shopInfo">
      <template #header>
        <div class="card-header">
          <span><el-icon><Shop /></el-icon> 店铺信息</span>
          <el-button type="primary" :icon="Edit" @click="openShopEdit">编辑</el-button>
        </div>
      </template>
      
      <el-descriptions :column="2" border>
        <el-descriptions-item label="店铺名称">{{ shopInfo.shopName }}</el-descriptions-item>
        <el-descriptions-item label="店铺地址">{{ shopInfo.address || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="shopInfo.status === '已通过' ? 'success' : 
                         shopInfo.status === '待审核' ? 'warning' : 'info'">
            {{ shopInfo.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ shopInfo.contactPhone || '未设置' }}</el-descriptions-item>
        <el-descriptions-item label="店铺描述" :span="2">
          {{ shopInfo.description || '暂无描述' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ new Date(shopInfo.createTime).toLocaleString() }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 无店铺提示 -->
    <el-card class="shop-card" v-else>
      <template #header>
        <div class="card-header">
          <span><el-icon><Shop /></el-icon> 店铺信息</span>
        </div>
      </template>
      <el-empty description="当前用户没有关联的店铺" />
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
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUserInfo">保存</el-button>
      </template>
    </el-dialog>

    <!-- 店铺编辑对话框 -->
    <el-dialog v-model="shopDialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="shopForm" label-width="100px">
        <el-form-item label="店铺名称">
          <el-input v-model="shopForm.shopName" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="店铺地址">
          <el-input v-model="shopForm.address" placeholder="请输入店铺地址" />
        </el-form-item>
        <el-form-item label="店铺描述">
          <el-input v-model="shopForm.description" type="textarea" :rows="3" placeholder="请输入店铺描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shopDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSellerProfile">保存</el-button>
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
      font-size: 16px;
    }
  }

  .profile-card, .shop-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .el-descriptions {
    margin-top: 10px;
  }
}
</style>