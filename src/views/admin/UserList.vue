<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, computed } from 'vue';

const selectedRole = ref('全部');

const allUsers = ref<UserRow[]>([
  { id: 1, username: 'user1', password: 'pass1', role: '用户', phone: '1234567890', address: '地址1' },
  { id: 2, username: 'merchant1', password: 'mypass1', role: '商家', phone: '1122334455', address: '商家地址1' },
]);

const dialogVisible = ref(false);
const dialogTitle = ref('添加用户');
const formData = reactive<UserRow>({
  id: null,
  username: '',
  password: '',
  role: '',
  phone: '',
  address: ''
});

interface UserRow {
  id: number | null;
  username: string;
  password: string;
  role: string;
  phone: string;
  address: string;
}

const filteredUsers = computed(() => {
  if (selectedRole.value === '全部') return allUsers.value;
  return allUsers.value.filter(user => user.role === selectedRole.value);
});

const handleAdd = () => {
  dialogTitle.value = '添加用户';
  Object.assign(formData, {
    id: null,
    username: '',
    password: '',
    role: '',
    phone: '',
    address: ''
  });
  dialogVisible.value = true;
};

const handleEdit = (row: UserRow) => {
  dialogTitle.value = '修改信息';
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = (row: UserRow) => {
  ElMessageBox.confirm('是否确认删除该用户？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const index = allUsers.value.findIndex(item => item.id === row.id);
    if (index !== -1) allUsers.value.splice(index, 1);
    ElMessage({ message: '删除成功', type: 'success' });
  });
};

const handleSave = () => {
  if (formData.id) {
    const index = allUsers.value.findIndex(item => item.id === formData.id);
    if (index !== -1) allUsers.value[index] = { ...formData };
    ElMessage({ message: '修改成功', type: 'success' });
  } else {
    formData.id = Date.now();
    allUsers.value.push({ ...formData });
    ElMessage({ message: '添加成功', type: 'success' });
  }
  dialogVisible.value = false;
};

</script>

<template>
  <div class="user-list">
    <el-card>
      <div class="header">
        <h2 class="title">👤 用户管理</h2>
        <div class="toolbar">
          <el-select v-model="selectedRole" placeholder="筛选角色" style="width: 200px; margin-right: 10px;">
            <el-option label="全部" value="全部" />
            <el-option label="用户" value="用户" />
            <el-option label="商家" value="商家" />
          </el-select>
          <el-button type="primary" @click="handleAdd">添加用户</el-button>
        </div>
      </div>

      <el-table :data="filteredUsers" border stripe style="margin-top: 10px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="password" label="密码" />
        <el-table-column prop="role" label="角色" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="address" label="地址" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">修改</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="400px">
      <el-form :model="formData" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.password" type="password" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="用户" value="用户" />
            <el-option label="商家" value="商家" />
          </el-select>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="formData.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSave">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-list {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.toolbar {
  display: flex;
  align-items: center;
}

</style>
