<script lang="ts" setup>
import { onMounted, ref} from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

const isCollapse = ref(false);

const username = ref(''); // 用户名
const dropdownVisible = ref(false); // 下拉菜单显示状态

// 获取用户信息
const getUsername = () => {
  const sessionUser = sessionStorage.getItem('username');
  if (sessionUser) {
    username.value = sessionUser;
  }
};

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    // 清除用户信息
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    
    ElMessage.success('退出成功');
    
    router.push('/');
  } catch {
    // 用户点击取消
    console.log('取消退出');
  }
};

// 切换下拉菜单
const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

// 点击其他地方关闭下拉菜单
const closeDropdown = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-dropdown')) {
    dropdownVisible.value = false;
  }
};

// 搜索关键词
const search = ref('')

// 搜索
const handleSearch = () => {
  if (!search.value.trim()) return
  router.push({ name: 'Search', query: { q: search.value } })
}

// 跳转函数
const goHome = () => {
    router.push('/customer');
}

onMounted(() => {
  getUsername();
  document.addEventListener('click', closeDropdown);
});
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
          <div class="user-info user-dropdown" @click="toggleDropdown">
            <div class="user-avatar">
              <el-avatar :size="32" :src="''">
                {{ username ? username.charAt(0).toUpperCase() : 'U' }}
              </el-avatar>
            </div>
            <span class="username">{{ username }}</span>
            <el-icon class="dropdown-arrow">
              <IEpArrowDown />
            </el-icon>
            
            <!-- 下拉菜单 -->
            <transition name="el-zoom-in-top">
              <div v-show="dropdownVisible" class="dropdown-menu">
                <div class="dropdown-item logout" @click="handleLogout">
                  <el-icon><IEpSwitchButton /></el-icon>
                  <span>退出登录</span>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </el-header>

      <!-- 侧边栏 + 主体内容 -->
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <el-menu router unique-opened :collapse="isCollapse">
            <el-menu-item index="/customer/cart">
              <el-icon><IEpGoodsFilled /></el-icon>
              <span>我的购物车</span>
            </el-menu-item>

            <el-menu-item index="/customer/orders">
              <el-icon><IEpChecked /></el-icon>
              <span>我的订单</span>
            </el-menu-item>

            <el-menu-item index="/customer/comment">
              <el-icon><IEpPromotion /></el-icon>
              <span>商品评价</span>
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
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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

  .header-right {
      display: flex;
      align-items: center;
      gap: 12px;

      .user-info {
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.3s;

        &:hover {
          background-color: #f5f5f5;
        }

        .user-avatar {
          display: flex;
          align-items: center;
        }

        .username {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .dropdown-arrow {
          color: #666;
          transition: transform 0.3s;
        }

        &:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          width: 120px;
          background: #fff;
          border: 1px solid #e4e7ed;
          border-radius: 4px;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
          z-index: 1000;
          margin-top: 4px;

          .dropdown-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 12px;
            cursor: pointer;
            transition: background-color 0.3s;
            font-size: 14px;

            &:hover {
              background-color: #f5f7fa;
            }

            &.logout {
              color: #f56c6c;

              &:hover {
                background-color: #fef0f0;
              }
            }
          }
        }
      }
    }
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