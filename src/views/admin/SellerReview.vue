<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Document } from '@element-plus/icons-vue'
import request from '@/utils/request'

interface Application {
  id: number
  name: string
  shopName: string
  applyTime: string
  auditStatus: string
  address: string
  phone: string
}

const applications = ref<Application[]>([])
const loading = ref(false)
const statusFilter = ref('全部')

// 调试开关
const DEBUG = true

const fetchApplications = async () => {
  loading.value = true
  try {
    const params = statusFilter.value === '全部' ? {} : { status: statusFilter.value }
    const response = await request.get('/application/list', { params })
    
    if (DEBUG) console.log('📦 申请列表响应:', JSON.stringify(response.data, null, 2))
    
    applications.value = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || [])
  } catch (error : unknown) {
    if (error instanceof Error) {
    ElMessage.error(error.message)
  } else {
    ElMessage.error('未知错误')
  }
  } finally {
    loading.value = false
  }
}

// 审核通过
const handleApprove = async (row: Application) => {
  try {
    await ElMessageBox.confirm(`通过【${row.shopName}】的申请？`, '确认', { type: 'warning' })
    const response = await request.put(`/application/approve/${row.id}`)
    
    if (DEBUG) console.log('🟢 通过响应:', JSON.stringify(response.data, null, 2))
    
    // 判断成功（支持多种返回格式）
    const isSuccess = response.data?.code === 200 || response.data?.success === true
    if (isSuccess) {
      ElMessage.success('已通过审核')
      await fetchApplications()
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('未知错误')
    }
  }
}

// 审核驳回
const handleReject = async (row: Application) => {
  try {
    await ElMessageBox.confirm(`驳回【${row.shopName}】的申请？`, '确认', { type: 'warning' })
    const response = await request.put(`/application/reject/${row.id}`)
    
    if (DEBUG) console.log('🔴 驳回响应:', JSON.stringify(response.data, null, 2))
    
    const isSuccess = response.data?.code === 200 || response.data?.success === true
    if (isSuccess) {
      ElMessage.warning('已驳回申请')
      await fetchApplications()
    } 
  } catch (error: unknown) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('未知错误')
    }
  }
}

const formatDate = (dateString: string) => {
  return dateString ? new Date(dateString).toLocaleString('zh-CN') : '-'
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    已通过: 'success',
    未通过: 'danger',
    待审核: 'warning'
  }
  return map[status] || 'info'
}

const statusOptions = [
  { label: '全部', value: '全部' },
  { label: '待审核', value: '待审核' },
  { label: '已通过', value: '已通过' },
  { label: '未通过', value: '未通过' }
]

onMounted(() => fetchApplications())
</script>

<template>
  <div class="application-review">
    <div class="header">
      <h2>🏪 商家申请审核</h2>
      <div class="header-actions">
        <el-select
          v-model="statusFilter"
          placeholder="选择状态"
          @change="fetchApplications"
          style="width: 120px"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-button type="primary" @click="fetchApplications" :loading="loading">
          <el-icon class="el-icon--left"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-alert
      :title="`当前显示：${statusFilter === '全部' ? '全部申请' : statusFilter + '的申请'}，共 ${applications.length} 条`"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 15px"
    />

    <el-table
      :data="applications"
      border
      stripe
      v-loading="loading"
      empty-text="暂无商家申请数据"
    >
      <el-table-column prop="id" label="申请ID" width="90" align="center" />
      <el-table-column prop="shopName" label="商家名称" width="180" />
      <el-table-column prop="name" label="申请人" width="100" />
      <el-table-column prop="phone" label="联系电话" width="150" />
      <el-table-column prop="address" label="商家地址" min-width="200" show-overflow-tooltip />
      <el-table-column prop="applyTime" label="申请时间" width="180">
        <template #default="{ row }">{{ formatDate(row.applyTime) }}</template>
      </el-table-column>
      <el-table-column prop="auditStatus" label="审核状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.auditStatus)" effect="light">
            {{ row.auditStatus }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            type="success"
            size="small"
            @click="handleApprove(row)"
            :disabled="row.auditStatus === '已通过' || row.auditStatus === '审核通过'"
          >
            通过
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleReject(row)"
            :disabled="row.auditStatus === '未通过' || row.auditStatus === '审核拒绝'"
          >
            驳回
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <div class="empty-state" v-if="!loading && applications.length === 0">
      <el-empty description="暂无商家申请数据">
        <template #image>
          <div class="empty-image">
            <el-icon size="80"><Document /></el-icon>
          </div>
        </template>
        <p v-if="statusFilter !== '全部'">暂无{{ statusFilter }}的商家申请</p>
      </el-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
.application-review {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 24px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;

    .empty-image {
      color: #c0c4cc;
    }

    p {
      margin-top: 8px;
      color: #909399;
    }
  }
}

@media (max-width: 768px) {
  .application-review {
    padding: 15px;

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .header-actions {
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>
