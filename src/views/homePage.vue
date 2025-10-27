<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')

// 模拟轮播图数据
const banners = ref([
  { id: 1, image: 'https://picsum.photos/seed/farm1/1200/400', title: '绿色助农 · 共建美好乡村' },
  { id: 2, image: 'https://picsum.photos/seed/farm2/1200/400', title: '科技赋能农业现代化' },
  { id: 3, image: 'https://picsum.photos/seed/farm3/1200/400', title: '优质农品 · 来自田间地头' },
])

// 模拟分类数据
const categories = ref([
  { id: 0, name: '全部', icon: 'https://img.icons8.com/color/48/select-all.png' },
  { id: 1, name: '粮油副食', icon: 'https://img.icons8.com/color/48/wheat.png' },
  { id: 2, name: '新鲜果蔬', icon: 'https://img.icons8.com/color/48/apple.png' },
  { id: 3, name: '农用工具', icon: 'https://img.icons8.com/color/48/shovel.png' },
  { id: 4, name: '畜牧产品', icon: 'https://img.icons8.com/color/48/cow.png' },
  { id: 5, name: '手工特产', icon: 'https://img.icons8.com/color/48/handmade.png' },
])

// 模拟商品数据
const products = ref([
  { id: 1, name: '生态大米', price: 56.8, image: 'https://picsum.photos/seed/rice/280/200', category: '粮油副食' },
  { id: 2, name: '有机苹果', price: 29.9, image: 'https://picsum.photos/seed/apple/280/200', category: '新鲜果蔬' },
  { id: 3, name: '绿色蔬菜', price: 8.5, image: 'https://picsum.photos/seed/veg/280/200', category: '新鲜果蔬' },
  { id: 4, name: '纯天然蜂蜜', price: 69.0, image: 'https://picsum.photos/seed/honey/280/200', category: '手工特产' },
  { id: 5, name: '优质玉米', price: 18.5, image: 'https://picsum.photos/seed/corn/280/200', category: '粮油副食' },
  { id: 6, name: '农用铁锹', price: 89.9, image: 'https://picsum.photos/seed/shovel/280/200', category: '农用工具' },
  { id: 7, name: '牧场牛奶', price: 12.8, image: 'https://picsum.photos/seed/milk/280/200', category: '畜牧产品' },
])

// 当前选中的分类
const activeCategory = ref('全部')

// 根据选中的分类动态过滤商品
const filteredProducts = computed(() => {
  if (activeCategory.value === '全部') {
    return products.value
  } else {
    return products.value.filter(p => p.category === activeCategory.value)
  }
})

// 分类点击事件
function handleCategoryClick(name: string) {
  activeCategory.value = name
}

// 搜索功能
function handleSearch() {
  if (!search.value.trim()) return
  router.push({ name: 'Search', query: { q: search.value } }).catch(() => {})
}
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

        <el-menu class="nav-menu" mode="horizontal" background-color="transparent">
          <el-menu-item index="1">商品</el-menu-item>
          <el-menu-item index="2">资讯</el-menu-item>
          <el-menu-item index="3">公告</el-menu-item>
        </el-menu>

        <div class="header-right">
          <el-input
            v-model="search"
            placeholder="搜索 农产品 / 服务 / 产地"
            clearable
            class="search-input"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
          <el-button type="text" @click="$router.push({ name: 'Login' })">登录</el-button>
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
                    v-for="(item, index) in categories"
                    :key="index"
                    class="category-chip"
                    :class="{ active: activeCategory === item.name }"
                    @click="handleCategoryClick(item.name)"
                    :title="item.name"
                >
                    <img :src="item.icon" alt="" class="category-icon" />
                    <span class="category-text">{{ item.name }}</span>
                </button>
                </div>
            </div>
        </div>

        <!-- 商品展示区 -->
        <div class="showcase-section">
          <h2 class="section-title">🌾 展示区 - {{ activeCategory }}</h2>
          <el-row :gutter="24" justify="display-grid">
            <el-col
              v-for="(item, index) in filteredProducts"
              :key="index"
              :xs="12" :sm="8" :md="6" :lg="4"
            >
              <el-card shadow="hover" class="product-card">
                <img :src="item.image" class="product-img" />
                <div class="info">
                  <p class="name">{{ item.name }}</p>
                  <p class="price">￥{{ item.price }}</p>
                  <el-button type="success" size="small">立即购买</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
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

    .nav-menu {
      flex: 1;
      display: flex;
      justify-content: center;
      border-bottom: none;

      .el-menu-item {
        font-size: 16px;
        font-weight: 500;
        color: #555;
        &:hover {
          color: #409eff;
        }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 15px;

      .search-input {
        width: 350px;
      }
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

        .category-icon {
          width: 28px;
          height: 28px;

        }

        .category-text {
          font-size: 14px;
          color: #333;
        }
      }

      .category-card.active {
        border: 2px solid #67c23a;
        background-color: #f0f9eb;
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

      .product-card {
        text-align: center;
        border-radius: 10px;
        overflow: hidden;

        .product-img {
          width: 100%;
          height: 180px;
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
</style>
