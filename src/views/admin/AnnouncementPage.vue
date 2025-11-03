<script setup lang="ts">
import request from '@/utils/request'
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const announcementForm = reactive({
  ID: 0,
  title: '',
  content: '',
  createTime: '',
  status:''
})

interface Announcement {
  id: number;
  title: string;
  content: string;
  createTime: string | Date;  // 修改为支持字符串和Date类型
  status: string;
}

// 格式化时间显示
const formatDate = (date: string | Date) => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      return '无效日期';
    }
    
    // 格式化为 YYYY-MM-DD HH:mm:ss
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '格式错误';
  }
}

//重置表单
function resetForm() {
  announcementForm.ID = 0
  announcementForm.title = ''
  announcementForm.content = ''
  announcementForm.createTime = ''
  announcementForm.status = ''
}

//查看列表
const announcements = ref<Announcement[]>([]);
const fetchAnnouncements = async () => {
  try {
    const response = await fetch('http://localhost:8080/announcement/list',{
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
    console.log('公告列表数据:', data); // 调试日志
    announcements.value = data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    announcements.value = [];
  }
}

const debugShowResponse = (label: string, response: unknown) => {
  console.log(`${label}:`, response);
};

//新增公告
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增公告')

const openAddDialog = () => {
  dialogTitle.value = '新增公告'
  resetForm()
  dialogVisible.value = true
}

const handleAdd = async () => {
  try {
    loading.value = true;
    const response = await request.post('/announcement/add', {
      title: announcementForm.title,
      content: announcementForm.content,
      createTime: new Date().toISOString(), // 使用ISO格式
      status: announcementForm.status
    });
    debugShowResponse('Add Announcement Response', response.data);
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
      ElMessage.success('公告添加成功');
      dialogVisible.value = false;
      resetForm();
      await fetchAnnouncements();
    } else {
      ElMessage.error('公告添加失败');
    }
  } catch (error) {
    console.error('Error adding announcement:', error);
    ElMessage.error('公告添加失败');
  } finally {
    loading.value = false;
  }
}

// 编辑公告
const openEditDialog = (announcement:Announcement) => {
  dialogTitle.value = '编辑公告'
  Object.assign(announcementForm, {
    ID: announcement.id,  // 修复：使用 ID 而不是 id
    title: announcement.title,
    content: announcement.content,
    createTime: announcement.createTime,
    status: announcement.status
  })
  dialogVisible.value = true
};

const handleEdit = async () =>{
  try {
    loading.value = true;
    const response = await request.put(`/announcement/update/${announcementForm.ID}`, {
      title: announcementForm.title,
      content: announcementForm.content,
      createTime: announcementForm.createTime,
      status: announcementForm.status
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
      ElMessage.success('公告修改成功');
      dialogVisible.value = false; 
      resetForm();
      await fetchAnnouncements();
    } else {
      ElMessage.error('修改失败');
    }
  } catch (error) {
    console.error('修改错误:', error);
    ElMessage.error('修改失败');
  } finally {
    loading.value = false;
  }
}

// 删除公告
const handleDelete = async (announcement: Announcement) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除公告 "${announcement.title}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const response = await request.delete(`/announcement/delete/${announcement.id}`);
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
      ElMessage.success('公告删除成功');
      await fetchAnnouncements();
    } else {
      ElMessage.error('删除失败');
    }
  } catch (error) {
    console.error('Error deleting announcement:', error);
    ElMessage.error('删除失败，请重试');
  }
};


const handleSave = async () => {
  loading.value = true;
  try{
    if(announcementForm.ID){
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
  fetchAnnouncements();
});

</script>

<template>
  <div class="announcement-manage">
    <div class="header">
      <h2>公告管理</h2>
      <el-button type="primary" @click="openAddDialog">新增公告</el-button>
    </div>

    <el-alert 
      :title="`当前共有 ${announcements.length} 条公告`" 
      type="info"
      :closable="false"
      show-icon
      class="announcement-alert"
    />

    <el-table :data="announcements" border stripe style="margin-top: 20px;">
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="content" label="内容" />
      <el-table-column prop="createTime" label="发布时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="announcementForm.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="announcementForm.content" rows="4" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="announcementForm.status" placeholder="请选择状态">
            <el-option label="已发布" value="已发布" />
            <el-option label="草稿" value="草稿" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.announcement-manage {
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    h2{
      margin:0;
      font-size: 22px;
      font-weight: 600;
      color:#333
    }
  }
  .announcement-alert {
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