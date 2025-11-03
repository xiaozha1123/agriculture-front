<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import request from '@/utils/request'

interface CartItem {
  cartId: number
  productId: number
  productName: string
  price: number
  quantity: number
  image: string
  selected: boolean
}
interface CartResponseItem {
  cartId: number
  productId: number
  productName: string
  price: number
  quantity: number
  imageUrl?: string
  image?: string
  selected?: boolean
}

const cartItems = ref<CartItem[]>([])
const loading = ref(false)
const customerId = ref<number | null>(null)
const errorInfo = ref<string>('')

// 计算已勾选商品的总价
const totalPrice = computed(() =>
  cartItems.value
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
)

// 已选商品数量
const selectedCount = computed(() => 
  cartItems.value.filter(item => item.selected).length
)

// 是否全选
const selectAll = computed({
  get: () => cartItems.value.length > 0 && cartItems.value.every(item => item.selected),
  set: (value: boolean) => {
    cartItems.value.forEach(item => item.selected = value)
  }
})

// 获取用户信息
const fetchCustomerInfo = async (username: string) => {
  try {
    const res = await request.get(`/user/userId?username=${encodeURIComponent(username)}`)
    return res?.data?.data || res?.data || res
  } catch {
    ElMessage.error('获取用户信息失败')
    return null
  }
}

// 加载购物车
const fetchCart = async () => {
  if (!customerId.value) return
  loading.value = true
  errorInfo.value = ''

  try {
    const res = await request.get(`/cart/list/${customerId.value}`)
    const data = res?.data ?? res

    if (data?.success && Array.isArray(data.cartItems)) {
      cartItems.value = data.cartItems.map((item: CartResponseItem) => ({
        cartId: item.cartId ,
        productId: item.productId,
        productName: item.productName || '未知商品',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.imageUrl || item.image || 'https://via.placeholder.com/120',
        selected: item.selected ?? true
      }))
    } else {
      cartItems.value = []
    }
  } catch (err) {
    console.error('加载购物车失败:', err)
    errorInfo.value = '加载购物车失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

//修改数量 - 使用 URLSearchParams 适配后端 @RequestParam
const changeQuantity = async (item: CartItem, delta: number) => {
  const newQty = Math.max(1, item.quantity + delta)
  const oldQty = item.quantity
  item.quantity = newQty
  
  try {
    const params = new URLSearchParams({
      userId: customerId.value?.toString() || '',
      productId: item.productId.toString(),
      quantity: newQty.toString()
    })
    
    await request.post('/cart/update', params)
    ElMessage.success('数量已更新')
  } catch {
    item.quantity = oldQty
    console.error('数量更新失败')
    ElMessage.error('数量更新失败')
  }
}

const removeItem = async (index: number, productId: number) => {
  try {
    await ElMessageBox.confirm('确认删除该商品？', '提示', { type: 'warning' })
    
    const params = new URLSearchParams({
      userId: customerId.value?.toString() || '',
      productId: productId.toString()
    })
    
    const res = await request.post('/cart/delete', params)
    const responseData = res?.data ?? res
    
    //通用成功判断逻辑
    const isSuccess = (
      responseData?.success === true || 
      responseData?.code === 200 ||
      responseData?.message?.includes('成功') ||
      (typeof responseData === 'string' && responseData.includes('成功'))
    )
    
    if (isSuccess) {
      cartItems.value.splice(index, 1)
      ElMessage.success('删除成功')
    } 
  } catch {
    
  }
}

const checkout = async () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择要结算的商品')
    return
  }

  try {
    const selectedItems = cartItems.value.filter(i => i.selected)
    const payload = {
      customerId: customerId.value,
      cartIds: selectedItems.map(i => i.cartId)
    }

    console.log('发送结算请求:', payload)

    const res = await request.post('/cart/checkout', payload)
    console.log('完整响应:', res)
    console.log('响应数据:', res.data)
    console.log('响应状态:', res.status)

    // 调试：打印所有可能的成功标志
    console.log('res.data?.code:', res.data?.code)
    console.log('res.data?.success:', res.data?.success)
    console.log('res.data?.message:', res.data?.message)
    console.log('res.status:', res.status)

    // 更全面的成功判断逻辑
    const isSuccess = (
      res.data?.code === 200 ||
      res.data?.success === true ||
      res.status === 200 ||
      res.data?.message?.includes('成功') ||
      res.data?.message?.includes('下单') ||
      // 如果后端返回了订单相关的数据，也认为是成功
      res.data?.totalPrice !== undefined ||
      res.data?.itemCount !== undefined
    )

    console.log('判断结果 isSuccess:', isSuccess)

    if (isSuccess) {
      // 修复类型问题：明确声明变量类型
      const responseTotalPrice: number = res.data?.totalPrice || totalPrice.value
      const responseItemCount: number = res.data?.itemCount || selectedCount.value
      
      ElMessage.success(`下单成功！共 ${responseItemCount} 件商品，总价 ¥${responseTotalPrice.toFixed(2)}`)
      
      // 移除已结算商品
      cartItems.value = cartItems.value.filter(item => !item.selected)
      
      console.log('下单成功，已清空选中商品')
    } else {
      // 如果后端有明确的失败信息，显示后端的信息
      if (res.data?.message) {
        ElMessage.error(res.data.message)
      } else {
        // 否则显示通用失败信息
        ElMessage.error('下单失败，请稍后重试')
      }
    }
  } catch  {
    console.error('结算失败')
    ElMessage.error('结算失败，请稍后重试')
  }
}

// 处理图片加载失败
const handleImageError = (item: CartItem) => {
  item.image = 'https://via.placeholder.com/120'
}

onMounted(async () => {
  const username = sessionStorage.getItem('username')
  if (username) {
    const id = await fetchCustomerInfo(username)
    if (id) {
      customerId.value = id
      await fetchCart()
    }
  }
})
</script>

<template>
  <div class="cart-container">
    <el-card class="cart-card" v-loading="loading">
      <!-- 标题放在 card header 中 -->
      <template #header>
        <div class="card-header">
          <div class="title-wrapper">
            <h2>🛒 我的购物车</h2>
          </div>
          <div class="item-count" v-if="cartItems.length">
            共 <strong>{{ cartItems.length }}</strong> 件商品
          </div>
        </div>
      </template>

      <!-- 错误提示 -->
      <el-alert 
        v-if="errorInfo" 
        :title="errorInfo" 
        type="warning" 
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      />

      <!-- 商品列表 -->
      <div v-if="cartItems.length" class="product-list">
        <div v-for="(item, index) in cartItems" :key="item.cartId" class="product-item">
          <!-- 选择框 -->
          <div class="item-checkbox">
            <el-checkbox v-model="item.selected" />
          </div>

          <!-- 商品图片 -->
          <div class="item-image">
            <img :src="item.image" :alt="item.productName" @error="handleImageError(item)" />
          </div>

          <!-- 商品信息 -->
          <div class="item-info">
            <h3 class="product-name">{{ item.productName }}</h3>
            <p class="product-price">¥{{ item.price.toFixed(2) }}</p>
          </div>

          <!-- 数量控制 -->
          <div class="item-quantity">
            <el-button 
              circle 
              size="small" 
              @click="changeQuantity(item, -1)"
              :disabled="item.quantity <= 1"
            >-</el-button>
            <span class="quantity-display">{{ item.quantity }}</span>
            <el-button 
              circle 
              size="small" 
              @click="changeQuantity(item, 1)"
            >+</el-button>
          </div>

          <!-- 小计 -->
          <div class="item-subtotal">
            ¥{{ (item.price * item.quantity).toFixed(2) }}
          </div>

          <!-- 删除按钮 -->
          <div class="item-action">
            <el-button 
              type="danger" 
              size="small" 
              :icon="Delete"
              @click="removeItem(index, item.productId)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 空购物车 -->
      <div v-else class="empty-cart">
        <el-empty 
          description="购物车空空如也，去挑选喜欢的农产品吧～" 
          :image-size="200"
        >
          <el-button type="primary" @click="$router.push('/customer')">
            去购物
          </el-button>
        </el-empty>
      </div>

      <!-- 底部结算栏 -->
      <div class="checkout-bar" v-if="cartItems.length">
        <div class="selection-info">
          <el-checkbox v-model="selectAll">
            全选
          </el-checkbox>
          <span class="selected-count">
            已选 <strong>{{ selectedCount }}</strong> 件
          </span>
        </div>
        
        <div class="total-info">
          <span class="total-label">合计：</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>

        <el-button 
          type="success" 
          size="large" 
          :disabled="selectedCount === 0"
          @click="checkout"
        >
          去结算 ({{ selectedCount }})
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.cart-container {
  padding: 10px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 80vh;

  .cart-card {
    border-radius: 8px;
    overflow: hidden;
    gap:12px;

    :deep(.el-card__header) {
      padding: 20px 24px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;

        .cart-icon {
          font-size: 28px;
          color: #409eff;
        }

        h2 {
          margin: 0;
          color: #2c3e50;
          font-size: 24px;
          font-weight: 600;
        }
      }

      .item-count {
        font-size: 14px;
        color: #909399;

        strong {
          color: #409eff;
          font-size: 18px;
        }
      }
    }

    .product-list {
      margin: -20px -24px 0;

      .product-item {
        display: grid;
        grid-template-columns: 60px 120px 1fr 140px 140px 120px 100px;
        gap: 16px;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e4e7ed;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f5f7fa;
        }

        .item-checkbox {
          justify-self: center;
        }

        .item-image img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e4e7ed;
        }

        .item-info {
          .product-name {
            margin: 0 0 8px 0;
            font-size: 16px;
            color: #2c3e50;
            font-weight: 500;
          }

          .product-price {
            margin: 0;
            font-size: 18px;
            color: #f56c6c;
            font-weight: bold;
          }
        }

        .item-quantity {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;

          .quantity-display {
            min-width: 40px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
          }

          .el-button {
            width: 32px;
            height: 32px;
          }
        }

        .item-subtotal {
          font-size: 18px;
          color: #f56c6c;
          font-weight: bold;
          text-align: center;
        }

        .item-action {
          text-align: center;
        }
      }
    }

    .empty-cart {
      padding: 60px 0;
    }

    .checkout-bar {
      position: sticky;
      bottom: 0;
      margin: 20px -24px -24px;
      padding: 20px 24px;
      background: #fff;
      border-top: 1px solid #e4e7ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

      .selection-info {
        display: flex;
        align-items: center;
        gap: 20px;

        .selected-count strong {
          color: #409eff;
          font-size: 16px;
        }
      }

      .total-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .total-price {
          font-size: 24px;
          color: #f56c6c;
          font-weight: bold;
        }
      }

      .el-button {
        min-width: 140px;
        height: 44px;
        font-size: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .cart-container .cart-card .product-item {
    grid-template-columns: 40px 80px 1fr 100px;
    grid-template-rows: auto auto;
    gap: 12px;
    padding: 16px;

    .item-quantity {
      grid-column: 3 / 4;
      grid-row: 2;
      justify-self: start;
    }

    .item-subtotal {
      grid-column: 4;
      grid-row: 1 / 3;
      align-self: center;
    }

    .item-action {
      grid-column: 4;
      grid-row: 2;
      align-self: end;
    }
  }

  .checkout-bar {
    flex-wrap: wrap;
    gap: 12px;

    .total-info {
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>