<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'

// 模拟购物车数据
const cartItems = ref([
  { id: 1, name: '生态大米', price: 56.8, quantity: 1, image: 'https://picsum.photos/seed/rice/120/80' },
  { id: 2, name: '有机苹果', price: 29.9, quantity: 2, image: 'https://picsum.photos/seed/apple/120/80' },
])

// 计算总价
const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

// 修改数量
const changeQuantity = (item: { id: number; name: string; price: number; quantity: number; image: string }, delta: number) => {
  item.quantity = Math.max(1, item.quantity + delta)
}

// 删除商品
const removeItem = (index: number) => {
  ElMessageBox.confirm('确认删除该商品？', '提示', { type: 'warning' })
    .then(() => {
      cartItems.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
}

// 结算
const checkout = () => {
  if (cartItems.value.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }
  ElMessage.success('结算成功，订单已生成')
  cartItems.value = []
}
</script>

<template>
  <div class="cart-page">
    <h2>🛒 我的购物车</h2>
    <el-card v-if="cartItems.length">
      <el-table :data="cartItems" border stripe>
        <el-table-column label="商品图片" width="140">
          <template #default="{ row }">
            <img :src="row.image" class="product-img" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="price" label="单价(¥)" width="120" />
        <el-table-column label="数量" width="160">
          <template #default="{ row }">
            <el-button @click="changeQuantity(row, -1)" size="small">-</el-button>
            <span class="qty">{{ row.quantity }}</span>
            <el-button @click="changeQuantity(row, 1)" size="small">+</el-button>
          </template>
        </el-table-column>
        <el-table-column label="小计(¥)" width="120">
          <template #default="{ row }">{{ (row.price * row.quantity).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ $index }">
            <el-button type="danger" size="small" @click="removeItem($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="summary">
        <span>合计：<b>¥{{ totalPrice.toFixed(2) }}</b></span>
        <el-button type="success" size="large" @click="checkout">去结算</el-button>
      </div>
    </el-card>

    <el-empty v-else description="购物车空空如也，去挑选喜欢的农产品吧～" />
  </div>
</template>

<style scoped>
.cart-page {
  padding: 30px 60px;
}
.product-img {
  width: 100px;
  border-radius: 6px;
}
.summary {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.qty {
  display: inline-block;
  width: 30px;
  text-align: center;
}
</style>
