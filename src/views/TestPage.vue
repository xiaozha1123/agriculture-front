<!-- eslint-disable vue/no-deprecated-v-on-native-modifier -->
// ...existing code...
<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const keyword = ref('')

const features = [
  { id: 1, title: '技术支持', desc: '种植/病虫害诊断与解决方案', icon: '🧑‍🌾' },
  { id: 2, title: '订单对接', desc: '产销对接与物流支持', icon: '📦' },
  { id: 3, title: '金融服务', desc: '小额贷款与保险咨询', icon: '🏦' },
  { id: 4, title: '培训与政策', desc: '在线培训、补贴政策解读', icon: '📚' },
]

const marketItems = [
  { id: 1, title: '有机大米 5kg', price: '¥120', img: '' },
  { id: 2, title: '新鲜蔬菜箱', price: '¥68', img: '' },
  { id: 3, title: '土鸡蛋 30枚', price: '¥45', img: '' },
  { id: 4, title: '蜂蜜 500g', price: '¥80', img: '' },
]

const news = [
  { id: 1, title: '春季病虫害预防要点', date: '2025-03-12' },
  { id: 2, title: '农机补贴政策更新解读', date: '2025-02-28' },
  { id: 3, title: '新品种试种成功案例', date: '2025-01-10' },
]

function handleSearch() {
  if (!keyword.value.trim()) return
  // 示例：跳转到搜索结果页，实际路由按项目调整
  router.push({ name: 'Search', query: { q: keyword.value } }).catch(()=>{})
}

function openService(id: number) {
  // 示例跳转或打开弹窗
  console.log('打开服务', id)
  // router.push({ name: 'Service', params: { id } })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function viewProduct(item: any) {
  console.log('查看商品', item)
  // router.push({ name: 'Product', params: { id: item.id } })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function viewNews(item: any) {
  console.log('查看资讯', item)
  // router.push({ name: 'NewsDetail', params: { id: item.id } })
}
</script>

<template>
  <div class="home">
    <el-container>
      <el-header class="site-header">
        <div class="header-inner">
          <div class="logo">助农服务平台</div>
          <div class="header-actions">
            <el-input
              v-model="keyword"
              placeholder="输入作物 / 服务关键词搜索"
              clearable
              @keyup="handleSearch"
              class="search-input"
            >
              <template #append>
                <el-button type="primary" @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
            <el-button type="text" @click="$router.push({ name: 'Login' })">登录</el-button>
          </div>
        </div>
      </el-header>

      <el-main>
        <!-- Hero -->
        <section class="hero">
          <div class="hero-left">
            <h1>为乡村振兴赋能 — 智能、可靠的助农服务</h1>
            <p>一站式技术指导、订单对接、金融支持与培训，帮助农户提升产量与收益。</p>
            <div class="hero-actions">
              <el-button type="primary" @click="$router.push({ name: 'Services' })">了解服务</el-button>
              <el-button @click="$router.push({ name: 'Market' })">进入集市</el-button>
            </div>
          </div>
          <div class="hero-right">
            <el-card class="hero-card">
              <div class="card-title">快速发布供求</div>
              <el-input placeholder="填写产品/求购信息"></el-input>
              <div class="card-actions">
                <el-button type="primary">发布供给</el-button>
                <el-button>发布求购</el-button>
              </div>
            </el-card>
          </div>
        </section>

        <!-- Features -->
        <section class="features">
          <el-row :gutter="20">
            <el-col :span="6" v-for="f in features" :key="f.id">
              <el-card shadow="hover" class="feature-card" @click="openService(f.id)">
                <div class="feature-icon">{{ f.icon }}</div>
                <div class="feature-title">{{ f.title }}</div>
                <div class="feature-desc">{{ f.desc }}</div>
              </el-card>
            </el-col>
          </el-row>
        </section>

        <!-- Market -->
        <section class="market">
          <h3>乡村集市推荐</h3>
          <el-row :gutter="20">
            <el-col :span="6" v-for="item in marketItems" :key="item.id">
              <el-card class="product-card" shadow="always" @click="viewProduct(item)">
                <div class="img-placeholder">图片</div>
                <div class="product-title">{{ item.title }}</div>
                <div class="product-meta">
                  <span class="price">{{ item.price }}</span>
                  <el-button type="text" size="small">查看</el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </section>

        <!-- News -->
        <section class="news">
          <h3>最新资讯</h3>
          <el-timeline>
            <el-timeline-item v-for="n in news" :key="n.id" :timestamp="n.date">
              <a class="news-link" @click.prevent="viewNews(n)">{{ n.title }}</a>
            </el-timeline-item>
          </el-timeline>
        </section>
      </el-main>

      <el-footer class="site-footer">
        <div>© 2025 助农服务平台 · 联系电话：400-000-000</div>
      </el-footer>
    </el-container>
  </div>
</template>

<style lang="scss" scoped>
.home {
  .site-header {
    background: #fff;
    border-bottom: 1px solid #ebeef5;
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      .logo {
        font-weight: 700;
        font-size: 18px;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        .search-input {
          width: 420px;
        }
      }
    }
  }

  .hero {
    display: flex;
    gap: 20px;
    margin: 24px 0;
    .hero-left {
      flex: 1;
      background: linear-gradient(90deg, #f7fbef, #ffffff);
      padding: 30px;
      border-radius: 6px;
      h1 { margin: 0 0 10px; }
      p { color: #666; margin-bottom: 16px; }
      .hero-actions { display:flex; gap: 10px; }
    }
    .hero-right {
      width: 320px;
      .hero-card {
        padding: 16px;
        .card-title { font-weight: 600; margin-bottom: 10px; }
        .card-actions { display:flex; gap:8px; margin-top:10px; }
      }
    }
  }

  .features { margin-bottom: 24px;
    .feature-card {
      text-align: center;
      .feature-icon { font-size: 28px; margin-bottom: 8px; }
      .feature-title { font-weight: 600; }
      .feature-desc { color: #888; font-size: 12px; margin-top: 6px; }
      cursor: pointer;
    }
  }

  .market { margin-bottom: 24px;
    h3 { margin-bottom: 12px; }
    .product-card {
      cursor: pointer;
      .img-placeholder {
        height: 120px;
        background: #f5f7fa;
        display:flex;
        align-items:center;
        justify-content:center;
        color:#999;
        margin-bottom: 10px;
      }
      .product-title { font-weight: 600; margin-bottom: 6px; }
      .product-meta { display:flex; justify-content:space-between; align-items:center; }
      .price { color:#f56c6c; font-weight:700; }
    }
  }

  .news { margin-bottom: 24px;
    h3 { margin-bottom: 12px; }
    .news-link { color: #409eff; cursor: pointer; }
  }

  .site-footer {
    text-align: center;
    padding: 12px 0;
    color: #999;
    border-top: 1px solid #ebeef5;
  }
}

/* 响应式 */
@media (max-width: 900px) {
  .home .hero { flex-direction: column; }
  .home .header-inner .search-input { width: 220px; }
}
</style>
// ...existing code...