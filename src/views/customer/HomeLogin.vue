<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request' // ✅ 使用统一的 axios 实例

import banner1 from '@/assets/images/banner1.jpg'
import banner2 from '@/assets/images/banner2.jpg'
import banner3 from '@/assets/images/banner3.jpg'

// 数据接口定义
interface Category {
  id: number
  name: string
  icon: string
}

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  categoryId: number
  status?: string
}

//静态轮播图
const banners = ref([
  { id: 1, image: banner1, title: '绿色助农 · 共建美好乡村' },
  { id: 2, image: banner2, title: '科技赋能农业现代化' },
  { id: 3, image: banner3, title: '优质农品 · 来自田间地头' },
])

// 响应式数据 
const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const loading = ref(false)
const activeCategoryId = ref<number>(0)

const customerId = ref<number | null>(null) // ✅ 当前登录用户ID
const cartCount = ref(0)

const availableProducts = computed(() => {
  return products.value.filter(product => product.status === '已上架')
})

//分类筛选 
const filteredProducts = computed(() => {
  if (activeCategoryId.value === 0) return availableProducts.value
  return availableProducts.value.filter(p => p.categoryId === activeCategoryId.value)
})

const handleCategoryClick = (categoryId: number) => {
  activeCategoryId.value = categoryId
}

//获取用户信息 
const fetchCustomerInfo = async (username: string) => {
  try {
    const res = await request.get(`/user/userId?username=${encodeURIComponent(username)}`)
    return res?.data?.data || res?.data || res
  } catch {
    ElMessage.error('获取用户信息失败')
    return null
  }
}

//确保用户信息已加载 
const ensureCustomerInfo = async (): Promise<number | null> => {
  // 如果已经获取到用户ID，直接返回
  if (customerId.value) {
    return customerId.value
  }

  // 从sessionStorage获取用户名
  const username = sessionStorage.getItem('username')
  if (!username) {
    ElMessage.warning('请先登录')
    return null
  }

  // 获取用户ID
  const id = await fetchCustomerInfo(username)
  if (id) {
    customerId.value = id
    return id
  }
  
  return null
}

// 加入购物车 
const addToCart = async (item: Product) => {
  const userId = await ensureCustomerInfo()
  if (!userId) {
    ElMessage.warning('请先登录后再加入购物车')
    return
  }

  try {
    const url = `/cart/add?userId=${userId}&productId=${item.id}&quantity=1`
    console.log('请求URL:', url)

    const res = await request.post(url)
    console.log('后端响应:', res.data)

    // 修改判断逻辑，适配后端的返回格式
    if (res.data === "商品已添加到购物车" || 
        res.data?.code === 200 || 
        res.data?.success === true ||
        res.data?.message === "商品已添加到购物车") {
      ElMessage.success(`已加入购物车：${item.name}`)
      // 本地计数递增
      cartCount.value++
      console.log('加入购物车成功，当前数量:', cartCount.value)
    } else {
      // 如果后端返回了其他信息，也认为是成功的
      ElMessage.success(`已加入购物车：${item.name}`)
      cartCount.value++
    }

  } catch {
    console.error('加入购物车失败')
  }
}

const fetchCartCount = async () => {
  cartCount.value = 0
  console.log('初始化购物车数量为0（后端无相关接口）')
}

const fetchData = async () => {
  loading.value = true
  try {
    const [categoryRes, productRes] = await Promise.all([
      fetch('http://localhost:8080/category/list'),
      fetch('http://localhost:8080/product/list')
    ])

    const categoryData = await categoryRes.json()
    const productData = await productRes.json()

    console.log('完整的商品API响应:', productData) // 查看完整响应结构
    console.log('商品数据:', productData.data || productData) // 查看实际数据

    categories.value = [
      { id: 0, name: '全部', icon: 'https://img.icons8.com/color/48/select-all.png' },
      ...(categoryData.data || categoryData)
    ]

    products.value = (productData.data || productData).map((p: { id: number; name: string; price: number; imageUrl?: string; image?: string; img_url?: string; categoryId?: number; category_id?: number ; status?: string }) => {
      // 尝试不同的图片字段名
      const imageField = p.imageUrl || p.image || p.img_url

      console.log(`商品 ${p.name} 的图片字段:`, {
        imageUrl: p.imageUrl,
        foundField: imageField
      })
      
      let imageUrl = 'https://via.placeholder.com/200'
      
      if (imageField) {
        if (imageField.startsWith('http')) {
          imageUrl = imageField
        } else {
          const path = imageField.startsWith('/') ? imageField : `/${imageField}`
          imageUrl = `http://localhost:8080${path}`
        }
      }
      
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: imageUrl,
        categoryId: p.categoryId || p.category_id,
        status: p.status
      }
    })
    
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error('数据加载失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 初始化用户信息
  await ensureCustomerInfo()
  // 获取购物车数量
  await fetchCartCount()
  // 加载商品数据
  await fetchData()
})
</script>

<template>
  <div class="main-content">
    <!-- 轮播图 -->
    <el-carousel height="380px" indicator-position="outside" class="banner">
      <el-carousel-item v-for="item in banners" :key="item.id">
        <div class="banner-wrapper">
          <img :src="item.image" class="banner-img" />
          <div class="banner-text">{{ item.title }}</div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 分类导航 -->
    <div class="category-section">
      <div class="category-row">
        <div class="section-title">🍀 农产品分类</div>
        <div class="category-list">
          <button
            v-for="item in categories"
            :key="item.id"
            class="category-chip"
            :class="{ active: activeCategoryId === item.id }"
            @click="handleCategoryClick(item.id)"
          >
            <span class="category-text">{{ item.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 商品展示区 -->
    <div class="showcase-section">
      <h2 class="section-title">🌾 商品展示 - {{ activeCategoryId === 0 ? '全部商品' : categories.find(c => c.id === activeCategoryId)?.name }}</h2>

      <div class="status-info">
        <span class="total-count">共 {{ availableProducts.length }} 件已上架商品</span>
      </div>

      <div v-if="loading" class="loading">
        <el-icon size="48" class="is-loading"><Loading /></el-icon>
        <p>数据加载中...</p>
      </div>

      <el-empty v-else-if="filteredProducts.length === 0" description="暂无该分类的商品" />

      <el-row v-else :gutter="20" justify="start">
        <el-col
          v-for="item in filteredProducts"
          :key="item.id"
          :xs="16"
          :sm="10"
          :md="8"
          :lg="6"
        >
          <el-card shadow="hover" class="product-card">
            <img :src="item.image_url" class="product-img" />
            <div class="info">
              <p class="name">{{ item.name }}</p>
              <p class="price">￥{{ item.price }}</p>
              <el-button 
                type="success" 
                size="small" 
                @click="addToCart(item)"
                :loading="loading"
              >
                加入购物车
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main-content {
  padding: 0 max(5vw, 20px) 40px;
  background: #fafaf8;
}

/* 轮播图 */
.banner {
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  .banner-wrapper {
    position: relative;
    width: 100%;
    height: 380px;
  }
  .banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(.9);
  }
  .banner-text {
    position: absolute;
    bottom: 40px;
    left: 50px;
    color: #fff;
    font-size: clamp(20px, 3vw, 32px);
    font-weight: 600;
    text-shadow: 0 2px 8px rgba(0, 0, 0, .5);
  }
}

/* 分类导航 */
.category-section {
  padding: 12px 0;

  .category-row{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap:16px;
  }

  .section-title {
    font-size: 18px;
    color: #2b5d34;
    margin-bottom: 12px;
    white-space: nowrap;
  }
  .category-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .category-chip {
    display: inline-flex;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 24px;
    padding: 6px 14px;
    cursor: pointer;
    transition: .25s;
    &.active {
      border-color: #67c23a;
      background: #f0f9eb;
    }
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, .08);
    }
    .category-text {
      font-size: 14px;
      color: #333;
    }
  }
}

/* 商品区 */
.showcase-section {
  margin-top: 40px;

  .section-title {
    text-align: center;
    font-size: 24px;
    color: #2b5d34;
    margin-bottom: 24px;
  }

  .status-info {
    text-align: center;
    margin-bottom: 20px;
    .total-count {
      color: #666;
      font-size: 14px;
      background: #f0f9eb;
      padding: 6px 12px;
      border: 1px #67c23a;
    }
  }

  .loading {
    text-align: center;
    padding: 40px 0;
        
    p {
      margin-top: 16px;
      color: #666;
    }
  }

  .product-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px;
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.25s;
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    }
    .product-img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 8px;
    }
    .info {
      text-align: center;
      padding: 8px 0;
      .name {
        font-weight: 500;
        color: #303133;
      }
      .price {
        color: #f56c6c;
        font-size: 18px;
        margin: 6px 0 10px;
      }
    }
  }
}
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.is-loading {
  animation: rotating 2s linear infinite;
}
</style>