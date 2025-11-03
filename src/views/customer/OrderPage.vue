<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface OrderDetail {
  id: number
  orderId: number
  productId: number
  price: number
  quantity: number
  productName?: string
  productImage?: string
}

interface Order {
  id: number
  orderNo?: string
  customerId: number
  totalPrice: number
  status: string
  orderTime: string
  address: string
  orderDetails: OrderDetail[]
}

interface Product {
  id: number
  name?: string
  productName?: string
}

const orders = ref<Order[]>([])
const loading = ref(false)
const userId = ref<number | null>(null)
const activeOrder = ref<number | string | null>(null)
const productMap = ref<Record<number, { name: string; image: string }>>({})

// 获取用户ID
const fetchUserIdByUsername = async (username: string) => {
  try {
    const res = await fetch(`http://localhost:8080/user/userId?username=${encodeURIComponent(username)}`, {
      credentials: 'include',
    })
    const data = await res.json()
    return data.data || data
  } catch {
    ElMessage.error('无法获取用户ID')
    return null
  }
}

const initializeUser = async () => {
  const username = sessionStorage.getItem('username')
  if (!username) {
    ElMessage.warning('请先登录')
    return false
  }
  const id = await fetchUserIdByUsername(username)
  if (id) {
    userId.value = id
    return true
  }
  return false
}

// 加载商品映射
const fetchAllProducts = async () => {
  try {
    const res = await fetch('http://localhost:8080/product/list')
    const data = await res.json()
    const list: Product[] = Array.isArray(data) ? data : (data.data || [])
    
    list.forEach((p) => {
      const name = p.name || p.productName || `商品 #${p.id}`
      productMap.value[p.id] = { name, image: 'https://via.placeholder.com/80' }
    })
  } catch {
    ElMessage.error('加载商品列表失败')
  }
}

// 加载订单
const fetchOrders = async () => {
  try {
    if (!userId.value) {
      const ok = await initializeUser()
      if (!ok) return
    }
    loading.value = true
    const res = await fetch(`http://localhost:8080/order/list/${userId.value}`)
    const data = await res.json()
    const orderList = Array.isArray(data) ? data : (data.data || [])

    if (Object.keys(productMap.value).length === 0) {
      await fetchAllProducts()
    }

    orders.value = orderList.map((order: Order) => ({
      ...order,
      orderDetails: order.orderDetails.map((d) => {
        const productInfo = productMap.value[d.productId]
        return {
          ...d,
          productName: productInfo?.name || `商品 #${d.productId}`,
          productImage: productInfo?.image || 'https://via.placeholder.com/80',
        }
      }),
    }))
  } catch {
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

// 取消订单
const cancelOrder = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认取消订单？', '提示', { type: 'warning' })
    const res = await fetch(`http://localhost:8080/order/cancel/${id}`, { method: 'PUT' })
    const data = await res.json()
    if (data.success || data.code === 200) {
      ElMessage.success('订单已取消')
      fetchOrders()
    } else {
      ElMessage.error(data.message || '取消失败')
    }
  } catch {}
}

// 修改 payOrder 函数
const payOrder = async (id: number) => {
  try {
    const order = orders.value.find(o => o.id === id)
    if (!order) {
      ElMessage.error('订单不存在')
      return
    }

    // ✅ 支付前状态检查（前置验证）
    if (!['待付款', '待支付'].includes(order.status)) {
      ElMessage.warning(`订单状态为"${order.status}"，无法支付`)
      console.error('❌ 订单状态异常:', { orderId: id, currentStatus: order.status })
      return
    }

    // ✅ 支付前确认
    await ElMessageBox.confirm(
      `订单号：${order.orderNo || id}\n支付金额：¥${order.totalPrice.toFixed(2)}`, 
      '确认支付', 
      { 
        type: 'success',
        confirmButtonText: '立即支付',
        cancelButtonText: '取消',
        dangerouslyUseHTMLString: true
      }
    )
    
    // ✅ 显示支付中状态
    const loadingMsg = ElMessage.info('支付处理中...')
    
    const res = await fetch(`http://localhost:8080/order/pay/${id}`, { 
      method: 'PUT',
      credentials: 'include'
    })
    
    const data = await res.json()
    
    // 关闭支付中提示
    loadingMsg.close()
    
    // ✅ 详细日志
    console.log('🔄 支付接口返回:', JSON.stringify(data, null, 2))
    
    // ✅ 成功判断
    if (data.success === true || data.code === 200) {
      ElMessage.success('🎉 支付成功！')
      
      // 即时更新状态
      order.status = '待发货'
      order.orderTime = new Date().toISOString() // 更新时间
      
      // 可选：延迟刷新
      setTimeout(() => {
        fetchOrders()
        ElMessage.success('订单状态已更新为"待发货"')
      }, 500)
    } else {
      // ❌ 详细错误处理
      const errorMsg = data.message || data.msg || '支付失败'
      const errorCode = data.code || '未知错误码'
      
      console.error('❌ 支付失败详情:', {
        orderId: id,
        errorCode,
        errorMsg,
        currentOrderStatus: order.status
      })
      
      // 根据错误码给用户具体提示
      let userErrorMsg = errorMsg
      if (errorCode === 400) {
        userErrorMsg = '订单状态异常，请刷新页面后重试'
      } else if (errorCode === 404) {
        userErrorMsg = '订单不存在'
      } else if (errorCode === 403) {
        userErrorMsg = '无权限操作此订单'
      }
      
      ElMessage.error(`支付失败：${userErrorMsg}`)
    }
  } catch (error) {
    if (error === 'cancel') {
      ElMessage.info('已取消支付')
      return
    }
    console.error('❌ 支付异常:', error)
    ElMessage.error('支付操作失败，请稍后重试')
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleString('zh-CN')
  } catch {
    return dateString
  }
}

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '完成': 'success',
    '待付款': 'warning',
    '待发货': 'info',
    '已发货': 'primary',
    '已取消': 'danger',
  }
  return map[status] || 'primary'
}

onMounted(async () => {
  const userReady = await initializeUser()
  if (userReady) {
    await fetchAllProducts()
    await fetchOrders()
  }
})
</script>

<template>
  <div class="order-management">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="title">
            <h2>🧾 我的订单</h2>
          </div>
          <div class="result-count" v-if="orders.length">
            共计 <strong>{{ orders.length }}</strong> 个订单
          </div>
          
        </div>
      </template>

      <div v-loading="loading" element-loading-text="正在加载订单...">
        <div v-if="orders.length > 0">
          <el-collapse v-model="activeOrder" accordion>
            <el-collapse-item
              v-for="order in orders"
              :key="order.id"
              :name="order.id"
              class="order-item"
            >
              <template #title>
                <div class="order-header">
                  <div>
                    <span class="order-id">订单号: {{ order.orderNo }}</span>
                  </div>
                  <div class="order-status-info">
                    <el-tag :type="getStatusType(order.status)" effect="light">
                      {{ order.status }}
                    </el-tag>
                    <span class="total-price">¥{{ order.totalPrice.toFixed(2) }}</span>
                  </div>
                </div>
              </template>

              <div class="order-details">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="订单ID">{{ order.id }}</el-descriptions-item>
                  <el-descriptions-item label="订单金额">
                    <span class="price-highlight">¥{{ order.totalPrice.toFixed(2) }}</span>
                  </el-descriptions-item>
                  <el-descriptions-item label="状态">
                    <el-tag :type="getStatusType(order.status)" size="small">
                      {{ order.status }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="下单时间" span="2">
                    {{ formatDate(order.orderTime) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="地址" span="2">
                    {{ order.address }}
                  </el-descriptions-item>
                </el-descriptions>

                <div class="details-section">
                  <h4>🛒 商品明细</h4>
                  <el-table
                    :data="order.orderDetails"
                    border
                    size="small"
                    style="width: 100%; margin-top: 10px;"
                  >
                    <el-table-column prop="productId" label="商品ID" width="100" align="center" />
                    <el-table-column label="商品名称" min-width="150">
                      <template #default="scope">
                        {{ scope.row.productName }}
                      </template>
                    </el-table-column>
                    <el-table-column label="单价" width="120" align="center">
                      <template #default="scope">¥{{ scope.row.price.toFixed(2) }}</template>
                    </el-table-column>
                    <el-table-column prop="quantity" label="数量" width="100" align="center" />
                    <el-table-column label="小计" width="120" align="center">
                      <template #default="scope">
                        ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>

                <div class="order-actions">
                  <el-button
                    v-if="order.status === '待付款' || order.status === '待支付'"
                    type="success"
                    size="small"
                    @click="payOrder(order.id)"
                  >
                    支付
                  </el-button>
                  <el-button
                    v-if="order.status !== '已取消' && order.status !== '完成'"
                    type="danger"
                    size="small"
                    @click="cancelOrder(order.id)"
                  >
                    取消订单
                  </el-button>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>

        <el-empty v-else description="暂无订单数据" />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.order-management {
  padding: 20px;
  background: #f8f9fb;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .result-count {
      font-size: 14px;
      color: #909399;
      .strong{
        font-size: 18px;
        color: #409eff;
    }
    }
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .total-price {
      color: #e6a23c;
      font-weight: bold;
    }
  }

  .order-actions {
    margin-top: 15px;
    text-align: right;
    button + button {
      margin-left: 10px;
    }
  }

  .price-highlight {
    color: #e6a23c;
    font-weight: bold;
  }
}
</style>
