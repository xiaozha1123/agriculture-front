<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import banner1 from '@/assets/images/banner1.jpg'
import banner2 from '@/assets/images/banner2.jpg'
import banner3 from '@/assets/images/banner3.jpg'

const router = useRouter()
const search = ref('')

// ======================== 数据接口定义 ========================
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

interface Announcement {
  id: number
  title: string
  content: string
  createTime: string
  publisherId: number 
  status: string
}

// ======================== 静态轮播图 ========================
const banners = ref([
  { id: 1, image: banner1, title: '绿色助农 · 共建美好乡村' },
  { id: 2, image: banner2, title: '科技赋能农业现代化' },
  { id: 3, image: banner3, title: '优质农品 · 来自田间地头' },
])

//响应式数据
const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const announcements = ref<Announcement[]>([])
const loading = ref(false)
const activeCategoryId = ref<number>(0)

const availableProducts = computed(() => {
  return products.value.filter(product => product.status === '已上架')
})

//分类筛选 
const filteredProducts = computed(() => {
  if (activeCategoryId.value === 0) return availableProducts.value
  return availableProducts.value.filter(p => p.categoryId === activeCategoryId.value)
})


// ======================== 已发布的公告 ========================
const publishedAnnouncements = computed(() => {
  return announcements.value.filter(announcement => announcement.status === '已发布')
})

const handleCategoryClick = (categoryId: number) => {
  activeCategoryId.value = categoryId
}

// ======================== 获取商品和分类数据 ========================
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

    products.value = (productData.data || productData).map((p: { id: number; name: string; price: number; imageUrl?: string; image?: string; img_url?: string; categoryId?: number; category_id?: number; status?: string }) => {
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

// ======================== 获取公告数据 ========================
const fetchAnnouncements = async () => {
  try {
    const response = await fetch('http://localhost:8080/announcement/list')
    if (!response.ok) {
      throw new Error('获取公告失败')
    }
    const result = await response.json()
    // 获取所有公告，前端进行状态过滤
    announcements.value = result.data || result || []
  } catch (error) {
    console.error('获取公告失败:', error)
    announcements.value = []
  }
}

// ======================== 搜索功能 ========================
function handleSearch() {
  if (!search.value.trim()) return
  router.push({ name: 'Search', query: { q: search.value } }).catch(() => {})
}

// ======================== 页面跳转 ========================
const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

// ======================== 格式化日期 ========================
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// ======================== 页面加载 ========================
onMounted(async () => {
  await fetchData()
  await fetchAnnouncements()
})
</script>

<template>
  <div class="layout">
    <el-container>

      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <img src="https://img.icons8.com/color/48/tractor.png" alt="logo" class="logo-icon" />
          <div class="logo-name">助农服务平台</div>
        </div>

        <div class="header-center">
          <el-input
            v-model="search"
            placeholder="搜索 农产品 / 服务 / 产地"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>

        <div class="header-right">
          <el-button type="text" @click="goToLogin" plain>登录</el-button>
          <el-button type="text" @click="goToRegister" plain>注册</el-button>
        </div>
      </el-header>

      <!-- 主体内容 -->
      <el-main class="main-content">

        <!-- 轮播图 -->
        <el-carousel height="380px" indicator-position="outside" class="banner">
          <el-carousel-item v-for="(item, index) in banners" :key="index">
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
                :title="item.name"
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

          <el-row v-else :gutter="24" justify="start">
            <el-col
              v-for="item in filteredProducts"
              :key="item.id"
              :xs="12" :sm="8" :md="6" :lg="4"
            >
              <el-card shadow="hover" class="product-card">
                <img :src="item.image_url" class="product-img" />
                <div class="info">
                  <p class="name">{{ item.name }}</p>
                  <p class="price">￥{{ item.price }}</p>
                  <el-button type="success" size="small">立即购买</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 公告展示区 -->
        <div class="announcement-section">
          <h2 class="section-title">平台公告</h2>
          <el-card class="announcement-card">
            <div v-if="publishedAnnouncements.length === 0" class="empty-announcement">
              <p>暂无公告</p>
            </div>
            <div v-else class="announcement-list">
              <div 
                v-for="announcement in publishedAnnouncements" 
                :key="announcement.id"
                class="announcement-item"
              >
                <div class="announcement-header">
                  <h3 class="announcement-title">{{ announcement.title }}</h3>
                  <span class="announcement-time">{{ formatDate(announcement.createTime) }}</span>
                </div>
                <p class="announcement-content">{{ announcement.content }}</p>
                <div class="announcement-footer">
                  <span class="announcement-publisher">发布者：{{ announcement.publisherId }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

      </el-main>

      <!-- 页脚 -->
      <el-footer class="footer">
        <p>© 2025 助农服务平台 | 助力乡村振兴 | All Rights Reserved.</p>
      </el-footer>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  background-color: #f8f8f8;

  .el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    height: 70px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;

      .logo-icon {
        width: 40px;
        height: 40px;
      }

      .logo-name {
        font-size: 20px;
        font-weight: 600;
        color: #2c3e50;
      }
    }

    .header-center {
      flex: 1;
      display: flex;
      justify-content: center;
      
      .search-input {
        width: 400px;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;
    }
  }

  .main-content {
    padding: 0 40px 40px;

    .banner {
      margin: 20px 0;
      border-radius: 10px;
      overflow: hidden;

      .banner-wrapper {
        position: relative;
      }

      .banner-img {
        width: 100%;
        height: 380px;
        object-fit: cover;
        filter: brightness(85%);
      }

      .banner-text {
        position: absolute;
        bottom: 20px;
        left: 40px;
        color: white;
        font-size: 24px;
        text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
      }
    }

    /* 分类区样式 */
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
        margin-bottom: 10px;
        white-space: nowrap;
      }

      .category-list {
        display: flex;
        gap: 10px;
        align-items: center;
        overflow-x:auto;
        padding: 6px 10px;
        scrollbar-width: none;
      }

      .category-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #fff;
        border:1px solid #ebeef5;
        border-radius: 20px;
        padding: 6px 10px;
        cursor: pointer;
        transition: all 0.18s;
        min-width: 80px;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        &.active {
          border-color: #67c23a;
          background-color: #f0f9eb;
        }
        .category-text {
          flex-grow: 1;
          font-size: 14px;
          color: #333;
        }
      }
    }

    /* 商品区样式 */
    .showcase-section {
      margin-top: 40px;

      .section-title {
        text-align: center;
        font-size: 24px;
        color: #2b5d34;
        margin-bottom: 30px;
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
        text-align: center;
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 20px;

        .product-img {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .info {
          padding: 10px 0;

          .name {
            font-weight: 500;
            color: #333;
            margin: 5px 0;
          }

          .price {
            color: #e67e22;
            font-weight: bold;
            margin: 5px 0 10px;
          }
        }
      }
    }

    /* 公告区样式 */
    .announcement-section {
      margin-top: 50px;

      .section-title {
        text-align: center;
        font-size: 24px;
        color: #2b5d34;
        margin-bottom: 20px;
      }

      .announcement-card {
        border-radius: 10px;
        padding: 20px;
      }

      .empty-announcement {
        text-align: center;
        padding: 40px 0;
        color: #999;
      }

      .announcement-list {
        .announcement-item {
          padding: 16px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .announcement-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .announcement-title {
              font-size: 16px;
              font-weight: 600;
              color: #333;
              margin: 0;
            }

            .announcement-time {
              font-size: 12px;
              color: #999;
            }
          }

          .announcement-content {
            color: #666;
            line-height: 1.6;
            margin-bottom: 8px;
          }

          .announcement-footer {
            text-align: right;

            .announcement-publisher {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }
  }

  .el-footer {
    background-color: #f5f5f5;
    text-align: center;
    padding: 15px 0;
    font-size: 14px;
    color: #777;
    border-top: 1px solid #eaeaea;
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