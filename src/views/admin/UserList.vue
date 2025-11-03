<script setup lang="ts">
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus';
import {ref, reactive, onMounted, computed } from 'vue';

const selectedRole = ref('全部');

const form = reactive({
  ID: 0,
  username: '',
  password: '',
  role: '',
  phone: '',
  enabled: true,
  address:''
});

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  phone: string;
  enabled: boolean;
  address?: string;
}

const Users = ref<User[]>([]);
const fetchUsers = async () => {
  try {
    const response = await fetch('http://localhost:8080/user/list',{
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    Users.value = data;
  } catch (error) {
    console.error('Error fetching users:', error);
    Users.value = [];
  }
}

const filteredUsers = computed(() => {
  if (selectedRole.value === '全部') {
    return Users.value;
  }
  return Users.value.filter(user => user.role === selectedRole.value);
});

const debugShowResponse = (label: string, response: unknown) => {
  console.log(`${label}:`, response);
};

const openAddDialog = () => {
  dialogTitle.value = '添加用户';
  resetForm();
  dialogVisible.value = true;
};

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('添加用户');

const handleAdd = async () => {
  if(!form.username || !form.password || !form.role || !form.phone){
    alert('请填写完整信息');
    return;
  }
  try {
    loading.value = true;
    const response = await request.post('/user/add', {
      username: form.username,
      password: form.password,
      role: form.role,
      phone: form.phone,
      enabled: form.enabled
    });
    debugShowResponse('add response', response);
    const resp = response;
    const payload = resp?.data ?? resp; 
    const maybeOk =
      payload === true ||
      payload === 'true' ||
      payload?.data === true ||
      payload?.success === true ||
      payload?.ok === true ||
      payload?.result === true ||
      payload?.code === 200 ||
      resp?.status === 200;
    if (maybeOk) {
      ElMessage.success('用户添加成功');  
      dialogVisible.value = false;
      resetForm();
      await fetchUsers();
    }
    else {
      ElMessage.error('添加失败');
    }
  } catch (error) {
    console.error('Error adding user:', error);
    ElMessage.error('添加失败');
  } finally {
    loading.value = false;
  }
};

const openEditDialog = (user: User) => {
  dialogTitle.value = '修改用户';
  form.ID = user.id;
  form.username = user.username;
  form.password = user.password;
  form.role = user.role;
  form.phone = user.phone;
  form.enabled = user.enabled;
  dialogVisible.value = true;
};

const handleEdit = async () => {
  try {
    console.log('修改用户ID:', form.ID);
    const response = await request.put(`/user/update/${form.ID}`, {
      username: form.username,
      password: form.password,
      role: form.role,
      phone: form.phone,
      enabled: form.enabled
    });
    debugShowResponse('add response', response);
    const resp = response;
    const payload = resp?.data ?? resp; 
    const maybeOk =
      payload === true ||
      payload === 'true' ||
      payload?.data === true ||
      payload?.success === true ||
      payload?.ok === true ||
      payload?.result === true ||
      payload?.code === 200 ||
      resp?.status === 200;
    if (maybeOk) {
      ElMessage.success('用户信息修改成功');
      dialogVisible.value = false;
      resetForm();
      await fetchUsers();
    } else {
      ElMessage.error('修改失败');
    }
  } catch (error) {
    console.error('修改错误:', error);
    ElMessage.error('修改失败');
  }
};

const handleDelete = async (user: User) => {
  const confirmDelete = confirm('是否确认删除该用户？');
  if (!confirmDelete) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    const response = await request.delete(`/user/delete/${user.id}`); 
    debugShowResponse('add response', response);
    const resp = response;
    const payload = resp?.data ?? resp; 
    const maybeOk =
      payload === true ||
      payload === 'true' ||
      payload?.data === true ||
      payload?.success === true ||
      payload?.ok === true ||
      payload?.result === true ||
      payload?.code === 200 ||
      resp?.status === 200;
    if (maybeOk) {
      ElMessage.success('用户删除成功');
      await fetchUsers();
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    ElMessage.error('删除失败');
  }
};

const resetForm = () => {
  form.ID = 0;
  form.username = '';
  form.password = '';
  form.role = '';
  form.phone = '';
  form.enabled = true;
  form.address = '';
};

const handleSave = async () => {
  if(!form.username || !form.password || !form.role || !form.phone ){
    ElMessage.warning('请填写完整信息');
    return;
  }
  
  loading.value = true;
  try {
    if (form.ID) {
      await handleEdit();
    } else {
      await handleAdd();
    }
  } catch (error) {
    ElMessage.error('保存失败');
    console.error('Error saving user:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-list">
    <el-card class="user-card">
      <div class="header">
        <h2 class="title">👤 用户管理</h2>
        <div class="toolbar">
          <el-select
            v-model="selectedRole"
            placeholder="筛选角色"
            style="width: 200px; margin-right: 10px;"
          >
            <el-option label="全部" value="全部" />
            <el-option label="顾客" value="顾客" />
            <el-option label="商家" value="商家" />
          </el-select>
          <el-button type="primary" @click="openAddDialog">添加用户</el-button>
        </div>
      </div>

      <el-alert
        :title="`当前显示用户数：${filteredUsers.length} 位`"
        type="info"
        :closable="false"
        show-icon
        class="user-alert"
      />

      <!-- 表格 -->
      <el-table :data="filteredUsers" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="password" label="密码" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
              {{ scope.row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="address" label="地址" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="openEditDialog(scope.row)">修改</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="400px"
      :before-close="resetForm"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="顾客" value="顾客" />
            <el-option label="商家" value="商家" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false; resetForm();">取 消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>


<style scoped lang="scss">
.user-list {
  padding: 10px;

  .user-card {
    padding: 10px;
    border-radius: 12px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #2c3e50;
    }

    .toolbar {
      display: flex;
      align-items: center;
    }
  }

  .user-alert {
    margin: 10px 0 20px;
    border-radius: 8px;
    border: 1px solid #e0ebff;
    font-weight: 500;

    :deep(.el-alert__title) {
      font-size: 15px;
    }
  }

  .el-table {
    border-radius: 8px;
    overflow: hidden;
  }
}
</style>
