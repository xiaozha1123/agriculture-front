<template>
  <div class="admin-order-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>🧾 订单管理</h2>
      <p class="desc">管理员可查看、筛选、管理全平台的订单信息</p>
    </div>

    <!-- 筛选栏 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filters" label-width="80px">
        <el-form-item label="订单编号">
          <el-input v-model="filters.orderId" placeholder="请输入订单编号" clearable />
        </el-form-item>
        <el-form-item label="商家名称">
          <el-input v-model="filters.sellerName" placeholder="请输入商家名称" clearable />
        </el-form-item>
        <el-form-item label="顾客名称">
          <el-input v-model="filters.buyerName" placeholder="请输入顾客名称" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 150px">
            <el-option label="待支付" value="待支付" />
            <el-option label="待发货" value="待发货" />
            <el-option label="运输中" value="运输中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="退款中" value="退款中" />
            <el-option label="已取消" value="已取消" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据概览卡片 -->
    <div class="overview-cards">
      <el-card class="overview-card" shadow="hover">
        <p class="title">今日订单数</p>
        <p class="value">{{ statistics.todayOrders }}</p>
      </el-card>
      <el-card class="overview-card" shadow="hover">
        <p class="title">本月销售额</p>
        <p class="value">￥{{ statistics.monthSales.toFixed(2) }}</p>
      </el-card>
      <el-card class="overview-card" shadow="hover">
        <p class="title">退款中订单</p>
        <p class="value">{{ statistics.refunding }}</p>
      </el-card>
      <el-card class="overview-card" shadow="hover">
        <p class="title">待发货订单</p>
        <p class="value">{{ statistics.pendingShip }}</p>
      </el-card>
    </div>

    <!-- 订单表格 -->
    <el-card class="table-card" shadow="hover">
      <el-table :data="orders" stripe border style="width: 100%">
        <el-table-column prop="orderId" label="订单编号" width="160" />
        <el-table-column prop="buyerName" label="顾客" width="120" />
        <el-table-column prop="sellerName" label="商家" width="120" />
        <el-table-column prop="totalAmount" label="总金额" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="statusColor(row.status)"
              disable-transitions
            >{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="warning" size="small" @click="changeStatus(row)">修改状态</el-button>
            <el-button type="danger" size="small" @click="deleteOrder(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="订单编号">{{ selectedOrder?.orderId }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ selectedOrder?.status }}</el-descriptions-item>
        <el-descriptions-item label="顾客">{{ selectedOrder?.buyerName }}</el-descriptions-item>
        <el-descriptions-item label="商家">{{ selectedOrder?.sellerName }}</el-descriptions-item>
        <el-descriptions-item label="金额">￥{{ selectedOrder?.totalAmount }}</el-descriptions-item>
        <el-descriptions-item label="下单时间">{{ selectedOrder?.createTime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 模拟筛选条件
const filters = reactive({
  orderId: '',
  sellerName: '',
  buyerName: '',
  status: '',
  dateRange: []
})

// 模拟数据统计
const statistics = reactive({
  todayOrders: 25,
  monthSales: 125600.75,
  refunding: 3,
  pendingShip: 5
})

// 模拟订单数据
const orders = ref([
  { orderId: 'A1001', buyerName: '张三', sellerName: '绿田果园', totalAmount: 89.9, status: '已完成', createTime: '2025-10-30 09:35' },
  { orderId: 'A1002', buyerName: '李四', sellerName: '乡村蜂业', totalAmount: 120.5, status: '待发货', createTime: '2025-10-29 14:22' },
  { orderId: 'A1003', buyerName: '王五', sellerName: '有机菜农', totalAmount: 56.0, status: '退款中', createTime: '2025-10-28 16:10' },
  { orderId: 'A1004', buyerName: '赵六', sellerName: '绿田果园', totalAmount: 78.0, status: '运输中', createTime: '2025-10-27 12:40' },
])

// 查看详情
const detailVisible = ref(false)
const selectedOrder = ref<Order | null>(null)
interface Order {
  orderId: string;
  buyerName: string;
  sellerName: string;
  totalAmount: number;
  status: string;
  createTime: string;
}


// 修改状态
function changeStatus(row: Order) {
  ElMessageBox.prompt('请输入新的订单状态', '修改订单状态', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(({ value }) => {
    row.status = value
    ElMessage.success('状态修改成功')
  }).catch(() => {})
}

// 删除订单
function deleteOrder(row: Order) {
  ElMessageBox.confirm(`确定删除订单 ${row.orderId} 吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    orders.value = orders.value.filter(o => o.orderId !== row.orderId)
    ElMessage.success('删除成功')
  })
}

// 搜索和重置
function handleSearch() {
  ElMessage.info('此处将调用后端接口进行筛选查询')
}
function handleReset() {
  Object.assign(filters, { orderId: '', sellerName: '', buyerName: '', status: '', dateRange: [] })
  ElMessage.success('筛选条件已重置')
}

// 状态颜色映射
function statusColor(status: string) {
  switch (status) {
    case '已完成': return 'success'
    case '待发货': return 'warning'
    case '退款中': return 'danger'
    case '运输中': return 'info'
    default: return ''
  }
}
</script>

<style scoped lang="scss">
.admin-order-page {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;
    h2 {
      margin: 0;
      font-size: 24px;
      color: #2b5d34;
    }
    .desc {
      color: #888;
      font-size: 14px;
      margin-top: 5px;
    }
  }

  .filter-card {
    margin-bottom: 20px;
  }

  .overview-cards {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    .overview-card {
      flex: 1;
      text-align: center;
      .title {
        font-size: 15px;
        color: #555;
        margin-bottom: 5px;
      }
      .value {
        font-size: 22px;
        font-weight: bold;
        color: #2b5d34;
      }
    }
  }

  .table-card {
    .el-table {
      margin-top: 10px;
    }
  }
}
</style>
