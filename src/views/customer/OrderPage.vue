<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟订单数据
const orders = ref([
  {
    id: 'A20251101',
    date: '2025-11-01',
    total: 156.6,
    status: '待发货',
    items: [
      { name: '生态大米', qty: 1 },
      { name: '有机苹果', qty: 2 }
    ]
  },
  {
    id: 'A20251020',
    date: '2025-10-20',
    total: 89.9,
    status: '已完成',
    items: [{ name: '农用铁锹', qty: 1 }]
  }
])

const cancelOrder = (id: string) => {
  const order = orders.value.find(o => o.id === id)
  if (order && order.status === '待发货') {
    order.status = '已取消'
    ElMessage.success('订单已取消')
  } else {
    ElMessage.warning('当前订单无法取消')
  }
}
</script>

<template>
  <div class="orders-page">
    <h2>📦 我的订单</h2>

    <el-table :data="orders" border stripe>
      <el-table-column prop="id" label="订单号" width="180" />
      <el-table-column prop="date" label="下单日期" width="140" />
      <el-table-column label="商品详情">
        <template #default="{ row }">
          <ul>
            <li v-for="item in row.items" :key="item.name">{{ item.name }} × {{ item.qty }}</li>
          </ul>
        </template>
      </el-table-column>
      <el-table-column prop="total" label="总金额(¥)" width="120" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button v-if="row.status === '待发货'" size="small" type="danger" @click="cancelOrder(row.id)">取消订单</el-button>
          <el-button v-else disabled size="small">无操作</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.orders-page {
  padding: 30px 60px;
}
</style>
