<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟轮播图数据
const banners = ref([
  { id: 1, image: 'https://picsum.photos/seed/farm1/1200/400', title: '绿色助农 · 共建美好乡村' },
  { id: 2, image: 'https://picsum.photos/seed/farm2/1200/400', title: '科技赋能农业现代化' },
  { id: 3, image: 'https://picsum.photos/seed/farm3/1200/400', title: '优质农品 · 来自田间地头' },
])

// 模拟分类
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

// 当前分类
const activeCategory = ref('全部')

// 购物车数据
const cartCount = ref(0)
const cartItems = ref<Product[]>([])

// 分类筛选
const filteredProducts = computed(() => {
  if (activeCategory.value === '全部') return products.value
  return products.value.filter(p => p.category === activeCategory.value)
})

// 分类点击
const handleCategoryClick = (name: string) => {
  activeCategory.value = name
}

// 加入购物车
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const addToCart = (item: Product) => {
  cartCount.value++
  cartItems.value.push(item)
  ElMessage.success(`已加入购物车：${item.name}`)
}
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
                    v-for="item in filteredProducts"
                    :key="item.id"
                    :xs="12" :sm="8" :md="6" :lg="4"
                    >
                    <el-card shadow="hover" class="product-card">
                        <img :src="item.image" class="product-img" />
                        <div class="info">
                        <p class="name">{{ item.name }}</p>
                        <p class="price">￥{{ item.price }}</p>
                        <el-button type="success" size="small" @click="addToCart(item)">加入购物车</el-button>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<style lang="scss" scoped>
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
        width: 200px;
        height: 200px;
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
          width: 120px;
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
  }
</style>