<script lang="ts" setup>
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus';
import {ref, reactive, onMounted } from 'vue';

const categoryForm = reactive({
  ID: 0,
  name: '',
  description: ''
})

interface Category {
  id: number;
  name: string;
  description: string;
}

//重置表单
const resetForm = () => {
  categoryForm.ID = 0;
  categoryForm.name = '';
  categoryForm.description = '';
};

// 查看全部类别
const categorys = ref<Category[]>([]);
const fetchCategories = async () => {
  try {
    const response = await fetch('http://localhost:8080/category/list',{
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
    categorys.value = data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    categorys.value = [];
  }
}
const debugShowResponse = (label: string, response: unknown) => {
  console.log(`${label}:`, response);
};

// 添加类别
const openAddDialog = () => {
  dialogTitle.value = '添加类别';
  resetForm(); 
  dialogVisible.value = true;
};

const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('添加类别');

const handleAdd = async () => {
  try {
    loading.value = true;
    const response = await request.post('/category/add', {
      name: categoryForm.name,
      description: categoryForm.description
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
      ElMessage.success('类别添加成功');
      dialogVisible.value = false; 
      resetForm();
      await fetchCategories(); 
    } else {
      ElMessage.error('添加失败' );
    }
  } catch (error) {
    console.error('Error adding category:', error);
    ElMessage.error('添加失败,请重试');
  } finally {
    loading.value = false;
  }
};


// 修改类别
const openEditDialog = (category: Category) => {
  dialogTitle.value = '修改类别';
  Object.assign(categoryForm, {
    ID: category.id,
    name: category.name,
    description: category.description
  });
  dialogVisible.value = true;
};

const handleEdit = async () => {
  try {
    loading.value = true;
    const response = await request.put(`/category/update/${categoryForm.ID}`, {
      name: categoryForm.name,
      description: categoryForm.description
    });

    debugShowResponse('edit response', response);

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
      ElMessage.success('类别修改成功');
      dialogVisible.value = false; 
      resetForm();
      await fetchCategories();
    } else {
      ElMessage.error('修改失败');
    }
  } catch (error) {
    console.error('修改错误:', error);
    ElMessage.error('修改失败');
  } finally {
    loading.value = false;
  }
};

// 删除类别
const handleDelete = async (category: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除类别 "${category.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const response = await request.delete(`/category/delete/${category.id}`);
    debugShowResponse('delete response', response);
    const payload = response?.data ?? response;
    const maybeOk =
      payload === true ||
      payload === 'true' ||
      payload?.data === true ||
      payload?.success === true ||
      payload?.ok === true ||
      payload?.result === true ||
      payload?.code === 200 ||
      response?.status === 200;
    if (maybeOk) {
      ElMessage.success('类别删除成功');  
      await fetchCategories();
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    ElMessage.error('删除失败，请重试');
  }
};


//保存按钮
const handleSave = async () => {
  loading.value = true;
  try{
    if(categoryForm.ID){
      await handleEdit();
    } else {
      await handleAdd();
    }
  }catch (error) {
    ElMessage.error('保存失败');
    console.error('保存错误:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});

</script>

<template>
  <div class="category-manage">
    <div class="header">
      <h2>🗂️ 商品类别</h2>
      <el-button type="primary" @click="openAddDialog">新增类别</el-button>
    </div>

    <el-alert 
      :title="`当前共有 ${categorys.length} 个类别`" 
      type="info"
      :closable="false"
      show-icon
      class="category-alert"
    />

    <el-table :data="categorys" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="类别名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗表单 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="400px">
      <el-form label-width="80px">
        <el-form-item label="类别名称" required>
          <el-input v-model="categoryForm.name" placeholder="请输入类别名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="categoryForm.description" placeholder="请输入描述信息" type="textarea" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.category-manage {
  padding: 24px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    h2 {
      margin:0;
      font-size: 22px;
      font-weight: 600;
      color: #333;
    }
  }

    .category-alert {
    margin: 10px 0 20px;
    border-radius: 8px;
    border: 1px solid #e0ebff;
    font-weight: 500;

    :deep(.el-alert__title) {
      font-size: 15px;
      line-height: 1.6;
    }
  }

  .el-table {
    border-radius: 6px;
  }
}
</style>
