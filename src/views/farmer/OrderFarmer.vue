<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface Order {
  id: number
  customer: string
  total: number
  status: string
  time: string
}

const orders = ref<Order[]>([
  { id: 1, customer: '李四', total: 120.5, status: '待发货', time: '2025-10-20 10:30' },
  { id: 2, customer: '王五', total: 260.0, status: '已发货', time: '2025-10-19 15:20' },
  { id: 3, customer: '赵六', total: 89.9, status: '已完成', time: '2025-10-18 09:50' },
])

function updateStatus(order: Order, newStatus: string) {
  order.status = newStatus
  ElMessage.success(`订单状态已更新为「${newStatus}」`)
}
</script>

<template>
  <div class="order-manage">
    <el-card>
      <h2>🧾 订单管理</h2>
      <el-table :data="orders" border stripe>
        <el-table-column prop="id" label="订单号" width="100" />
        <el-table-column prop="customer" label="顾客" width="100" />
        <el-table-column prop="total" label="金额（元）" width="120" />
        <el-table-column prop="time" label="下单时间" />
        <el-table-column prop="status" label="状态" width="150" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" type="primary" v-if="row.status === '待发货'" @click="updateStatus(row, '已发货')">发货</el-button>
            <el-button size="small" type="success" v-if="row.status === '已发货'" @click="updateStatus(row, '已完成')">确认完成</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.order-manage {
  padding: 20px;
}
</style>
