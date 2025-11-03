<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Announcement {
  id: number
  title: string
  content: string
  date: string
}

const announcements = ref<Announcement[]>([
  { id: 1, title: '系统维护通知', content: '平台将于10月30日凌晨维护。', date: '2025-10-25' },
  { id: 2, title: '秋季促销活动', content: '10月20日至31日全场9折优惠！', date: '2025-10-18' },
])

const dialogVisible = ref(false)
const form = ref<Announcement>({ id: 0, title: '', content: '', date: '' })
const isEdit = ref(false)

function handleAdd() {
  form.value = { id: Date.now(), title: '', content: '', date: new Date().toISOString().split('T')[0] || '' }
  isEdit.value = false
  dialogVisible.value = true
}

function handleEdit(row: Announcement) {
  form.value = { ...row }
  isEdit.value = true
  dialogVisible.value = true
}

function handleDelete(id: number) {
  ElMessageBox.confirm('确定删除该公告吗？', '警告', { type: 'warning' })
    .then(() => {
      announcements.value = announcements.value.filter(a => a.id !== id)
      ElMessage.success('公告已删除')
    })
}

function handleSubmit() {
  if (isEdit.value) {
    const index = announcements.value.findIndex(a => a.id === form.value.id)
    announcements.value[index] = { ...form.value }
    ElMessage.success('公告已更新')
  } else {
    announcements.value.push({ ...form.value })
    ElMessage.success('公告已添加')
  }
  dialogVisible.value = false
}
</script>

<template>
  <div class="announcement-manage">
    <h2>📢 公告管理</h2>

    <el-button type="primary" @click="handleAdd">新增公告</el-button>

    <el-table :data="announcements" border stripe style="margin-top: 20px;">
      <el-table-column prop="id" label="编号" width="80" />
      <el-table-column prop="title" label="标题" width="200" />
      <el-table-column prop="content" label="内容" />
      <el-table-column prop="date" label="发布时间" width="150" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑公告' : '新增公告'" width="500px">
      <el-form label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="form.content" rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.announcement-manage {
  padding: 20px;
}
</style>
