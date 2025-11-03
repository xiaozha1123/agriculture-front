<script lang="ts" setup>
import { ref} from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const isCollapse = ref(false);
const goHome = () => {
    router.push('/customer');
}

// 假设当前登录用户信息
const user = ref({
  username: '张三',
  avatar: 'https://picsum.photos/seed/avatar/50/50'
})

// 搜索关键词
const search = ref('')


// 购物车数据
const cartCount = ref(0)


// 搜索
const handleSearch = () => {
  if (!search.value.trim()) return
  router.push({ name: 'Search', query: { q: search.value } })
}

// 跳转函数
const goToCart = () => router.push('/customer/cart')
// const goToOrders = () => router.push('/customer/orders')
const goToProfile = () => router.push('/customer/profile')
const logout = () => {
  ElMessage.success('退出成功')
  router.push({ name: 'Login' })
}
</script>

<template>
  <div class="layout">
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <img src="https://img.icons8.com/color/48/tractor.png" alt="logo" class="logo-icon" />
          <div class="logo-name" @click="goHome">助农服务平台</div>
        </div>

        <div class="header-center">
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
        </div>

        <div class="header-right">
          <el-badge :value="cartCount" class="cart-badge">
            <el-button type="text" @click="goToCart">
              🛒 购物车
            </el-button>
          </el-badge>

          <el-dropdown>
            <span class="el-dropdown-link">
              <img :src="user.avatar" class="avatar" alt="用户头像" />
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>👤 {{ user.username }}</el-dropdown-item>
                <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 侧边栏 + 主体内容 -->
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <el-menu router unique-opened :collapse="isCollapse">
            <el-menu-item index="/customer/orders">
              <el-icon><IEpChecked /></el-icon>
              <span>我的订单</span>
            </el-menu-item>

            <el-menu-item index="/customer/cart">
              <el-icon><IEpGoodsFilled /></el-icon>
              <span>我的购物车</span>
            </el-menu-item>

            <el-menu-item index="/customer/profile">
              <el-icon><IEpAvatar /></el-icon>
              <span>个人资料</span>
            </el-menu-item>

            <el-menu-item>
              <el-icon @click="isCollapse = !isCollapse">
                <IEpExpand v-show="isCollapse" />
                <IEpFold v-show="!isCollapse" />
              </el-icon>
            </el-menu-item>

          </el-menu>
        </el-aside>
        
        <el-container>
          <el-main >
            <router-view />
          </el-main>
        </el-container>
      </el-container>


      <el-footer class="footer">
        <p>© 2025 助农服务平台 | 助力乡村振兴 | All Rights Reserved.</p>
      </el-footer>

    </el-container>
  </div>
</template>


<style lang="scss" scoped>
.layout{
    background-color: #f8f8f8;
}
.header {
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
    .logo-icon { width: 40px; height: 40px;}
    .logo-name { font-size: 20px; font-weight: 600; color:#2c3e50}
  }

  .header-center { 
    flex: 1; 
    display: flex; 
    justify-content: center; 
    .search-input { width: 350px; }
  }
  .header-right { display: flex; align-items: center; gap: 20px; }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
  }

  .cart-badge {
    .el-badge__content {
      background-color: #67c23a;
    }
  }
}

.el-aside{
  background-color: #fff;
  height: 100vh;
  .el-menu{
    background-color: #fff;
    border-right: none;
    width: 200px;
  }
}

.el-menu--collapse{
    width: 60px ;
}
.el-menu--collapse h1{
    display: none;
}

.el-footer {
    background-color: #f5f5f5;
    text-align: center;
    padding: 15px 0;
    font-size: 14px;
    color: #777;
    border-top: 1px solid #eaeaea;
  }

</style>