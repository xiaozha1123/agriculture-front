<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import request from '@/utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

interface OrderDetail {
  productId: number
  productName: string
  price: number
  quantity: number
}

interface Order {
  id: number
  customerId: number
  totalPrice: number
  orderTime: string
  status: string
  address: string
  details: OrderDetail[]
}

const orders = ref<Order[]>([])
const expandedOrderIds = ref<number[]>([])
const loading = ref(false)
const username = ref('')
const currentUserId = ref<number | null>(null)

const getUsername = () => {
  const sessionUser = sessionStorage.getItem('username')
  if (sessionUser) {
    username.value = sessionUser
  }
}

// 获取当前用户ID
const getCurrentUserId = async () => {
  try {
    const usernameVal = username.value;
    if (!usernameVal) {
      console.warn('未检测到用户名');
      return;
    }

    const response = await fetch(`http://localhost:8080/user/getUserId?username=${encodeURIComponent(usernameVal)}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      const result = await response.json();
      // 根据实际API响应结构调整
      currentUserId.value = result?.userId ?? result?.id ?? result?.data ?? null;
    }
  } catch (error) {
    console.error('获取用户ID失败:', error);
  }
}

const fetchShopOrders = async () => {
  try {
    loading.value = true;

    const usernameVal = username.value;
    if (!usernameVal) {
      ElMessage.warning('未检测到当前登录用户名，请先登录');
      return;
    }

    const shopResp = await fetch(`http://localhost:8080/shop/getShopId?username=${encodeURIComponent(usernameVal)}`,{
        credentials: 'include',
        headers: { Accept: 'application/json' }
      }
    );

    if (!shopResp.ok) {
      throw new Error(`获取商铺ID失败，状态码 ${shopResp.status}`);
    }

    const shopBody = await shopResp.json();
    let shopId: number | null = null;
    if (typeof shopBody === 'number') {
      shopId = shopBody;
    } else if (shopBody && typeof shopBody === 'object') {
      shopId = shopBody.shopId ?? shopBody.id ?? shopBody.data?.id ?? shopBody.data ?? null;
    }

    if (!shopId) {
      console.warn('无法从 /shop/getShopId 响应中解析到 shopId：', shopBody);
      ElMessage.warning('未找到对应商铺，请检查商家信息');
      orders.value = [];
      return;
    }

    const resp = await fetch(`http://localhost:8080/order/shop/${shopId}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!resp.ok) {
      throw new Error(`获取订单失败，状态码 ${resp.status}`);
    }

    const result = await resp.json();
    const rawOrders = Array.isArray(result) ? result : (result?.data ?? result);

    if (!Array.isArray(rawOrders)) {
      console.warn('订单数据格式异常：', result);
      orders.value = [];
      ElMessage.info('未找到订单数据');
      return;
    }

    orders.value = rawOrders
      .map((o: { 
        id: number; 
        customerId: number; 
        totalPrice: number; 
        orderTime: string; 
        status: string; 
        address?: string; 
        details?: OrderDetail[] | undefined; 
        orderDetails?: OrderDetail[] | undefined; 
      }) => ({
        id: o.id,
        customerId: o.customerId,
        totalPrice: o.totalPrice,
        orderTime: o.orderTime,
        status: o.status,
        address: o.address ?? '',
        details: Array.isArray(o.details) ? o.details : (o.orderDetails ?? [])
      }))
      .sort((a: Order, b: Order) => (a.id ?? 0) - (b.id ?? 0));

  } catch (error) {
    console.error('Error fetching orders:', error);
    ElMessage.error('获取订单失败，请稍后重试');
    orders.value = [];
  } finally {
    loading.value = false;
  }
};

const toggleOrderExpand = (id: number) => {
  const index = expandedOrderIds.value.indexOf(id)
  if (index === -1) expandedOrderIds.value.push(id)
  else expandedOrderIds.value.splice(index, 1)
}
const isOrderExpanded = (id: number) => expandedOrderIds.value.includes(id)

const getStatusTagType = (status: string) => {
  switch (status) {
    case '待发货': return 'warning'
    case '已发货': return 'info'
    case '已完成': return 'success'
    default: return ''
  }
}

const handleStatusUpdate = async (order: Order, newStatus: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要将订单 #${order.id} 状态修改为 "${newStatus}" 吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 简化后的URL，不需要userId
    const response = await request.put(
      `/order/updateStatus/${order.id}`, 
      { status: newStatus }
    )
    
    if (response?.data?.success || response?.status === 200) {
      ElMessage.success(`订单状态已更新为 "${newStatus}"`)
      order.status = newStatus
    }
  } catch (error) {
    console.error('Error updating status:', error)
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

onMounted(async () => {
  getUsername()
  await getCurrentUserId() // 先获取用户ID
  await fetchShopOrders() // 再获取订单
})
</script>

<template>
  <div class="order-list">
    <el-card>
      <div class="header">
        <h2>📦 订单管理</h2>
      </div>

      <el-alert
        :title="`当前共有 ${orders.length} 个订单`"
        type="info"
        show-icon
        :closable="false"
        class="order-alert"
      />

      <el-table
        v-loading="loading"
        :data="orders"
        stripe
        border
        style="margin-top: 10px"
      >
        <el-table-column prop="id" label="订单编号" width="120" />
        <el-table-column prop="customerId" label="顾客ID" width="120" />
        <el-table-column prop="totalPrice" label="总金额" width="120">
          <template #default="{ row }">¥{{ row.totalPrice.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="orderTime" label="下单时间" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="toggleOrderExpand(row.id)">
              {{ isOrderExpanded(row.id) ? '收起详情' : '查看详情' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 展开的订单详情 -->
      <div v-for="order in orders" :key="order.id">
        <el-collapse-transition>
          <div v-if="isOrderExpanded(order.id)" class="order-details">
            <!-- 基本信息 -->
            <div class="order-info">
              <h3 class="section-title">订单信息</h3>
              <el-descriptions :column="2" border>
                <el-descriptions-item label="订单ID">{{ order.id }}</el-descriptions-item>
                <el-descriptions-item label="顾客ID">{{ order.customerId }}</el-descriptions-item>
                <el-descriptions-item label="订单总额">
                  <span class="highlight">¥{{ order.totalPrice.toFixed(2) }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag :type="getStatusTagType(order.status)" size="small">{{ order.status }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="下单时间">{{ order.orderTime }}</el-descriptions-item>
                <el-descriptions-item label="收货地址">{{ order.address }}</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 商品明细 -->
            <div class="product-details">
              <h3 class="section-title">
                🛒 商品明细
                <span class="count">(共 {{ order.details.length }} 件商品)</span>
              </h3>

              <el-table :data="order.details" border stripe size="small" class="product-table">
                <el-table-column prop="productId" label="商品ID" width="100" align="center" />
                <el-table-column prop="productName" label="商品名称" />
                <el-table-column label="单价" width="120" align="center">
                  <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="100" align="center" />
                <el-table-column label="小计" width="120" align="center">
                  <template #default="{ row }">
                    <span class="subtotal">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
                  </template>
                </el-table-column>
              </el-table>

              <div class="order-total">
                <span>订单总额：</span>
                <strong class="highlight">¥{{ order.totalPrice.toFixed(2) }}</strong>
              </div>
            </div>

            <!-- 操作 -->
            <div class="order-actions">
              <el-button
                v-if="order.status === '待发货'"
                type="primary"
                size="small"
                @click="handleStatusUpdate(order, '已发货')"
              >
                发货
              </el-button>
              <el-button
                v-if="order.status === '已发货'"
                type="success"
                size="small"
                @click="handleStatusUpdate(order, '完成')"
              >
                确认完成
              </el-button>
              <span
                v-if="!['待发货', '已发货'].includes(order.status)"
                class="no-action"
              >当前状态不可操作</span>
            </div>
          </div>
        </el-collapse-transition>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.order-list {
  padding: 20px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .order-alert {
    margin: 10px 0 20px;
    border-radius: 8px;
  }

  .order-details {
    background: #f9fafc;
    border-top: 1px solid #ebeef5;
    padding: 25px 20px;
    border-radius: 8px;
    margin-top: 10px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .count {
        font-size: 14px;
        font-weight: 400;
        color: #909399;
      }
    }

    .highlight {
      color: #f56c6c;
      font-weight: bold;
    }

    .subtotal {
      color: #f56c6c;
      font-weight: 500;
    }

    .order-info {
      margin-bottom: 25px;

      .el-descriptions {
        background: white;
        border-radius: 8px;
      }
    }

    .product-details {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 25px;

      .product-table {
        margin-top: 10px;
      }

      .order-total {
        text-align: right;
        font-size: 18px;
        padding-top: 15px;
        border-top: 1px dashed #ebeef5;
      }
    }

    .order-actions {
      text-align: right;
      padding-top: 15px;
      border-top: 1px solid #ebeef5;

      .no-action {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}
</style>